import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { useResource } from '../hooks/useResource.js';
import { assetUrl } from '../services/api.js';

const blank = { title: '', description: '', checklist: '', rules: '', entry: '', exit: '', riskRules: '', commonMistakes: '' };

export default function PlaybookPage() {
  const { items, create, update, remove } = useResource('/playbooks');
  const [form, setForm] = useState(blank);
  const [files, setFiles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [zoom, setZoom] = useState(null);

  const makeData = () => {
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value || ''));
    data.set('checklist', JSON.stringify(String(form.checklist || '').split('\n').map((item) => item.trim()).filter(Boolean)));
    files.forEach((file) => data.append('images', file));
    return data;
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editing) await update(editing, makeData(), { headers: { 'Content-Type': 'multipart/form-data' } });
      else await create(makeData(), { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(editing ? 'Setup updated' : 'Setup saved');
      setForm(blank);
      setFiles([]);
      setEditing(null);
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  const startEdit = (item) => {
    setEditing(item._id);
    setFiles([]);
    setForm({ ...blank, ...item, checklist: item.checklist?.join('\n') || '' });
  };

  return (
    <div>
      <PageHeader eyebrow="Playbook" title="High-quality setups" description="Document the setup rules, checklist, entries, exits, risk rules, examples, and common mistakes." />
      <form onSubmit={submit} className="glass-panel rounded-lg p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Setup title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <input className="input" type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 10))} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Textarea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
          <Textarea label="Checklist (one per line)" value={form.checklist} onChange={(value) => setForm({ ...form, checklist: value })} />
          <Textarea label="Rules" value={form.rules} onChange={(value) => setForm({ ...form, rules: value })} />
          <Textarea label="Entry" value={form.entry} onChange={(value) => setForm({ ...form, entry: value })} />
          <Textarea label="Exit" value={form.exit} onChange={(value) => setForm({ ...form, exit: value })} />
          <Textarea label="Risk Rules" value={form.riskRules} onChange={(value) => setForm({ ...form, riskRules: value })} />
          <Textarea label="Common Mistakes" value={form.commonMistakes} onChange={(value) => setForm({ ...form, commonMistakes: value })} />
        </div>
        <button className="btn-primary mt-4">{editing ? 'Update setup' : 'Save setup'}</button>
      </form>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <article key={item._id} className="glass-panel rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xl font-semibold text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.description || 'No description.'}</p>
              </div>
              <div className="flex gap-1">
                <button className="rounded-md p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => startEdit(item)}><Edit className="h-4 w-4" /></button>
                <button className="rounded-md p-2 text-red-300 hover:bg-red-500/10" onClick={() => remove(item._id)}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Panel title="Checklist" text={(item.checklist || []).join('\n')} />
              <Panel title="Rules" text={item.rules} />
              <Panel title="Entry" text={item.entry} />
              <Panel title="Exit" text={item.exit} />
              <Panel title="Risk Rules" text={item.riskRules} />
              <Panel title="Common Mistakes" text={item.commonMistakes} />
            </div>
            {item.exampleImages?.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {item.exampleImages.map((image) => (
                  <button key={image._id} onClick={() => setZoom(assetUrl(image.url))} className="overflow-hidden rounded-lg border border-white/10">
                    <img src={assetUrl(image.url)} alt={image.originalName} className="aspect-video w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
      <Modal open={Boolean(zoom)} title="Playbook image" onClose={() => setZoom(null)}>
        {zoom && <img src={zoom} alt="Playbook example" className="mx-auto max-h-[75vh] rounded-lg object-contain" />}
      </Modal>
    </div>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea className="input min-h-[130px]" value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Panel({ title, text }) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{text || '-'}</p>
    </div>
  );
}
