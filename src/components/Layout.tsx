import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  const [searchVal, setSearchVal] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f8' }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#13152e', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30,
        boxShadow: '2px 0 16px rgba(0,0,0,.18)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 18px 18px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, background: '#f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 10px rgba(245,158,11,.35)',
          }}>
            <ShoppingBag size={18} color="white" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1 }}>PriceTracker</div>
            <div style={{ color: '#6b7280', fontSize: 10, marginTop: 3 }}>Amazon Price Tracker</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto' }}>
          {navItems.map((item, i) =>
            'divider' in item ? (
              <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,.07)', margin: '10px 0' }} />
            ) : (
              <NavLink key={item.to} to={item.to!}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 13px', borderRadius: 11, fontSize: 13, fontWeight: isActive ? 600 : 500,
                  textDecoration: 'none', transition: 'all .15s', marginBottom: 2,
                  color: isActive ? '#c4b5fd' : '#8b92a9',
                  background: isActive ? 'rgba(108,99,255,.18)' : 'transparent',
                  borderLeft: isActive ? '3px solid #7c6fff' : '3px solid transparent',
                })}>
                {({ isActive }) => (
                  <>
                    <item.icon size={15} color={isActive ? '#a78bfa' : '#6b7280'} strokeWidth={isActive ? 2.2 : 1.8} />
                    {item.label}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>

        {/* Go Premium */}
        <div style={{ margin: '0 10px 14px', borderRadius: 16, background: 'linear-gradient(135deg,#1e2140,#252848)', padding: '16px 14px', border: '1px solid rgba(108,99,255,.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
            <span style={{ fontSize: 16 }}>👑</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Go Premium</span>
          </div>
          <p style={{ color: '#8b92a9', fontSize: 11.5, marginBottom: 12, lineHeight: 1.6 }}>
            Unlock advanced features, unlimited tracking and more!
          </p>
          <button style={{
            width: '100%', padding: '9px 0', borderRadius: 11, border: 'none',
            background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
            color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(108,99,255,.4)',
          }}>Upgrade Now</button>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '12px 22px', borderTop: '1px solid rgba(255,255,255,.07)',
          background: 'transparent', border: 'none',
          color: '#6b7280', fontSize: 12.5, cursor: 'pointer', transition: 'color .15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9ca3af')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}>
          <LogOut size={14} /> Logout
        </button>
      </aside>

      {/* ── Main ── */}
      <div style={{ marginLeft: 220, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '11px 28px', background: '#fff',
          borderBottom: '1px solid #eef0f6',
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 1px 6px rgba(0,0,0,.05)',
        }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            background: '#f8f9fc', border: '1.5px solid #eef0f6',
            borderRadius: 12, padding: '9px 16px', flex: 1, maxWidth: 500,
          }}>
            <Search size={14} color="#9ca3af" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search any product or paste Amazon link..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#374151' }}
            />
            <kbd style={{ fontSize: 10.5, color: '#9ca3af', background: '#e9ecf0', padding: '2px 7px', borderRadius: 5, fontFamily: 'monospace', letterSpacing: .5 }}>⌘K</kbd>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
            <button style={{ position: 'relative', width: 38, height: 38, borderRadius: 11, border: 'none', background: '#f8f9fc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={17} color="#6b7280" />
              <span style={{ position: 'absolute', top: 7, right: 7, width: 17, height: 17, background: '#ef4444', borderRadius: '50%', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>3</span>
            </button>
            <button style={{ width: 38, height: 38, borderRadius: 11, border: 'none', background: '#f8f9fc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={17} color="#6b7280" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 14, marginLeft: 6, borderLeft: '1.5px solid #eef0f6' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 800, flexShrink: 0,
                boxShadow: '0 2px 8px rgba(108,99,255,.35)',
              }}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1f2937', lineHeight: 1 }}>{displayName}</div>
                <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 3, fontWeight: 600 }}>Free Plan</div>
              </div>
              <ChevronDown size={14} color="#9ca3af" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 28, background: '#f0f2f8' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
