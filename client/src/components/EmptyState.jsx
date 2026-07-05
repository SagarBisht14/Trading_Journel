import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-5 py-10 text-center">
      <p className="text-base font-semibold text-white">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>}
      {actionTo && (
        <Link to={actionTo} className="btn-primary mt-5">
          <PlusCircle className="h-4 w-4" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
