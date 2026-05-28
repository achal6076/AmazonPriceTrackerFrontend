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
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',     icon: Package,          label: 'Tracked Products' },
  { to: '/alerts',       icon: Bell,             label: 'Price Alerts' },
  { to: '/history',      icon: History,          label: 'Price History' },
  { to: '/categories',   icon: Tag,              label: 'Watched Categories' },
  { to: '/deals',        icon: Zap,              label: 'Top Deals' },
  { to: '/reports',      icon: BarChart2,        label: 'Reports' },
  { divider: true },
  { to: '/integrations', icon: Plug,             label: 'Integrations' },
  { to: '/settings',     icon: Settings,         label: 'Settings' },
  { to: '/billing',      icon: CreditCard,       label: 'Billing' },
  { to: '/support',      icon: HelpCircle,       label: 'Help & Support' },
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

  const displayName = user?.email?.split('@')[0] ?? 'User';
  const initials = displayName[0]?.toUpperCase() ?? 'U';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f8' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 210, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#13152e', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 20,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 16px 16px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: '#f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <ShoppingBag size={17} color="white" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>PriceTracker</div>
            <div style={{ color: '#6b7280', fontSize: 10, marginTop: 2 }}>Amazon Price Tracker</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto' }}>
          {navItems.map((item, i) =>
            'divider' in item ? (
              <div key={i} style={{ borderTop: '1px solid #ffffff14', margin: '8px 0' }} />
            ) : (
              <NavLink key={item.to} to={item.to!} style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 10, fontSize: 12.5, fontWeight: 500,
                textDecoration: 'none', transition: 'all .15s',
                color: isActive ? '#a78bfa' : '#9ca3af',
                background: isActive ? '#6c63ff18' : 'transparent',
              })}>
                {({ isActive }) => (
                  <>
                    <item.icon size={15} color={isActive ? '#a78bfa' : '#6b7280'} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* Upgrade card */}
        <div style={{ margin: '0 10px 12px', borderRadius: 14, background: '#1e2140', padding: '14px 14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 14 }}>👑</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 12 }}>Go Premium</span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: 11, marginBottom: 10, lineHeight: 1.5 }}>
            Unlock advanced features, unlimited tracking and more!
          </p>
          <button style={{
            width: '100%', padding: '8px 0', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
            color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}>Upgrade Now</button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 22px', borderTop: '1px solid #ffffff10',
          background: 'transparent', border: 'none',
          color: '#6b7280', fontSize: 12, cursor: 'pointer',
        }}>
          <LogOut size={14} /> Logout
        </button>
      </aside>

      {/* ── Right side ── */}
      <div style={{ marginLeft: 210, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 24px', background: '#fff',
          borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 10,
        }}>
          {/* Search */}
          <div style={{
            flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center', gap: 8,
            background: '#f9fafb', border: '1px solid #e5e7eb',
            borderRadius: 12, padding: '8px 14px',
          }}>
            <Search size={14} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search any product or paste Amazon link..."
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontSize: 12.5, color: '#374151',
              }}
            />
            <kbd style={{
              fontSize: 10, color: '#9ca3af', background: '#e5e7eb',
              padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace',
            }}>⌘K</kbd>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            {/* Bell */}
            <button style={{ position: 'relative', padding: 8, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <Bell size={17} color="#6b7280" />
              <span style={{
                position: 'absolute', top: 5, right: 5, width: 16, height: 16,
                background: '#ef4444', borderRadius: '50%', color: '#fff',
                fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>3</span>
            </button>
            {/* Dark mode */}
            <button style={{ padding: 8, borderRadius: 10, border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <Moon size={17} color="#6b7280" />
            </button>
            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 10, borderLeft: '1px solid #e5e7eb' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 12, fontWeight: 700,
              }}>{initials}</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1f2937', lineHeight: 1 }}>{displayName}</div>
                <div style={{ fontSize: 10.5, color: '#f59e0b', marginTop: 2 }}>Free Plan</div>
              </div>
              <ChevronDown size={13} color="#9ca3af" />
            </div>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
