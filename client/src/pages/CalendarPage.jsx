import { addMonths, format, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import CalendarHeatmap from '../components/CalendarHeatmap.jsx';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api from '../services/api.js';
import { currency, dateLabel, pnlClass } from '../utils/formatters.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function CalendarPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(new Date());
  const [heatmap, setHeatmap] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dayTrades, setDayTrades] = useState([]);
  const code = user?.currency || 'USD';

  useEffect(() => {
    async function load() {
      const { data } = await api.get('/analytics/summary', {
        params: { month: month.getMonth() + 1, year: month.getFullYear() }
      });
      setHeatmap(data.calendarHeatmap || []);
    }
    load().catch((error) => toast.error(error.friendlyMessage));
  }, [month]);

  const openDay = async (day) => {
    const key = format(day, 'yyyy-MM-dd');
    setSelected(day);
    const { data } = await api.get('/trades', { params: { dateFrom: key, dateTo: key, limit: 100 } });
    setDayTrades(data.items);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Calendar"
        title="Trading calendar"
        description="Each day shows PnL and trade count. Open a day to review every trade from that session."
        actions={
          <>
            <button className="btn-secondary" onClick={() => setMonth((current) => subMonths(current, 1))}><ChevronLeft className="h-4 w-4" />Previous</button>
            <button className="btn-secondary" onClick={() => setMonth((current) => addMonths(current, 1))}>Next<ChevronRight className="h-4 w-4" /></button>
          </>
        }
      />
      <section className="glass-panel rounded-lg p-4">
        <div className="mb-4 text-lg font-semibold text-white">{format(month, 'MMMM yyyy')}</div>
        <CalendarHeatmap month={month} data={heatmap} onSelectDay={openDay} currencyCode={code} />
      </section>
      <Modal open={Boolean(selected)} title={selected ? dateLabel(selected) : 'Trades'} onClose={() => setSelected(null)}>
        <div className="space-y-3">
          {dayTrades.length ? dayTrades.map((trade) => (
            <div key={trade._id} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{trade.instrument} · {trade.setup || 'No setup'}</p>
                  <p className="mt-1 text-sm text-slate-500">{trade.direction} · {trade.result}</p>
                </div>
                <p className={`font-semibold ${pnlClass(trade.netProfit)}`}>{currency(trade.netProfit, code)}</p>
              </div>
            </div>
          )) : <p className="text-sm text-slate-500">No trades for this day.</p>}
        </div>
      </Modal>
    </div>
  );
}
