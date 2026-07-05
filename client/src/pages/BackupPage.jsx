import { Download, Upload } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import api, { API_URL } from '../services/api.js';

export default function BackupPage() {
  const [jsonFile, setJsonFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  const download = async (path, filename) => {
    const response = await fetch(`${API_URL}/api/${path}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('tradepilot_token')}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async () => {
    if (!jsonFile) return;
    const text = await jsonFile.text();
    await api.post('/backup/import/json', JSON.parse(text));
    toast.success('JSON backup imported');
  };

  const importCsv = async () => {
    if (!csvFile) return;
    const data = new FormData();
    data.append('file', csvFile);
    await api.post('/backup/import/csv', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast.success('Trades imported');
  };

  return (
    <div>
      <PageHeader eyebrow="Backup" title="Export and import" description="Move your journal data with JSON backups and trade CSV files." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-lg p-5">
          <h2 className="section-title">Export</h2>
          <p className="mt-2 text-sm text-slate-500">Download all collections as JSON, or export trades as CSV/Excel.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => download('backup/export/json', 'trading-journal-backup.json')}><Download className="h-4 w-4" />JSON</button>
            <button className="btn-secondary" onClick={() => download('trades/export/csv', 'trades.csv')}><Download className="h-4 w-4" />CSV</button>
            <button className="btn-secondary" onClick={() => download('trades/export/excel', 'trades.xls')}><Download className="h-4 w-4" />Excel</button>
          </div>
        </section>
        <section className="glass-panel rounded-lg p-5">
          <h2 className="section-title">Import</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label className="label">JSON Backup</label>
              <input className="input" type="file" accept="application/json" onChange={(event) => setJsonFile(event.target.files?.[0])} />
              <button className="btn-primary mt-3" onClick={importJson}><Upload className="h-4 w-4" />Import JSON</button>
            </div>
            <div>
              <label className="label">Trade CSV</label>
              <input className="input" type="file" accept=".csv" onChange={(event) => setCsvFile(event.target.files?.[0])} />
              <button className="btn-secondary mt-3" onClick={importCsv}><Upload className="h-4 w-4" />Import trades</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
