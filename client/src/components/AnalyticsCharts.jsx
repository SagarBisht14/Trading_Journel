import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const grid = 'rgba(148, 163, 184, 0.08)';
const text = '#94a3b8';

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: text, boxWidth: 10, usePointStyle: true } },
    tooltip: {
      backgroundColor: '#0b111c',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      titleColor: '#e5eefc',
      bodyColor: '#cbd5e1'
    }
  },
  scales: {
    x: { ticks: { color: text }, grid: { color: grid } },
    y: { ticks: { color: text }, grid: { color: grid } }
  }
};

export function EquityCurveChart({ data = [] }) {
  return (
    <Line
      options={{
        ...baseOptions,
        elements: { point: { radius: 0, hitRadius: 12 } }
      }}
      data={{
        labels: data.map((item) => item.date),
        datasets: [
          {
            label: 'Equity',
            data: data.map((item) => item.equity),
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.14)',
            fill: true,
            tension: 0.35
          }
        ]
      }}
    />
  );
}

export function PnlBarChart({ data = [], label = 'PnL' }) {
  return (
    <Bar
      options={baseOptions}
      data={{
        labels: data.map((item) => item.label),
        datasets: [
          {
            label,
            data: data.map((item) => item.pnl),
            backgroundColor: data.map((item) => (Number(item.pnl) >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.72)')),
            borderRadius: 6
          }
        ]
      }}
    />
  );
}

export function GroupPerformanceChart({ data = [], label = 'Performance', valueKey = 'pnl' }) {
  return (
    <Bar
      options={{ ...baseOptions, indexAxis: 'y' }}
      data={{
        labels: data.slice(0, 10).map((item) => item.label),
        datasets: [
          {
            label,
            data: data.slice(0, 10).map((item) => item[valueKey]),
            backgroundColor: data.slice(0, 10).map((item) => (Number(item[valueKey]) >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.72)')),
            borderRadius: 6
          }
        ]
      }}
    />
  );
}

export function WinLossChart({ wins = 0, losses = 0, breakeven = 0 }) {
  return (
    <Doughnut
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: baseOptions.plugins
      }}
      data={{
        labels: ['Wins', 'Losses', 'Break-even'],
        datasets: [
          {
            data: [wins, losses, breakeven],
            backgroundColor: ['#22c55e', '#ef4444', '#64748b'],
            borderColor: '#0b111c',
            borderWidth: 4
          }
        ]
      }}
    />
  );
}
