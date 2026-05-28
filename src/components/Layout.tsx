import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Bell, History, Tag,
  Zap, BarChart2, Plug, Settings, CreditCard,
  HelpCircle, LogOut, ShoppingBag, Search, Moon, ChevronDown
} from 'lucide-react';
import { logout } from '../api/auth';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',   icon: Package,          label: 'Tracked Products' },
  { to: '/alerts',     icon: Bell,             label: 'Price Alerts' },
  { to: '/history',    icon: History,          label: 'Price History' },
  { to: '/categories', icon: Tag,              label: 'Watched Categories' },
  { to: '/deals',      icon: Zap,             label: 'Top Deals' },
  { to: '/reports',    icon: BarChart2,        label: 'Reports' },
  { divider: true },
  { to: '/integrations', icon: Plug,     label: 'Integrations' },
  { to: '/settings',     icon: Settings, label: 'Settings' },
  { to: '/billing',      icon: CreditCard, label: 'Billing' },
  { to: '/support',      icon: HelpCircle, label: 'Help & Support' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try { await logout(); } catch {}
    clearAuth();
    navigate('/login');
    toast.success('Logged out');
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col" style={{ background: '#13152e' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#f59e0b' }}>
            <ShoppingBag size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">PriceTracker</p>
            <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Amazon Price Tracker</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-2 pb-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item, i) =>
            'divider' in item ? (
              <div key={i} className="my-3 border-t" style={{ borderColor: '#ffffff12' }} />
            ) : (
              <NavLink
                key={item.to}
                to={item.to!}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`
                }
                style={({ isActive }) => isActive ? { background: '#6c63ff22', color: '#a78bfa' } : {}}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={16} style={isActive ? { color: '#a78bfa' } : {}} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* Upgrade card */}
        <div className="mx-3 mb-4 rounded-2xl p-4" style={{ background: '#1e2140' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400 text-base">👑</span>
            <span className="text-white font-semibold text-sm">Go Premium</span>
          </div>
          <p className="text-xs mb-3" style={{ color: '#9ca3af' }}>
            Unlock advanced features, unlimited tracking and more!
          </p>
          <button className="w-full py-2 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: 'linear-gradient(135deg,#6c63ff,#a78bfa)' }}>
            Upgrade Now
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-6 py-4 text-sm text-gray-500 hover:text-gray-300 transition border-t"
          style={{ borderColor: '#ffffff12' }}
        >
          <LogOut size={15} /> Logout
        </button>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-6 py-3.5 bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 max-w-xl">
            <Search size={15} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search any product or paste Amazon link..."
              className="flex-1 bg-transparent text-sm text-gray-600 outline-none placeholder-gray-400"
            />
            <kbd className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">3</span>
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-100 transition">
              <Moon size={18} className="text-gray-500" />
            </button>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.email?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.email?.split('@')[0] ?? 'User'}</p>
                <p className="text-xs mt-0.5" style={{ color: '#f59e0b' }}>Free Plan</p>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6" style={{ background: '#f0f2f8' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
