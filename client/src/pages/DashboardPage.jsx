import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Flame,
  LineChart,
  Percent,
  Sigma,
  Trophy,
  WalletCards
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CalendarHeatmap from '../components/CalendarHeatmap.jsx';
import ChartCard from '../components/ChartCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { EquityCurveChart, PnlBarChart } from '../components/AnalyticsCharts.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { currency, dateLabel, minutesLabel, number, percent, pnlClass } from '../utils/formatters.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get('/analytics/summary');
        setAnalytics(data);
      } catch (error) {
        toast.error(error.friendlyMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const s = analytics?.summary || {};
  const code = user?.currency || 'USD';
  const stats = [
    ['Today PnL', currency(s.todayPnl, code), s.todayPnl, WalletCards, 'pnl', 'brand'],
    ['Weekly PnL', currency(s.weeklyPnl, code), s.weeklyPnl, LineChart, 'pnl', 'bull'],
    ['Monthly PnL', currency(s.monthlyPnl, code), s.monthlyPnl, Activity, 'pnl', 'brand'],
    ['Total Trades', number(s.totalTrades, 0), s.totalTrades, Sigma, null, 'brand'],
    ['Win Rate', percent(s.winRate), s.winRate, Percent, null, 'bull'],
    ['Average RR', number(s.averageRR, 2), s.averageRR, Trophy, null, 'warn'],
    ['Profit Factor', number(s.profitFactor, 2), s.profitFactor, ArrowUpRight, null, 'bull'],
    ['Expectancy', currency(s.expectancy, code), s.expectancy, ArrowDownRight, 'pnl', 'brand'],
    ['Winning Streak', number(s.currentWinningStreak, 0), s.currentWinningStreak, Flame, null, 'bull'],
    ['Losing Streak', number(s.currentLosingStreak, 0), s.currentLosingStreak, Flame, null, 'bear'],
    ['Largest Win', currency(s.largestWin, code), s.largestWin, ArrowUpRight, 'pnl', 'bull'],
    ['Largest Loss', currency(s.largestLoss, code), s.largestLoss, ArrowDownRight, 'pnl', 'bear'],
    ['Avg Holding Time', minutesLabel(s.averageHoldingTime), s.averageHoldingTime, Clock, null, 'brand'],
    ['Best Day', s.bestTradingDay ? currency(s.bestTradingDay.pnl, code) : currency(0, code), s.bestTradingDay?.pnl || 0, Trophy, 'pnl', 'bull'],
    ['Worst Day', s.worstTradingDay ? currency(s.worstTradingDay.pnl, code) : currency(0, code), s.worstTradingDay?.pnl || 0, ArrowDownRight, 'pnl', 'bear']
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title={`Good to see you, ${user?.username || 'Trader'}`}
        description="Track execution quality, PnL behavior, and the patterns that matter after the market closes."
        actions={<Link to="/app/trades/new" className="btn-primary">Add trade</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value, rawValue, Icon, trend, accent]) => (
          <StatCard key={label} label={label} value={value} rawValue={rawValue} icon={Icon} trend={trend} accent={accent} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <ChartCard title="Performance Graph" subtitle="Cumulative equity curve from closed trades">
          {analytics?.performanceGraph?.length ? <EquityCurveChart data={analytics.performanceGraph} /> : <EmptyState title="No equity curve yet" description="Add trades to see your curve build." actionLabel="Add trade" actionTo="/app/trades/new" />}
        </ChartCard>
        <ChartCard title="Monthly Profit Chart" subtitle="PnL grouped by calendar month">
          {analytics?.monthlyProfitChart?.length ? <PnlBarChart data={analytics.monthlyProfitChart} label="Monthly PnL" /> : <EmptyState title="No monthly data" description="Monthly performance appears after trades are logged." />}
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <section className="glass-panel rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="section-title">Calendar Heatmap</h2>
              <p className="mt-1 text-sm text-slate-500">Daily PnL and trade count</p>
            </div>
            <Link to="/app/calendar" className="btn-secondary py-2">Open calendar</Link>
          </div>
          <CalendarHeatmap data={analytics?.calendarHeatmap || []} currencyCode={code} />
        </section>
        <section className="glass-panel rounded-lg p-4">
          <h2 className="section-title">AI Insights</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(analytics?.insights || {}).filter(([key]) => key !== 'suggestions').map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
                <span className="text-sm capitalize text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-right text-sm font-semibold text-white">{String(value)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-brand/20 bg-brand/10 p-4">
            <p className="text-sm font-semibold text-sky-100">Suggestions</p>
            <ul className="mt-2 space-y-2 text-sm leading-6 text-sky-100/85">
              {(analytics?.insights?.suggestions || []).map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </section>
      </div>

      <section className="glass-panel mt-6 overflow-hidden rounded-lg">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="section-title">Recent Trades</h2>
            <p className="mt-1 text-sm text-slate-500">Latest logged trades</p>
          </div>
          <Link to="/app/trades" className="btn-secondary py-2">View all</Link>
        </div>
        {analytics?.recentTrades?.length ? (
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03]">
                <tr>
                  {['Date', 'Instrument', 'Setup', 'Direction', 'PnL', 'RR', 'Status'].map((heading) => <th key={heading} className="table-th">{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {analytics.recentTrades.map((trade) => (
                  <tr key={trade._id} className="hover:bg-white/[0.03]">
                    <td className="table-td">{dateLabel(trade.tradeDate)}</td>
                    <td className="table-td font-semibold text-white">{trade.instrument}</td>
                    <td className="table-td">{trade.setup || '-'}</td>
                    <td className="table-td">{trade.direction}</td>
                    <td className={`table-td font-semibold ${pnlClass(trade.netProfit)}`}>{currency(trade.netProfit, code)}</td>
                    <td className="table-td">{number(trade.rrRatio, 2)}</td>
                    <td className="table-td">{trade.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState title="No trades yet" description="Your recent trades will appear here after the first entry." actionLabel="Add trade" actionTo="/app/trades/new" />
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-lg bg-white/[0.05]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-lg bg-white/[0.05]" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg bg-white/[0.05]" />
        <div className="h-80 animate-pulse rounded-lg bg-white/[0.05]" />
      </div>
    </div>
  );
}
