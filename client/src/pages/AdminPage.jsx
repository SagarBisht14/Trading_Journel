import { BarChart3, Eye, ShieldCheck, Users, WalletCards } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import { currency, dateLabel, number, pnlClass } from '../utils/formatters.js';

export default function AdminPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  const loadOverview = useCallback(async () => {
    const { data } = await api.get('/admin/overview');
    setOverview(data);
  }, []);

  const loadUsers = useCallback(async (value = '') => {
    const { data } = await api.get('/admin/users', { params: { search: value } });
    setUsers(data.items || []);
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    loadOverview();
    loadUsers();
  }, [loadOverview, loadUsers, user?.role]);

  const openClient = async (client) => {
    setLoadingData(true);
    try {
      const { data } = await api.get(`/admin/users/${client.id}/data`);
      setSelected(data);
    } catch (error) {
      toast.error(error.friendlyMessage);
    } finally {
      setLoadingData(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div>
        <PageHeader eyebrow="Admin" title="Admin access required" description="This area is only visible to accounts created with the admin setup secret." />
        <section className="glass-panel rounded-lg p-6 text-sm text-slate-400">Your current account is a client account.</section>
      </div>
    );
  }

  const stats = [
    ['Total Users', number(overview?.totalUsers, 0), Users, 'brand'],
    ['Client Users', number(overview?.clientUsers, 0), Users, 'bull'],
    ['Admin Users', number(overview?.adminUsers, 0), ShieldCheck, 'warn'],
    ['Active Trades', number(overview?.activeTrades, 0), BarChart3, 'brand'],
    ['Total Client PnL', currency(overview?.totalPnl || 0), WalletCards, 'bull', overview?.totalPnl || 0]
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Client data monitor"
        description="View all registered clients and inspect their trades, journals, watchlists, goals, playbooks, notes, and analytics."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value, Icon, accent, rawValue]) => (
          <StatCard key={label} label={label} value={value} rawValue={rawValue} icon={Icon} accent={accent} trend={label.includes('PnL') ? 'pnl' : undefined} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-panel overflow-hidden rounded-lg">
          <div className="border-b border-white/10 p-4">
            <h2 className="section-title">Clients</h2>
            <div className="mt-4 flex gap-2">
              <input className="input" placeholder="Search username or email" value={search} onChange={(event) => setSearch(event.target.value)} />
              <button className="btn-secondary" onClick={() => loadUsers(search)}>Search</button>
            </div>
          </div>
          <div className="max-h-[680px] overflow-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03]">
                <tr>
                  {['User', 'Role', 'Trades', 'PnL', 'Last Trade', ''].map((heading) => <th key={heading} className="table-th">{heading}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((client) => (
                  <tr key={client.id} className="hover:bg-white/[0.03]">
                    <td className="table-td">
                      <p className="font-semibold text-white">{client.username}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </td>
                    <td className="table-td capitalize">{client.role}</td>
                    <td className="table-td">{client.stats?.trades || 0}</td>
                    <td className={`table-td font-semibold ${pnlClass(client.stats?.pnl)}`}>{currency(client.stats?.pnl || 0)}</td>
                    <td className="table-td">{dateLabel(client.stats?.lastTrade)}</td>
                    <td className="table-td">
                      <button className="btn-secondary py-2" onClick={() => openClient(client)}>
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <ClientDataPanel selected={selected} loading={loadingData} />
      </div>
    </div>
  );
}

function ClientDataPanel({ selected, loading }) {
  if (loading) return <section className="h-[680px] animate-pulse rounded-lg bg-white/[0.05]" />;
  if (!selected) {
    return (
      <section className="glass-panel rounded-lg p-6">
        <h2 className="section-title">Client detail</h2>
        <p className="mt-3 text-sm text-slate-500">Select a client to inspect their complete journal data.</p>
      </section>
    );
  }

  const code = selected.user?.currency || 'USD';
  const summary = selected.analytics?.summary || {};
  const data = selected.data || {};

  return (
    <section className="glass-panel rounded-lg p-5">
      <div className="mb-5">
        <h2 className="section-title">{selected.user.username}</h2>
        <p className="mt-1 text-sm text-slate-500">{selected.user.email} · {selected.user.timezone}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniStat label="Trades" value={summary.totalTrades || 0} />
        <MiniStat label="Win Rate" value={`${number(summary.winRate || 0, 1)}%`} />
        <MiniStat label="Total PnL" value={currency(summary.totalPnl || 0, code)} className={pnlClass(summary.totalPnl)} />
      </div>

      <DataSection title="Trades" items={data.trades} render={(trade) => (
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-white">{trade.instrument} · {trade.setup || 'No setup'}</p>
            <p className="text-xs text-slate-500">{dateLabel(trade.tradeDate)} · {trade.direction} · {trade.result}</p>
          </div>
          <p className={`font-semibold ${pnlClass(trade.netProfit)}`}>{currency(trade.netProfit, code)}</p>
        </div>
      )} />
      <DataSection title="Journals" items={data.journals} render={(item) => <TextItem title={dateLabel(item.date)} text={item.reflection || item.lessons || item.marketBias} />} />
      <DataSection title="Watchlist" items={data.watchlist} render={(item) => <TextItem title={`${item.instrument} · ${item.status}`} text={item.reason || item.notes} />} />
      <DataSection title="Goals" items={data.goals} render={(item) => <TextItem title={`${item.type} · ${item.title}`} text={item.completed ? 'Completed' : item.description} />} />
      <DataSection title="Playbooks" items={data.playbooks} render={(item) => <TextItem title={item.title} text={item.description || item.rules} />} />
      <DataSection title="Notes" items={data.notes} render={(item) => <TextItem title={item.title} text={(item.content || '').replace(/<[^>]+>/g, ' ')} />} />
    </section>
  );
}

function MiniStat({ label, value, className = 'text-white' }) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${className}`}>{value}</p>
    </div>
  );
}

function DataSection({ title, items = [], render }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</h3>
      <div className="mt-3 max-h-64 space-y-2 overflow-auto">
        {items.length ? items.map((item) => (
          <div key={item._id} className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
            {render(item)}
          </div>
        )) : <p className="text-sm text-slate-600">No {title.toLowerCase()} found.</p>}
      </div>
    </div>
  );
}

function TextItem({ title, text }) {
  return (
    <div>
      <p className="font-semibold text-white">{title}</p>
      <p className="mt-1 line-clamp-3 text-sm text-slate-400">{text || 'No details.'}</p>
    </div>
  );
}
