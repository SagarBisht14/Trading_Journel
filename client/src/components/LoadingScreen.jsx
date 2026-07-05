import { Activity } from 'lucide-react';

export default function LoadingScreen({ label = 'Loading workspace' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 text-slate-200">
        <Activity className="h-5 w-5 animate-pulse text-brand" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
