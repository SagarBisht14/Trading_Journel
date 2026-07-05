import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { dateLabel } from '../utils/formatters.js';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/search', { params: { q: query } });
        setResults(data);
        setOpen(true);
      } catch {
        setResults(null);
      }
    }, 240);
    return () => clearTimeout(timer);
  }, [query]);

  const sections = [
    ['Trades', results?.trades?.map((item) => ({ label: `${item.instrument} ${item.setup || ''}`, to: `/app/trades/${item._id}`, meta: dateLabel(item.tradeDate) }))],
    ['Journals', results?.journals?.map((item) => ({ label: item.marketBias || item.mood || 'Journal', to: '/app/journal', meta: dateLabel(item.date) }))],
    ['Watchlist', results?.watchlist?.map((item) => ({ label: item.instrument, to: '/app/watchlist', meta: item.status }))],
    ['Playbook', results?.playbooks?.map((item) => ({ label: item.title, to: '/app/playbook', meta: 'Setup' }))],
    ['Notes', results?.notes?.map((item) => ({ label: item.title, to: '/app/notes', meta: 'Note' }))]
  ];

  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => query && setOpen(true)}
        className="input pl-10 pr-10"
        placeholder="Search trades, notes, setups, instruments..."
      />
      {query && (
        <button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-white/10 hover:text-white"
          onClick={() => {
            setQuery('');
            setResults(null);
          }}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {open && results && (
        <div className="glass-panel absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 max-h-96 overflow-auto rounded-lg p-2">
          {sections.every(([, items]) => !items?.length) ? (
            <div className="px-3 py-6 text-center text-sm text-slate-500">No matches found</div>
          ) : (
            sections.map(([title, items]) =>
              items?.length ? (
                <div key={title} className="py-1">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</p>
                  {items.map((item) => (
                    <Link
                      key={`${title}-${item.to}-${item.label}`}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.06]"
                    >
                      <span className="truncate">{item.label}</span>
                      <span className="shrink-0 text-xs text-slate-500">{item.meta}</span>
                    </Link>
                  ))}
                </div>
              ) : null
            )
          )}
        </div>
      )}
    </div>
  );
}
