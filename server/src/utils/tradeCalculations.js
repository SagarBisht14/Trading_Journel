import { dayKey, toNumber } from './parsers.js';

export function normalizeTradeFinancials(data) {
  const entry = toNumber(data.entryPrice);
  const exit = toNumber(data.exitPrice);
  const stop = toNumber(data.stopLoss);
  const target = toNumber(data.takeProfit);
  const position = Math.abs(toNumber(data.positionSize));
  const fees = toNumber(data.fees);
  const slippage = toNumber(data.slippage);
  const risk = toNumber(data.riskAmount);
  const reward = toNumber(data.rewardAmount);

  if (!data.rrRatio && risk > 0 && reward > 0) {
    data.rrRatio = Number((reward / risk).toFixed(2));
  }

  if (!data.riskAmount && entry && stop && position) {
    data.riskAmount = Number((Math.abs(entry - stop) * position).toFixed(2));
  }

  if (!data.rewardAmount && entry && target && position) {
    data.rewardAmount = Number((Math.abs(target - entry) * position).toFixed(2));
  }

  if (data.grossProfit === undefined || data.grossProfit === null || data.grossProfit === '') {
    if (entry && exit && position) {
      const multiplier = data.direction === 'Short' ? -1 : 1;
      data.grossProfit = Number(((exit - entry) * position * multiplier).toFixed(2));
    }
  }

  if (data.netProfit === undefined || data.netProfit === null || data.netProfit === '') {
    data.netProfit = Number((toNumber(data.grossProfit) - fees - slippage).toFixed(2));
  }

  if (!data.result && data.netProfit !== undefined) {
    if (data.netProfit > 0) data.result = 'Win';
    if (data.netProfit < 0) data.result = 'Loss';
    if (data.netProfit === 0) data.result = 'Break-even';
  }

  return data;
}

export function computeAnalytics(trades = []) {
  const activeTrades = trades
    .filter((trade) => !trade.deletedAt)
    .map((trade) => (typeof trade.toObject === 'function' ? trade.toObject() : trade));

  const today = dayKey(new Date());
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sum = (items) => Number(items.reduce((acc, trade) => acc + toNumber(trade.netProfit), 0).toFixed(2));
  const wins = activeTrades.filter((trade) => toNumber(trade.netProfit) > 0);
  const losses = activeTrades.filter((trade) => toNumber(trade.netProfit) < 0);
  const closed = activeTrades.filter((trade) => ['Win', 'Loss', 'Break-even'].includes(trade.result) || trade.exitPrice);
  const grossWins = sum(wins);
  const grossLosses = Math.abs(sum(losses));
  const totalPnl = sum(activeTrades);

  const sortedAsc = [...activeTrades].sort((a, b) => new Date(a.tradeDate) - new Date(b.tradeDate));
  const sortedDesc = [...activeTrades].sort((a, b) => new Date(b.tradeDate) - new Date(a.tradeDate));
  const recentTrades = sortedDesc.slice(0, 8);

  let currentWinningStreak = 0;
  let currentLosingStreak = 0;
  for (const trade of sortedDesc) {
    const pnl = toNumber(trade.netProfit);
    if (pnl > 0 && currentLosingStreak === 0) currentWinningStreak += 1;
    else if (pnl < 0 && currentWinningStreak === 0) currentLosingStreak += 1;
    else if (pnl !== 0) break;
  }

  const dailyMap = new Map();
  const monthlyMap = new Map();
  const strategyMap = new Map();
  const instrumentMap = new Map();
  const setupMap = new Map();
  const timeframeMap = new Map();
  const mistakeMap = new Map();
  const resultMap = new Map();
  const dayOfWeekMap = new Map();
  const hourMap = new Map();
  const holdingBuckets = new Map();
  const riskBuckets = new Map();
  const longShortMap = new Map();

  const addToMap = (map, key, trade) => {
    if (!key) return;
    const current = map.get(key) || { label: key, pnl: 0, trades: 0, wins: 0, losses: 0, rrTotal: 0 };
    const pnl = toNumber(trade.netProfit);
    current.pnl = Number((current.pnl + pnl).toFixed(2));
    current.trades += 1;
    current.wins += pnl > 0 ? 1 : 0;
    current.losses += pnl < 0 ? 1 : 0;
    current.rrTotal += toNumber(trade.rrRatio);
    current.avgRR = Number((current.rrTotal / current.trades).toFixed(2));
    current.winRate = Number(((current.wins / current.trades) * 100).toFixed(1));
    map.set(key, current);
  };

  for (const trade of activeTrades) {
    const date = new Date(trade.tradeDate);
    const key = dayKey(date);
    const monthKey = Number.isNaN(date.getTime()) ? null : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    addToMap(dailyMap, key, trade);
    addToMap(monthlyMap, monthKey, trade);
    addToMap(strategyMap, trade.strategy || 'Unassigned', trade);
    addToMap(instrumentMap, trade.instrument || 'Unassigned', trade);
    addToMap(setupMap, trade.setup || 'Unassigned', trade);
    addToMap(timeframeMap, trade.timeframe || 'Unassigned', trade);
    addToMap(mistakeMap, trade.mistakeCategory || 'None', trade);
    addToMap(resultMap, trade.result || 'Break-even', trade);
    addToMap(longShortMap, trade.direction || 'Unassigned', trade);
    if (!Number.isNaN(date.getTime())) addToMap(dayOfWeekMap, date.toLocaleDateString('en-US', { weekday: 'short' }), trade);
    if (trade.tradeTime) addToMap(hourMap, `${trade.tradeTime.slice(0, 2)}:00`, trade);

    const duration = toNumber(trade.tradeDuration);
    const bucket = duration <= 30 ? '<30m' : duration <= 120 ? '30m-2h' : duration <= 480 ? '2h-8h' : '8h+';
    addToMap(holdingBuckets, bucket, trade);

    const risk = toNumber(trade.riskAmount);
    const riskBucket = risk <= 50 ? '$0-50' : risk <= 250 ? '$51-250' : risk <= 1000 ? '$251-1000' : '$1000+';
    addToMap(riskBuckets, riskBucket, trade);
  }

  let equity = 0;
  const performanceGraph = sortedAsc.map((trade) => {
    equity = Number((equity + toNumber(trade.netProfit)).toFixed(2));
    return { date: dayKey(trade.tradeDate), pnl: toNumber(trade.netProfit), equity };
  });

  const dailyStats = [...dailyMap.values()].sort((a, b) => a.label.localeCompare(b.label));
  const monthlyStats = [...monthlyMap.values()].sort((a, b) => a.label.localeCompare(b.label));
  const bestTradingDay = dailyStats.reduce((best, item) => (!best || item.pnl > best.pnl ? item : best), null);
  const worstTradingDay = dailyStats.reduce((worst, item) => (!worst || item.pnl < worst.pnl ? item : worst), null);

  const avg = (items, key) => {
    if (!items.length) return 0;
    return Number((items.reduce((acc, item) => acc + toNumber(item[key]), 0) / items.length).toFixed(2));
  };

  const todayPnl = sum(activeTrades.filter((trade) => dayKey(trade.tradeDate) === today));
  const weeklyPnl = sum(activeTrades.filter((trade) => new Date(trade.tradeDate) >= startOfWeek));
  const monthlyPnl = sum(activeTrades.filter((trade) => new Date(trade.tradeDate) >= startOfMonth));
  const winRate = closed.length ? Number(((wins.length / closed.length) * 100).toFixed(1)) : 0;
  const profitFactor = grossLosses ? Number((grossWins / grossLosses).toFixed(2)) : grossWins > 0 ? grossWins : 0;

  const sortedGroup = (map) => [...map.values()].sort((a, b) => b.pnl - a.pnl);
  const bestBy = (map) => sortedGroup(map)[0] || null;
  const worstBy = (map) => sortedGroup(map).at(-1) || null;
  const winningEmotion = wins.map((trade) => trade.emotionBefore).filter(Boolean);
  const losingEmotion = losses.map((trade) => trade.emotionBefore).filter(Boolean);
  const topFrequency = (values) => {
    const counts = values.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Not enough data';
  };

  const drawdown = performanceGraph.reduce(
    (state, point) => {
      const peak = Math.max(state.peak, point.equity);
      const dd = Number((peak - point.equity).toFixed(2));
      return { peak, max: Math.max(state.max, dd) };
    },
    { peak: 0, max: 0 }
  ).max;

  return {
    summary: {
      todayPnl,
      weeklyPnl,
      monthlyPnl,
      totalPnl,
      totalTrades: activeTrades.length,
      winRate,
      averageRR: avg(activeTrades, 'rrRatio'),
      profitFactor,
      expectancy: activeTrades.length ? Number((totalPnl / activeTrades.length).toFixed(2)) : 0,
      currentWinningStreak,
      currentLosingStreak,
      largestWin: wins.length ? Math.max(...wins.map((trade) => toNumber(trade.netProfit))) : 0,
      largestLoss: losses.length ? Math.min(...losses.map((trade) => toNumber(trade.netProfit))) : 0,
      averageHoldingTime: avg(activeTrades, 'tradeDuration'),
      bestTradingDay,
      worstTradingDay,
      averageWin: avg(wins, 'netProfit'),
      averageLoss: avg(losses, 'netProfit'),
      drawdown
    },
    recentTrades,
    performanceGraph,
    calendarHeatmap: dailyStats,
    monthlyProfitChart: monthlyStats,
    distributions: {
      daily: dailyStats,
      weekly: groupByWeek(activeTrades),
      monthly: monthlyStats,
      yearly: groupByYear(activeTrades),
      strategy: sortedGroup(strategyMap),
      instrument: sortedGroup(instrumentMap),
      setup: sortedGroup(setupMap),
      timeframe: sortedGroup(timeframeMap),
      mistake: sortedGroup(mistakeMap),
      result: sortedGroup(resultMap),
      dayOfWeek: [...dayOfWeekMap.values()],
      timeOfDay: [...hourMap.values()].sort((a, b) => a.label.localeCompare(b.label)),
      holdingTime: [...holdingBuckets.values()],
      risk: [...riskBuckets.values()],
      longShort: [...longShortMap.values()]
    },
    insights: {
      mostProfitableSetup: bestBy(setupMap)?.label || 'Not enough data',
      worstSetup: worstBy(setupMap)?.label || 'Not enough data',
      bestDay: bestTradingDay?.label || 'Not enough data',
      worstDay: worstTradingDay?.label || 'Not enough data',
      averageEmotionBeforeWinningTrades: topFrequency(winningEmotion),
      averageEmotionBeforeLosingTrades: topFrequency(losingEmotion),
      mostCommonMistake: bestBy(mistakeMap)?.label || 'None',
      averageRR: avg(activeTrades, 'rrRatio'),
      averageHoldingTime: avg(activeTrades, 'tradeDuration'),
      bestTimeframe: bestBy(timeframeMap)?.label || 'Not enough data',
      bestInstrument: bestBy(instrumentMap)?.label || 'Not enough data',
      bestStrategy: bestBy(strategyMap)?.label || 'Not enough data',
      suggestions: buildSuggestions({ winRate, profitFactor, drawdown, worstSetup: worstBy(setupMap), commonMistake: bestBy(mistakeMap) })
    }
  };
}

function groupByWeek(trades) {
  const map = new Map();
  for (const trade of trades) {
    const date = new Date(trade.tradeDate);
    if (Number.isNaN(date.getTime())) continue;
    const firstDay = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil((((date - firstDay) / 86400000) + firstDay.getDay() + 1) / 7);
    const key = `${date.getFullYear()} W${String(week).padStart(2, '0')}`;
    const current = map.get(key) || { label: key, pnl: 0, trades: 0 };
    current.pnl = Number((current.pnl + toNumber(trade.netProfit)).toFixed(2));
    current.trades += 1;
    map.set(key, current);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function groupByYear(trades) {
  const map = new Map();
  for (const trade of trades) {
    const year = new Date(trade.tradeDate).getFullYear();
    if (!year) continue;
    const current = map.get(year) || { label: String(year), pnl: 0, trades: 0 };
    current.pnl = Number((current.pnl + toNumber(trade.netProfit)).toFixed(2));
    current.trades += 1;
    map.set(year, current);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

function buildSuggestions({ winRate, profitFactor, drawdown, worstSetup, commonMistake }) {
  const suggestions = [];
  if (winRate < 45) suggestions.push('Review losing trades by setup and tighten entry criteria before increasing size.');
  if (profitFactor < 1.2) suggestions.push('Prioritize trades with cleaner reward-to-risk and reduce marginal setups.');
  if (drawdown > 0) suggestions.push('Track drawdown after each session and reduce risk after consecutive losses.');
  if (worstSetup?.label) suggestions.push(`Audit the ${worstSetup.label} setup and pause it until rules are clarified.`);
  if (commonMistake?.label && commonMistake.label !== 'None') suggestions.push(`Add a pre-entry checklist item for ${commonMistake.label}.`);
  if (!suggestions.length) suggestions.push('Your metrics look stable. Keep tagging trades consistently to sharpen the edge.');
  return suggestions;
}
