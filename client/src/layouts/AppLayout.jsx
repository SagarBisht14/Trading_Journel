import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  DatabaseBackup,
  Flag,
  Gauge,
  Home,
  LogOut,
  Menu,
  NotebookPen,
  Plus,
  SearchCheck,
  Settings,
  ShieldCheck,
  Table2,
  Target,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import GlobalSearch from '../components/GlobalSearch.jsx';

const navItems = [
  { to: '/app', label: 'Dashboard', icon: Gauge },
  { to: '/app/trades', label: 'Trades', icon: Table2 },
  { to: '/app/trades/new', label: 'Add Trade', icon: Plus },
  { to: '/app/statistics', label: 'Statistics', icon: BarChart3 },
  { to: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/app/journal', label: 'Journal', icon: NotebookPen },
  { to: '/app/watchlist', label: 'Watchlist', icon: SearchCheck },
  { to: '/app/playbook', label: 'Playbook', icon: BookOpen },
  { to: '/app/goals', label: 'Goals', icon: Target },
  { to: '/app/notes', label: 'Notes', icon: ClipboardList },
  { to: '/app/backup', label: 'Backup', icon: DatabaseBackup },
  { to: '/app/profile', label: 'Profile', icon: Settings }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const visibleNavItems = user?.role === 'admin'
    ? [...navItems.slice(0, -1), { to: '/app/admin', label: 'Admin', icon: ShieldCheck }, navItems.at(-1)]
    : navItems;

  useEffect(() => {
    const handler = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        navigate('/app/trades/new');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  const Sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-white/10 bg-ink/95 px-4 py-5 backdrop-blur-xl">
      <Link to="/app" className="mb-8 flex items-center gap-3 px-2">
        <img src="/logo.svg" alt="" className="h-9 w-9 rounded-lg" />
        <div>
          <p className="text-base font-semibold text-white">TradePilot</p>
          <p className="text-xs text-slate-500">Journal OS</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 overflow-auto">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/app'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand/12 text-brand' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-sm font-semibold text-brand">
            {user?.username?.slice(0, 2)?.toUpperCase() || 'TP'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            {user?.role === 'admin' && <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand">Admin</p>}
          </div>
        </div>
        <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/[0.06] hover:text-white" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{Sidebar}</div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-black/70" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
          <div className="relative h-full w-72">
            {Sidebar}
            <button className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/85 px-4 py-3 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <GlobalSearch />
            <Link to="/" className="ml-auto hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-400 hover:text-white md:inline-flex">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link to="/app/goals" className="hidden rounded-lg border border-bull/30 bg-bull/10 px-3 py-2 text-sm font-medium text-green-200 hover:bg-bull/20 sm:inline-flex">
              <Flag className="mr-2 h-4 w-4" />
              Process
            </Link>
          </div>
        </header>
        <main className="px-4 py-6 md:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
