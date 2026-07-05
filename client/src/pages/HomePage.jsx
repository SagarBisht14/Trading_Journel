import { ArrowRight, BarChart3, CalendarDays, CheckCircle2, Images, LineChart, Lock, NotebookTabs, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  ['Trade analytics', 'Equity curve, profit factor, expectancy, streaks, drawdown, and setup-level performance.', BarChart3],
  ['Screenshot review', 'Before-entry, after-entry, exit, TradingView, MT5, and broker screenshots with zoomable galleries.', Images],
  ['Process journal', 'Daily reflections, goals, playbooks, watchlists, rich notes, and AI-style behavior insights.', NotebookTabs],
  ['Calendar heatmap', 'See daily PnL and trade counts at a glance, then open the exact trades behind each day.', CalendarDays]
];

const stats = [
  ['18+', 'Analytics views'],
  ['10', 'Images per trade'],
  ['100%', 'Private data'],
  ['Free', 'Pricing']
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-ink/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-9 w-9 rounded-lg" />
            <span className="text-base font-semibold">TradePilot Journal</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <Link to="/login" className="hover:text-white">Login</Link>
            <Link to="/register" className="btn-primary py-2">Start Free</Link>
          </nav>
        </div>
      </header>

      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <img src="/hero-trading-workstation.png" alt="Dark trading analytics workstation" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/82 to-ink/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/30" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 md:px-6">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-2xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-sm text-sky-200">
              <Sparkles className="h-4 w-4" />
              Built for serious trade review
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-white md:text-7xl">TradePilot Journal</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              A modern dark trading journal for logging trades, reviewing screenshots, measuring edge, and improving execution with clean analytics.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary">Open dashboard</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-slate-400">
              {['JWT auth', 'MongoDB storage', 'Chart.js analytics'].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-bull" />
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="border-t border-white/10 bg-ink px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Features</p>
              <h2 className="mt-2 text-3xl font-semibold">Everything needed for deliberate practice</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-400">
              Log details once, then slice the data by strategy, setup, timeframe, instrument, emotion, day, month, and execution quality.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map(([title, copy, Icon]) => (
              <div key={title} className="glass-panel rounded-lg p-5">
                <div className="mb-5 inline-flex rounded-lg bg-brand/10 p-3 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-panel/40 px-4 py-16 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <p className="text-3xl font-semibold text-white">{value}</p>
              <p className="mt-2 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
          {['The table filters are fast enough for real review sessions.', 'The screenshot gallery makes trade replay painless.', 'The setup stats made my weak patterns obvious.'].map((quote, index) => (
            <figure key={quote} className="glass-panel rounded-lg p-5">
              <blockquote className="text-sm leading-6 text-slate-300">&ldquo;{quote}&rdquo;</blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-500">Trader {index + 1}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y border-white/10 bg-panel/60 px-4 py-16 md:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">Pricing</p>
          <h2 className="mt-2 text-3xl font-semibold">Free for your trading desk</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
            Run it locally, deploy it privately, and keep control of your trade data, screenshots, journals, and playbooks.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">
              <Lock className="h-4 w-4 text-brand" />
              JWT secured
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">
              <ShieldCheck className="h-4 w-4 text-bull" />
              Self-hostable
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300">
              <LineChart className="h-4 w-4 text-brand" />
              Analytics included
            </span>
          </div>
          <Link to="/register" className="btn-primary mt-8">
            Start journaling
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
