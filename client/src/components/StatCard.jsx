import { motion } from 'framer-motion';
import { pnlClass } from '../utils/formatters.js';

export default function StatCard({ label, value, rawValue, icon: Icon, accent = 'brand', sublabel, trend }) {
  const accentClass = {
    brand: 'text-brand bg-brand/10',
    bull: 'text-bull bg-bull/10',
    bear: 'text-bear bg-bear/10',
    warn: 'text-warn bg-warn/10'
  }[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-lg p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
          <p className={`mt-3 text-2xl font-semibold ${trend === 'pnl' ? pnlClass(rawValue ?? value) : 'text-white'}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`rounded-lg p-2 ${accentClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {sublabel && <p className="mt-3 text-xs text-slate-500">{sublabel}</p>}
    </motion.div>
  );
}
