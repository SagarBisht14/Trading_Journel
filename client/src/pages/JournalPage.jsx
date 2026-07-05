import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import { useResource } from '../hooks/useResource.js';
import { dateLabel } from '../utils/formatters.js';

const blank = { date: new Date().toISOString().slice(0, 10), mood: '', sleep: '', focus: '', marketBias: '', lessons: '', goals: '', reflection: '' };

export default function JournalPage() {
  const { items, loading, create, update, remove } = useResource('/journals');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editing) await update(editing, form);
      else await create(form);
      toast.success(editing ? 'Journal updated' : 'Journal saved');
      setForm(blank);
      setEditing(null);
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  const startEdit = (item) => {
    setEditing(item._id);
    setForm({ ...blank, ...item, date: String(item.date).slice(0, 10) });
  };

  return (
    <div>
      <PageHeader eyebrow="Journal" title="Daily journal" description="Create trading-day notes even when no trade was taken." />
      <form onSubmit={submit} className="glass-panel rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {['date', 'mood', 'sleep', 'focus'].map((key) => <Input key={key} label={key} type={key === 'date' ? 'date' : 'text'} value={form[key]} onChange={(value) => setForm({ ...form, [key]: value })} />)}
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {['marketBias', 'lessons', 'goals', 'reflection'].map((key) => <Textarea key={key} label={key} value={form[key]} onChange={(value) => setForm({ ...form, [key]: value })} />)}
        </div>
        <button className="btn-primary mt-4">{editing ? 'Update journal' : 'Save journal'}</button>
      </form>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading ? <div className="h-40 animate-pulse rounded-lg bg-white/[0.05]" /> : items.map((item) => (
          <article key={item._id} className="glass-panel rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{dateLabel(item.date)}</p>
                <p className="mt-1 text-sm text-slate-500">{item.mood || 'Mood not set'} · {item.sleep || 'Sleep not set'} · {item.focus || 'Focus not set'}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => startEdit(item)}><Edit className="h-4 w-4" /></button>
                <button className="rounded-md p-2 text-red-300 hover:bg-red-500/10" onClick={() => remove(item._id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{item.reflection || item.lessons || 'No reflection added.'}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="label capitalize">{label.replace(/([A-Z])/g, ' $1')}</label>
      <input className="input" value={value || ''} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="label capitalize">{label.replace(/([A-Z])/g, ' $1')}</label>
      <textarea className="input min-h-[130px]" value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
