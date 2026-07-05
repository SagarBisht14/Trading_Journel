import { eachDayOfInterval, endOfMonth, format, isSameDay, startOfMonth } from 'date-fns';
import { currency, pnlClass } from '../utils/formatters.js';

export default function CalendarHeatmap({ month = new Date(), data = [], onSelectDay, currencyCode = 'USD' }) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  const lookup = new Map(data.map((item) => [item.label, item]));
  const blanks = Array.from({ length: start.getDay() });

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{day}</div>
      ))}
      {blanks.map((_, index) => <div key={`blank-${index}`} />)}
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const stat = lookup.get(key);
        const pnl = stat?.pnl || 0;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDay?.(day, stat)}
            className={`min-h-[92px] rounded-lg border p-2 text-left transition hover:border-brand/50 hover:bg-brand/10 ${
              pnl > 0 ? 'border-bull/20 bg-bull/10' : pnl < 0 ? 'border-bear/20 bg-bear/10' : 'border-white/10 bg-white/[0.03]'
            } ${isSameDay(day, new Date()) ? 'ring-1 ring-brand/40' : ''}`}
          >
            <span className="text-sm font-semibold text-white">{format(day, 'd')}</span>
            {stat ? (
              <div className="mt-4">
                <p className={`text-sm font-semibold ${pnlClass(pnl)}`}>{currency(pnl, currencyCode)}</p>
                <p className="mt-1 text-xs text-slate-500">{stat.trades} trades</p>
              </div>
            ) : (
              <p className="mt-5 text-xs text-slate-600">No trades</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
