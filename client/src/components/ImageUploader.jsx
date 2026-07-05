import { ImagePlus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { screenshotTypes } from '../utils/tradeOptions.js';

export default function ImageUploader({ files, setFiles }) {
  const [zoom, setZoom] = useState(null);
  const previews = useMemo(
    () =>
      files.map((item, index) => ({
        ...item,
        index,
        preview: item.preview || URL.createObjectURL(item.file)
      })),
    [files]
  );

  const addFiles = (event) => {
    const incoming = Array.from(event.target.files || []);
    const next = incoming.slice(0, Math.max(10 - files.length, 0)).map((file) => ({ file, type: screenshotTypes[0] }));
    setFiles([...files, ...next]);
    event.target.value = '';
  };

  const updateType = (index, type) => {
    setFiles(files.map((item, current) => (current === index ? { ...item, type } : item)));
  };

  const remove = (index) => {
    setFiles(files.filter((_, current) => current !== index));
  };

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-4">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-4 py-8 text-center hover:border-brand/50 hover:bg-brand/10">
          <ImagePlus className="h-7 w-7 text-brand" />
          <span className="mt-3 text-sm font-semibold text-white">Upload screenshots</span>
          <span className="mt-1 text-xs text-slate-500">Maximum 10 images, compressed on the server</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={addFiles} disabled={files.length >= 10} />
        </label>
        {previews.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((item) => (
              <div key={`${item.file.name}-${item.index}`} className="overflow-hidden rounded-lg border border-white/10 bg-panel">
                <button type="button" className="block aspect-video w-full overflow-hidden" onClick={() => setZoom(item.preview)}>
                  <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover transition hover:scale-105" />
                </button>
                <div className="space-y-2 p-3">
                  <select className="input py-2" value={item.type} onChange={(event) => updateType(item.index, event.target.value)}>
                    {screenshotTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                  <button type="button" className="btn-danger w-full py-2" onClick={() => remove(item.index)}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={Boolean(zoom)} title="Screenshot preview" onClose={() => setZoom(null)}>
        {zoom && <img src={zoom} alt="Zoomed screenshot" className="mx-auto max-h-[75vh] rounded-lg object-contain" />}
      </Modal>
    </div>
  );
}
