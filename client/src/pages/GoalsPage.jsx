import { CheckCircle2, Circle, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import { useResource } from '../hooks/useResource.js';
import { dateLabel } from '../utils/formatters.js';

const blank = { type: 'Daily', title: '', description: '', targetDate: new Date().toISOString().slice(0, 10), completed: false };

export default function GoalsPage() {
  const { items, create, update, remove } = useResource('/goals');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    try {
      editing ? await update(editing, form) : await create(form);
      toast.success(editing ? 'Goal updated' : 'Goal saved');
      setForm(blank);
      setEditing(null);
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Goals" title="Daily, weekly, and monthly goals" description="Set process goals and track completion." />
      <form onSubmit={submit} className="glass-panel rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-4">
          <select className="input" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {['Daily', 'Weekly', 'Monthly'].map((type) => <option key={type}>{type}</option>)}
          </select>
          <input className="input" placeholder="Goal title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <input className="input" type="date" value={String(form.targetDate || '').slice(0, 10)} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} />
          <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
            <input type="checkbox" className="accent-brand" checked={Boolean(form.completed)} onChange={(event) => setForm({ ...form, completed: event.target.checked })} />
            Completed
          </label>
        </div>
        <textarea className="input mt-4 min-h-[110px]" placeholder="Description" value={form.description || ''} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <button className="btn-primary mt-4">{editing ? 'Update goal' : 'Save goal'}</button>
      </form>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item._id} className="glass-panel rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <button className={item.completed ? 'text-bull' : 'text-slate-500'} onClick={() => update(item._id, { ...item, completed: !item.completed })}>
                  {item.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>
                <div>
                  <p className="text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.type} · {dateLabel(item.targetDate)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => { setEditing(item._id); setForm({ ...blank, ...item, targetDate: String(item.targetDate || '').slice(0, 10) }); }}><Edit className="h-4 w-4" /></button>
                <button className="rounded-md p-2 text-red-300 hover:bg-red-500/10" onClick={() => remove(item._id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{item.description || 'No description.'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
