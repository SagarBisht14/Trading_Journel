export default function ChartCard({ title, subtitle, children, actions }) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div className="min-h-[260px]">{children}</div>
    </section>
  );
}
