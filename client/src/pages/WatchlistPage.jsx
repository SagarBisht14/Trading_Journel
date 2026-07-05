import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import { useResource } from '../hooks/useResource.js';

const blank = { instrument: '', reason: '', target: '', invalidation: '', notes: '', status: 'Watching' };

export default function WatchlistPage() {
  const { items, create, update, remove } = useResource('/watchlist');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    try {
      editing ? await update(editing, form) : await create(form);
      toast.success(editing ? 'Watchlist item updated' : 'Watchlist item added');
      setForm(blank);
      setEditing(null);
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Watchlist" title="Trade ideas watchlist" description="Track instruments, reasons, targets, invalidation levels, and status." />
      <form onSubmit={submit} className="glass-panel rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Instrument" value={form.instrument} onChange={(value) => setForm({ ...form, instrument: value })} required />
          <Input label="Target" value={form.target} onChange={(value) => setForm({ ...form, target: value })} />
          <Input label="Invalidation" value={form.invalidation} onChange={(value) => setForm({ ...form, invalidation: value })} />
          <select className="input" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
            {['Watching', 'Triggered', 'Invalidated', 'Archived'].map((status) => <option key={status}>{status}</option>)}
          </select>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Textarea label="Reason" value={form.reason} onChange={(value) => setForm({ ...form, reason: value })} />
          <Textarea label="Notes" value={form.notes} onChange={(value) => setForm({ ...form, notes: value })} />
        </div>
        <button className="btn-primary mt-4">{editing ? 'Update idea' : 'Add idea'}</button>
      </form>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item._id} className="glass-panel rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{item.instrument}</p>
                <p className="mt-1 text-sm text-brand">{item.status}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => { setEditing(item._id); setForm({ ...blank, ...item }); }}><Edit className="h-4 w-4" /></button>
                <button className="rounded-md p-2 text-red-300 hover:bg-red-500/10" onClick={() => remove(item._id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <p><span className="text-slate-500">Target:</span> {item.target || '-'}</p>
              <p><span className="text-slate-500">Invalidation:</span> {item.invalidation || '-'}</p>
              <p>{item.reason || item.notes || 'No notes added.'}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value || ''} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea className="input min-h-[120px]" value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
