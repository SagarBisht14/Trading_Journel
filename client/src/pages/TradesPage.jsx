import { Copy, Download, Edit, Filter, RotateCcw, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import api, { API_URL } from '../services/api.js';
import { currency, dateLabel, number, pnlClass } from '../utils/formatters.js';
import { marketOptions, resultOptions, timeframes } from '../utils/tradeOptions.js';
import { useAuth } from '../context/AuthContext.jsx';

const initialFilters = {
  search: '',
  dateFrom: '',
  dateTo: '',
  month: '',
  year: '',
  instrument: '',
  strategy: '',
  setup: '',
  timeframe: '',
  result: '',
  pnlMin: '',
  pnlMax: '',
  rrMin: '',
  rrMax: '',
  broker: '',
  market: ''
};

export default function TradesPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ sortBy: 'tradeDate', sortOrder: 'desc' });
  const [payload, setPayload] = useState({ items: [], total: 0, pages: 1 });
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const code = user?.currency || 'USD';

  const params = useMemo(() => ({ ...filters, ...sort, page, limit: 12 }), [filters, page, sort]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/trades', { params });
      setPayload(data);
      setSelected([]);
    } catch (error) {
      toast.error(error.friendlyMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const download = async (type) => {
    const response = await fetch(`${API_URL}/api/trades/export/${type}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('tradepilot_token')}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = type === 'excel' ? 'trades.xls' : 'trades.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeTrade = async (id) => {
    try {
      await api.delete(`/trades/${id}`);
      toast((t) => (
        <div className="flex items-center gap-3">
          <span>Trade deleted.</span>
          <button
            className="rounded-md bg-brand px-2 py-1 text-xs font-semibold text-ink"
            onClick={async () => {
              await api.post(`/trades/${id}/restore`);
              toast.dismiss(t.id);
              load();
            }}
          >
            Undo
          </button>
        </div>
      ));
      load();
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  const duplicate = async (id) => {
    try {
      await api.post(`/trades/${id}/duplicate`);
      toast.success('Trade duplicated');
      load();
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    try {
      await api.post('/trades/bulk-delete', { ids: selected });
      toast.success('Selected trades deleted');
      load();
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  const toggleAll = (checked) => {
    setSelected(checked ? payload.items.map((trade) => trade._id) : []);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Trades"
        title="Advanced trade table"
        description="Search, filter, sort, export, duplicate, edit, delete, and bulk-manage your trade history."
        actions={
          <>
            <button className="btn-secondary" onClick={() => download('csv')}><Download className="h-4 w-4" />CSV</button>
            <button className="btn-secondary" onClick={() => download('excel')}><Download className="h-4 w-4" />Excel</button>
            <Link to="/app/trades/new" className="btn-primary">Add trade</Link>
          </>
        }
      />

      <section className="glass-panel mb-6 rounded-lg p-4">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Filter className="h-4 w-4 text-brand" />
          Advanced filters
        </div>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <FilterInput icon={Search} placeholder="Search" value={filters.search} onChange={(value) => updateFilter('search', value)} />
          <FilterInput type="date" value={filters.dateFrom} onChange={(value) => updateFilter('dateFrom', value)} />
          <FilterInput type="date" value={filters.dateTo} onChange={(value) => updateFilter('dateTo', value)} />
          <FilterInput placeholder="Month 1-12" value={filters.month} onChange={(value) => updateFilter('month', value)} />
          <FilterInput placeholder="Year" value={filters.year} onChange={(value) => updateFilter('year', value)} />
          <FilterInput placeholder="Instrument" value={filters.instrument} onChange={(value) => updateFilter('instrument', value)} />
          <FilterInput placeholder="Strategy" value={filters.strategy} onChange={(value) => updateFilter('strategy', value)} />
          <FilterInput placeholder="Setup" value={filters.setup} onChange={(value) => updateFilter('setup', value)} />
          <FilterSelect value={filters.timeframe} onChange={(value) => updateFilter('timeframe', value)} options={['', ...timeframes]} />
          <FilterSelect value={filters.result} onChange={(value) => updateFilter('result', value)} options={['', ...resultOptions]} />
          <FilterInput placeholder="PnL min" value={filters.pnlMin} onChange={(value) => updateFilter('pnlMin', value)} />
          <FilterInput placeholder="PnL max" value={filters.pnlMax} onChange={(value) => updateFilter('pnlMax', value)} />
          <FilterInput placeholder="RR min" value={filters.rrMin} onChange={(value) => updateFilter('rrMin', value)} />
          <FilterInput placeholder="RR max" value={filters.rrMax} onChange={(value) => updateFilter('rrMax', value)} />
          <FilterInput placeholder="Broker" value={filters.broker} onChange={(value) => updateFilter('broker', value)} />
          <FilterSelect value={filters.market} onChange={(value) => updateFilter('market', value)} options={['', ...marketOptions]} />
          <select className="input" value={`${sort.sortBy}:${sort.sortOrder}`} onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(':');
            setSort({ sortBy, sortOrder });
          }}>
            <option value="tradeDate:desc">Newest first</option>
            <option value="tradeDate:asc">Oldest first</option>
            <option value="netProfit:desc">PnL high to low</option>
            <option value="netProfit:asc">PnL low to high</option>
            <option value="rrRatio:desc">RR high to low</option>
          </select>
          <button className="btn-secondary" onClick={() => setFilters(initialFilters)}>Reset</button>
        </div>
      </section>

      {selected.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-bear/25 bg-bear/10 px-4 py-3">
          <span className="text-sm text-red-100">{selected.length} selected</span>
          <button className="btn-danger py-2" onClick={bulkDelete}><Trash2 className="h-4 w-4" />Bulk delete</button>
        </div>
      )}

      <section className="glass-panel overflow-hidden rounded-lg">
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="bg-white/[0.03]">
              <tr>
                <th className="table-th"><input type="checkbox" className="accent-brand" checked={payload.items.length > 0 && selected.length === payload.items.length} onChange={(event) => toggleAll(event.target.checked)} /></th>
                {['Date', 'Time', 'Instrument', 'Setup', 'Direction', 'Risk', 'Reward', 'PnL', 'RR', 'Status', 'Actions'].map((heading) => <th key={heading} className="table-th">{heading}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr><td colSpan="12" className="p-6 text-center text-sm text-slate-500">Loading trades...</td></tr>
              ) : payload.items.length ? (
                payload.items.map((trade) => (
                  <tr key={trade._id} className="hover:bg-white/[0.03]">
                    <td className="table-td"><input type="checkbox" className="accent-brand" checked={selected.includes(trade._id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, trade._id] : current.filter((id) => id !== trade._id))} /></td>
                    <td className="table-td">{dateLabel(trade.tradeDate)}</td>
                    <td className="table-td">{trade.tradeTime || '-'}</td>
                    <td className="table-td"><Link to={`/app/trades/${trade._id}`} className="font-semibold text-white hover:text-brand">{trade.instrument}</Link></td>
                    <td className="table-td">{trade.setup || '-'}</td>
                    <td className="table-td">{trade.direction}</td>
                    <td className="table-td">{currency(trade.riskAmount, code)}</td>
                    <td className="table-td">{currency(trade.rewardAmount, code)}</td>
                    <td className={`table-td font-semibold ${pnlClass(trade.netProfit)}`}>{currency(trade.netProfit, code)}</td>
                    <td className="table-td">{number(trade.rrRatio, 2)}</td>
                    <td className="table-td">{trade.result}</td>
                    <td className="table-td">
                      <div className="flex gap-1">
                        <Link className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" to={`/app/trades/${trade._id}/edit`} title="Edit"><Edit className="h-4 w-4" /></Link>
                        <button className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => duplicate(trade._id)} title="Duplicate"><Copy className="h-4 w-4" /></button>
                        <button className="rounded-md p-2 text-red-300 hover:bg-red-500/10" onClick={() => removeTrade(trade._id)} title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="12" className="p-8 text-center text-sm text-slate-500">No trades match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-sm text-slate-400">
          <span>{payload.total} trades</span>
          <div className="flex items-center gap-2">
            <button className="btn-secondary py-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><RotateCcw className="h-4 w-4" />Prev</button>
            <span>Page {page} of {payload.pages || 1}</span>
            <button className="btn-secondary py-2" disabled={page >= payload.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FilterInput({ icon: Icon, value, onChange, ...props }) {
  return (
    <div className="relative">
      {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />}
      <input className={`input ${Icon ? 'pl-9' : ''}`} value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => <option key={option} value={option}>{option || 'All'}</option>)}
    </select>
  );
}
