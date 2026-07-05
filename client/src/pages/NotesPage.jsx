import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import RichTextEditor from '../components/RichTextEditor.jsx';
import { useResource } from '../hooks/useResource.js';

const blank = { title: '', tags: '', content: '' };

export default function NotesPage() {
  const { items, create, update, remove } = useResource('/notes');
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    try {
      editing ? await update(editing, form) : await create(form);
      toast.success(editing ? 'Note updated' : 'Note saved');
      setForm(blank);
      setEditing(null);
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <div>
      <PageHeader eyebrow="Notes" title="Rich notes" description="Save research, pre-market plans, and review notes with lightweight rich text." />
      <form onSubmit={submit} className="glass-panel rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <input className="input" placeholder="Tags comma separated" value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
        </div>
        <div className="mt-4">
          <RichTextEditor value={form.content} onChange={(content) => setForm({ ...form, content })} />
        </div>
        <button className="btn-primary mt-4">{editing ? 'Update note' : 'Save note'}</button>
      </form>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item._id} className="glass-panel rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.tags?.join(', ') || 'No tags'}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => { setEditing(item._id); setForm({ ...item, tags: item.tags?.join(', ') || '' }); }}><Edit className="h-4 w-4" /></button>
                <button className="rounded-md p-2 text-red-300 hover:bg-red-500/10" onClick={() => remove(item._id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="prose prose-invert mt-4 max-w-none text-sm text-slate-300" dangerouslySetInnerHTML={{ __html: item.content || '<p>No content.</p>' }} />
          </article>
        ))}
      </div>
    </div>
  );
}
