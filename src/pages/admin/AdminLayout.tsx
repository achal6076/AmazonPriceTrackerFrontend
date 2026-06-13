import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShieldCheck, ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import { logout } from '../../api/auth';
import { useAuthStore } from '../../store/auth';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'Users' },
];

const SIDEBAR_W = 220;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { isMobile } = useBreakpoint();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  useEffect(() => { if (!isMobile) setSidebarOpen(false); }, [isMobile]);
  const closeNav = () => { if (isMobile) setSidebarOpen(false); };

  const handleLogout = async () => {
    try { await logout(); } catch {}
    clearAuth();
    navigate('/login');
    toast.success('Logged out');
  };

  const displayName = user?.email?.split('@')[0] ?? 'Admin';
  const initials    = displayName[0]?.toUpperCase() ?? 'A';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f8' }}>

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 29, backdropFilter: 'blur(2px)' }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? 260 : SIDEBAR_W, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: '#0d0f1e', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 30,
        boxShadow: '2px 0 16px rgba(0,0,0,.25)',
        transform: isMobile && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform .3s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '20px 18px 18px' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(108,99,255,.4)',
          }}>
            <ShieldCheck size={18} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1 }}>PriceZap</div>
            <div style={{ color: '#6b7280', fontSize: 10, marginTop: 3 }}>Admin Panel</div>
          </div>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)}
              style={{ background: 'rgba(255,255,255,.07)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={15} color="#6b7280" />
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: '6px 10px' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end onClick={closeNav}
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
          ))}
        </nav>

        <button onClick={() => { closeNav(); navigate('/dashboard'); }} style={{
          display: 'flex', alignItems: 'center', gap: 9,
          margin: '0 10px 8px', padding: '10px 13px', borderRadius: 11,
          background: 'transparent', border: '1px solid rgba(255,255,255,.08)',
          color: '#8b92a9', fontSize: 12.5, cursor: 'pointer',
        }}>
          <ArrowLeft size={14} /> Back to app
        </button>

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

      {/* Main */}
      <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: isMobile ? '12px 16px' : '14px 28px',
          background: '#fff', borderBottom: '1px solid #eef0f6',
          position: 'sticky', top: 0, zIndex: 20,
          boxShadow: '0 1px 6px rgba(0,0,0,.05)',
        }}>
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)}
              style={{ width: 38, height: 38, borderRadius: 11, border: 'none', background: '#f8f9fc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Menu size={19} color="#6b7280" />
            </button>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 800, color: '#1f2937' }}>Admin Dashboard</div>
            <div style={{ fontSize: 11.5, color: '#9ca3af' }}>Platform overview &amp; controls</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
              color: '#fff', fontWeight: 700, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{initials}</div>
            {!isMobile && (
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>{displayName}</div>
                <div style={{ fontSize: 10.5, color: '#9ca3af' }}>Administrator</div>
              </div>
            )}
          </div>
        </header>

        <main style={{ flex: 1, padding: isMobile ? 16 : 28, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
