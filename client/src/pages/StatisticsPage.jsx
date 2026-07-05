import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import ChartCard from '../components/ChartCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { EquityCurveChart, GroupPerformanceChart, PnlBarChart, WinLossChart } from '../components/AnalyticsCharts.jsx';
import api from '../services/api.js';

export default function StatisticsPage() {
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

  const d = analytics?.distributions || {};
  const resultCounts = Object.fromEntries((d.result || []).map((item) => [item.label, item.trades]));
  const wins = resultCounts.Win || 0;
  const losses = resultCounts.Loss || 0;
  const breakeven = resultCounts['Break-even'] || 0;

  return (
    <div>
      <PageHeader
        eyebrow="Statistics"
        title="Advanced analytics"
        description="Break down performance by time, setup, strategy, instrument, direction, risk, and holding behavior."
      />
      {loading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-80 animate-pulse rounded-lg bg-white/[0.05]" />)}
        </div>
      ) : analytics?.summary?.totalTrades ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Equity Curve"><EquityCurveChart data={analytics.performanceGraph} /></ChartCard>
          <ChartCard title="Daily PnL"><PnlBarChart data={d.daily || []} label="Daily PnL" /></ChartCard>
          <ChartCard title="Weekly PnL"><PnlBarChart data={d.weekly || []} label="Weekly PnL" /></ChartCard>
          <ChartCard title="Monthly PnL"><PnlBarChart data={d.monthly || []} label="Monthly PnL" /></ChartCard>
          <ChartCard title="Yearly PnL"><PnlBarChart data={d.yearly || []} label="Yearly PnL" /></ChartCard>
          <ChartCard title="Win Rate"><WinLossChart wins={wins} losses={losses} breakeven={breakeven} /></ChartCard>
          <ChartCard title="Strategy Performance"><GroupPerformanceChart data={d.strategy || []} /></ChartCard>
          <ChartCard title="Instrument Performance"><GroupPerformanceChart data={d.instrument || []} /></ChartCard>
          <ChartCard title="Setup Performance"><GroupPerformanceChart data={d.setup || []} /></ChartCard>
          <ChartCard title="Long vs Short"><GroupPerformanceChart data={d.longShort || []} /></ChartCard>
          <ChartCard title="Risk Distribution"><PnlBarChart data={d.risk || []} label="PnL by risk" /></ChartCard>
          <ChartCard title="Trade Frequency"><PnlBarChart data={d.timeOfDay || []} label="Time of day PnL" /></ChartCard>
          <ChartCard title="Day of Week Performance"><PnlBarChart data={d.dayOfWeek || []} label="Day PnL" /></ChartCard>
          <ChartCard title="Month Performance"><PnlBarChart data={d.monthly || []} label="Month PnL" /></ChartCard>
          <ChartCard title="Holding Time Analysis"><PnlBarChart data={d.holdingTime || []} label="Holding time PnL" /></ChartCard>
          <ChartCard title="Average RR by Setup"><GroupPerformanceChart data={d.setup || []} label="Average RR" valueKey="avgRR" /></ChartCard>
        </div>
      ) : (
        <EmptyState title="No statistics yet" description="Add trades to unlock analytics." actionLabel="Add trade" actionTo="/app/trades/new" />
      )}
    </div>
  );
}
