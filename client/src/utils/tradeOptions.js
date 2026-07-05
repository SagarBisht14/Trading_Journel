export const marketOptions = ['Forex', 'Crypto', 'Stocks', 'Futures', 'Indices'];
export const directionOptions = ['Long', 'Short'];
export const resultOptions = ['Win', 'Loss', 'Break-even'];
export const screenshotTypes = ['Before Entry', 'After Entry', 'Exit', 'TradingView Chart', 'MT5 Screenshot', 'Broker Screenshot'];
export const moods = ['Calm', 'Focused', 'Neutral', 'Anxious', 'Impulsive', 'Tired', 'Confident'];
export const timeframes = ['1m', '3m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];

export const defaultTrade = {
  tradeDate: new Date().toISOString().slice(0, 10),
  tradeTime: '',
  instrument: '',
  market: 'Stocks',
  broker: '',
  strategy: '',
  setup: '',
  timeframe: '1H',
  direction: 'Long',
  entryPrice: '',
  stopLoss: '',
  takeProfit: '',
  exitPrice: '',
  riskAmount: '',
  rewardAmount: '',
  rrRatio: '',
  positionSize: '',
  fees: '',
  slippage: '',
  grossProfit: '',
  netProfit: '',
  tradeDuration: '',
  result: 'Break-even',
  emotionBefore: '',
  emotionDuring: '',
  emotionAfter: '',
  confidenceRating: 5,
  mistakeCategory: '',
  lessonsLearned: '',
  notes: '',
  didFollowPlan: false,
  wasEntryValid: false,
  wasExitValid: false,
  didRevengeTrade: false,
  wasNewsInvolved: false,
  sleepQuality: '',
  mood: ''
};
