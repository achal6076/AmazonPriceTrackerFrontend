import { useEffect, useState } from 'react';
import { Users, Package, Activity, BellRing, UserPlus } from 'lucide-react';
import { getDashboardStats, type DashboardStats } from '../../api/admin';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #eef0f6', boxShadow: '0 2px 12px rgba(0,0,0,.05)',
};

export default function AdminDashboard() {
  const { isMobile, isTablet } = useBreakpoint();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Total Users', value: stats?.total_users, icon: Users,
      gradient: 'linear-gradient(135deg,#6c63ff,#a78bfa)', glow: 'rgba(108,99,255,.25)',
      trendLabel: 'all time',
    },
    {
      label: 'New Users', value: stats?.new_users_this_week, icon: UserPlus,
      gradient: 'linear-gradient(135deg,#10b981,#34d399)', glow: 'rgba(16,185,129,.25)',
      trendLabel: 'last 7 days',
    },
    {
      label: 'Tracked Products', value: stats?.total_products, icon: Package,
      gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)', glow: 'rgba(59,130,246,.25)',
      trendLabel: 'all time',
    },
    {
      label: 'Active Trackings', value: stats?.active_tracked_products, icon: Activity,
      gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', glow: 'rgba(245,158,11,.25)',
      trendLabel: 'currently active',
    },
    {
      label: 'Alerts Sent', value: stats?.alerts_sent_this_week, icon: BellRing,
      gradient: 'linear-gradient(135deg,#ef4444,#f87171)', glow: 'rgba(239,68,68,.25)',
      trendLabel: 'last 7 days',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
        gap: isMobile ? 12 : 16,
      }}>
        {cards.map(({ label, value, icon: Icon, gradient, glow, trendLabel }) => (
          <div key={label} style={{ ...card, padding: isMobile ? '16px 16px 14px' : '22px 22px 20px', position: 'relative', overflow: 'hidden', minWidth: 0 }}>
            <div style={{ position: 'absolute', top: -24, right: -24, width: 80, height: 80, borderRadius: '50%', background: glow, pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 16px ${glow}`,
              }}>
                <Icon size={20} color="#fff" strokeWidth={2} />
              </div>
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, background: '#f8f9fc', padding: '4px 10px', borderRadius: 20, border: '1px solid #eef0f6' }}>
                {trendLabel}
              </span>
            </div>

            <p style={{ fontSize: 12.5, color: '#9ca3af', fontWeight: 500, margin: 0 }}>{label}</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: '#0f1117', margin: '6px 0 0', lineHeight: 1, letterSpacing: '-1.5px' }}>
              {loading ? '—' : (value ?? 0).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: isMobile ? 18 : 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1f2937', margin: '0 0 6px' }}>Welcome to the Admin Panel</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.7 }}>
          This dashboard gives you a live overview of the platform. User management, product
          management, and system health tools will appear here as they're built out.
        </p>
      </div>
    </div>
  );
}
