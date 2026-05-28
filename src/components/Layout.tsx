import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Package, Bell, History, Tag,
  Zap, BarChart2, Plug, Settings, CreditCard,
  HelpCircle, LogOut, ShoppingBag, Search, Moon, Sun,
  ChevronDown, TrendingDown, ExternalLink, User, X, Menu,
} from 'lucide-react';
import { logout } from '../api/auth';
import { getAlerts } from '../api/tracking';
import { useAuthStore } from '../store/auth';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

interface Alert {
  id: string; target_price: string; triggered_price: string;
  sent_at: string; title: string | null; url: string; asin: string;
}

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
  const { isMobile } = useBreakpoint();

  /* ── sidebar drawer (mobile) ── */
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => { if (!isMobile) setSidebarOpen(false); }, [isMobile]);
  const closeNav = () => { if (isMobile) setSidebarOpen(false); };

  /* ── theme ── */
  const [isDark, setIsDark] = useState(() => localStorage.getItem('pt-theme') === 'dark');
  const toggleDark = () => setIsDark(d => {
    const next = !d;
    localStorage.setItem('pt-theme', next ? 'dark' : 'light');
    return next;
  });

  /* ── search ── */
  const [searchVal, setSearchVal] = useState('');
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchVal.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    } else if (e.key === 'Escape') {
      setSearchVal('');
      (e.target as HTMLInputElement).blur();
    }
  };

  /* ── notifications ── */
  const [showNotifs, setShowNotifs]       = useState(false);
  const [alerts, setAlerts]               = useState<Alert[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const notifsRef = useRef<HTMLDivElement>(null);

  const openNotifs = async () => {
    setShowNotifs(v => !v);
    if (alerts.length === 0) {
      setLoadingAlerts(true);
      try { setAlerts(await getAlerts()); } catch {}
      setLoadingAlerts(false);
    }
  };

  /* ── profile ── */
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  /* ── close dropdowns on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current  && !notifsRef.current.contains(e.target as Node))  setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    clearAuth();
    navigate('/login');
    toast.success('Logged out');
  };

  const displayName = user?.email?.split('@')[0] ?? 'User';
  const initials    = displayName[0]?.toUpperCase() ?? 'U';

  const t = {
    mainBg:      isDark ? '#0d0f1e' : '#f0f2f8',
    headerBg:    isDark ? '#13152e' : '#fff',
    headerBorder:isDark ? 'rgba(255,255,255,.07)' : '#eef0f6',
    searchBg:    isDark ? '#1e2140' : '#f8f9fc',
    searchBorder:isDark ? 'rgba(255,255,255,.1)' : '#eef0f6',
    searchText:  isDark ? '#e5e7eb' : '#374151',
    iconBtn:     isDark ? '#1e2140' : '#f8f9fc',
    iconColor:   isDark ? '#9ca3af' : '#6b7280',
    nameColor:   isDark ? '#e5e7eb' : '#1f2937',
    divider:     isDark ? 'rgba(255,255,255,.07)' : '#eef0f6',
    dropBg:      isDark ? '#1e2140' : '#fff',
    dropBorder:  isDark ? 'rgba(255,255,255,.1)' : '#eef0f6',
    dropText:    isDark ? '#e5e7eb' : '#111827',
    dropSub:     isDark ? '#6b7280' : '#9ca3af',
  };

  const SIDEBAR_W = isMobile ? 270 : 220;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: t.mainBg, transition: 'background .2s' }}>

      {/* ── Mobile backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 29, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: SIDEBAR_W, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#13152e', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30,
        boxShadow: sidebarOpen ? '4px 0 28px rgba(0,0,0,.35)' : '2px 0 16px rgba(0,0,0,.18)',
        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
      }}>
        {/* Logo + close button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 18px 18px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, background: '#f59e0b', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(245,158,11,.35)',
          }}>
            <ShoppingBag size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1 }}>PriceTracker</div>
            <div style={{ color: '#6b7280', fontSize: 10, marginTop: 3 }}>Amazon Price Tracker</div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)}
              style={{ background: 'rgba(255,255,255,.07)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={15} color="#6b7280" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto' }}>
          {navItems.map((item, i) =>
            'divider' in item ? (
              <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,.07)', margin: '10px 0' }} />
            ) : (
              <NavLink key={item.to} to={item.to!} onClick={closeNav}
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
      <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14,
          padding: isMobile ? '10px 16px' : '11px 28px',
          background: t.headerBg, borderBottom: `1px solid ${t.headerBorder}`,
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 1px 6px rgba(0,0,0,.05)',
          transition: 'background .2s',
        }}>

          {/* Hamburger (mobile only) */}
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)}
              style={{ width: 38, height: 38, borderRadius: 11, border: 'none', background: t.iconBtn, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Menu size={19} color={t.iconColor} />
            </button>
          )}

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            background: t.searchBg, border: `1.5px solid ${t.searchBorder}`,
            borderRadius: 12, padding: '9px 14px', flex: 1, maxWidth: isMobile ? '100%' : 500,
            transition: 'background .2s',
          }}>
            <Search size={14} color={t.iconColor} style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={isMobile ? 'Search products…' : 'Search any product or paste Amazon link…'}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: t.searchText, minWidth: 0 }}
            />
            {searchVal ? (
              <button onClick={() => setSearchVal('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 2, flexShrink: 0 }}>
                <X size={12} color={t.iconColor} />
              </button>
            ) : !isMobile ? (
              <kbd style={{ fontSize: 10.5, color: t.iconColor, background: isDark ? '#252848' : '#e9ecf0', padding: '2px 7px', borderRadius: 5, fontFamily: 'monospace', letterSpacing: .5, flexShrink: 0 }}>⌘K</kbd>
            ) : null}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 6, marginLeft: 'auto', flexShrink: 0 }}>

            {/* Notifications */}
            <div ref={notifsRef} style={{ position: 'relative' }}>
              <button onClick={openNotifs} style={{
                position: 'relative', width: 38, height: 38, borderRadius: 11,
                border: 'none', background: showNotifs ? '#eef2ff' : t.iconBtn,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s',
              }}>
                <Bell size={17} color={showNotifs ? '#6c63ff' : t.iconColor} />
                {alerts.length > 0 && (
                  <span style={{ position: 'absolute', top: 7, right: 7, width: 17, height: 17, background: '#ef4444', borderRadius: '50%', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${t.headerBg}` }}>
                    {Math.min(alerts.length, 9)}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div style={{
                  position: 'fixed', top: isMobile ? 60 : 'auto',
                  right: isMobile ? 8 : 0, left: isMobile ? 8 : 'auto',
                  marginTop: isMobile ? 0 : 10,
                  ...(isMobile ? {} : { top: 'auto' }),
                  width: isMobile ? 'auto' : 340,
                  background: t.dropBg, borderRadius: 18,
                  border: `1px solid ${t.dropBorder}`,
                  boxShadow: '0 12px 40px rgba(0,0,0,.18)', zIndex: 100, overflow: 'hidden',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: `1px solid ${t.dropBorder}` }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: t.dropText, margin: 0 }}>Notifications</p>
                      <p style={{ fontSize: 11.5, color: t.dropSub, margin: '2px 0 0' }}>{alerts.length} price alert{alerts.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                      <X size={16} color={t.dropSub} />
                    </button>
                  </div>

                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {loadingAlerts ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                        <div style={{ width: 22, height: 22, border: '2.5px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
                      </div>
                    ) : alerts.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '28px 0' }}>
                        <Bell size={28} color={t.dropSub} style={{ opacity: .4 }} />
                        <p style={{ fontSize: 13, fontWeight: 600, color: t.dropSub, margin: '10px 0 0' }}>No alerts yet</p>
                      </div>
                    ) : (
                      alerts.slice(0, 6).map((alert, i) => {
                        const saved = Math.max(0, parseFloat(alert.target_price) - parseFloat(alert.triggered_price));
                        return (
                          <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < Math.min(alerts.length, 6) - 1 ? `1px solid ${t.dropBorder}` : 'none', cursor: 'pointer' }}
                            onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.04)' : '#fafbfc')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <TrendingDown size={15} color="#10b981" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: 12.5, fontWeight: 600, color: t.dropText, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {alert.title ?? alert.asin}
                              </p>
                              <p style={{ fontSize: 11, color: t.dropSub, margin: '2px 0 0' }}>
                                Saved ₹{saved.toLocaleString('en-IN')} · {new Date(alert.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                            <a href={alert.url} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: '#6c63ff', display: 'flex' }}>
                              <ExternalLink size={13} />
                            </a>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {alerts.length > 0 && (
                    <div style={{ padding: '12px 18px', borderTop: `1px solid ${t.dropBorder}` }}>
                      <button onClick={() => { navigate('/alerts'); setShowNotifs(false); }}
                        style={{ width: '100%', padding: '9px', borderRadius: 11, border: `1.5px solid ${t.dropBorder}`, background: 'transparent', color: '#6c63ff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        View all alerts
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark mode */}
            {!isMobile && (
              <button onClick={toggleDark}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                style={{ width: 38, height: 38, borderRadius: 11, border: 'none', background: isDark ? '#252848' : t.iconBtn, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}>
                {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color={t.iconColor} />}
              </button>
            )}

            {/* Profile */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button onClick={() => setShowProfile(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: isMobile ? 0 : 9,
                  paddingLeft: isMobile ? 0 : 14, marginLeft: isMobile ? 0 : 6,
                  borderLeft: isMobile ? 'none' : `1.5px solid ${t.divider}`,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  borderRadius: 11, padding: isMobile ? '4px' : '5px 8px 5px 14px',
                }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(108,99,255,.35)',
                }}>{initials}</div>
                {!isMobile && (
                  <>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.nameColor, lineHeight: 1 }}>{displayName}</div>
                      <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 3, fontWeight: 600 }}>Free Plan</div>
                    </div>
                    <ChevronDown size={14} color={t.iconColor} style={{ transition: 'transform .2s', transform: showProfile ? 'rotate(180deg)' : 'none' }} />
                  </>
                )}
              </button>

              {showProfile && (
                <div style={{
                  position: 'fixed', top: isMobile ? 60 : 'auto', right: 8,
                  marginTop: isMobile ? 0 : 10,
                  ...(isMobile ? {} : { top: 'auto' }),
                  width: 220, background: t.dropBg, borderRadius: 16,
                  border: `1px solid ${t.dropBorder}`,
                  boxShadow: '0 12px 40px rgba(0,0,0,.18)', zIndex: 100, overflow: 'hidden', padding: 6,
                }}>
                  <div style={{ padding: '12px 14px 10px', borderBottom: `1px solid ${t.dropBorder}`, marginBottom: 4 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: t.dropText, margin: 0 }}>{displayName}</p>
                    <p style={{ fontSize: 11.5, color: t.dropSub, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 10.5, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>👑 Free Plan</span>
                  </div>

                  {[
                    { icon: User,       label: 'My Profile',     path: '/settings' },
                    { icon: Settings,   label: 'Settings',       path: '/settings' },
                    { icon: CreditCard, label: 'Billing',        path: '/billing'  },
                    { icon: HelpCircle, label: 'Help & Support', path: '/support'  },
                  ].map(({ icon: Icon, label, path }) => (
                    <button key={label}
                      onClick={() => { navigate(path); setShowProfile(false); closeNav(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: t.dropText, fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.07)' : '#f3f4f6')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <Icon size={15} color={t.dropSub} /> {label}
                    </button>
                  ))}

                  {isMobile && (
                    <button onClick={toggleDark}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: t.dropText, fontSize: 13, fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.07)' : '#f3f4f6')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color={t.dropSub} />}
                      {isDark ? 'Light mode' : 'Dark mode'}
                    </button>
                  )}

                  <div style={{ borderTop: `1px solid ${t.dropBorder}`, marginTop: 4, paddingTop: 4 }}>
                    <button onClick={handleLogout}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <LogOut size={15} color="#ef4444" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 14px' : 28, background: t.mainBg, transition: 'background .2s' }}>
          {children}
        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
