import { useEffect, useState } from 'react';
import { getAlerts } from '../api/tracking';
import { Bell, TrendingDown, ExternalLink, Package, ChevronRight, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';

interface Alert {
  id: string; target_price: string; triggered_price: string;
  sent_at: string; title: string | null; url: string; asin: string;
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 18,
  border: '1px solid #eef0f6', boxShadow: '0 2px 8px rgba(0,0,0,.05)',
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts()
      .then(setAlerts)
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false));
  }, []);

  const totalSaved = alerts.reduce((acc, a) =>
    acc + Math.max(0, parseFloat(a.target_price) - parseFloat(a.triggered_price)), 0);

  const avgDrop = alerts.length
    ? alerts.reduce((acc, a) => {
        const pct = ((parseFloat(a.target_price) - parseFloat(a.triggered_price)) / parseFloat(a.target_price)) * 100;
        return acc + pct;
      }, 0) / alerts.length
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Price Alerts</h1>
        <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>History of price drop notifications sent to you</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Alerts Sent', value: alerts.length, icon: Bell, iconColor: '#818cf8', iconBg: '#eef2ff', sub: 'All time' },
          { label: 'Total Saved', value: `₹${totalSaved.toLocaleString('en-IN')}`, icon: BadgeCheck, iconColor: '#34d399', iconBg: '#ecfdf5', sub: 'Across all alerts' },
          { label: 'Avg. Price Drop', value: `${avgDrop.toFixed(1)}%`, icon: TrendingDown, iconColor: '#fbbf24', iconBg: '#fffbeb', sub: 'Per alert' },
        ].map(({ label, value, icon: Icon, iconColor, iconBg, sub }) => (
          <div key={label} style={{ ...card, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 15, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${iconColor}30` }}>
              <Icon size={24} color={iconColor} strokeWidth={1.8} />
            </div>
            <div>
              <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, margin: 0 }}>{label}</p>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', lineHeight: 1.1, margin: '5px 0 0', letterSpacing: '-0.5px' }}>{value}</p>
              <p style={{ fontSize: 11.5, color: '#c4c9d4', margin: '5px 0 0' }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts list */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #f3f4f6' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>Alert History</h2>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>{alerts.length} alert{alerts.length !== 1 ? 's' : ''} triggered</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '72px 0' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Bell size={30} color="#d1d5db" />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#6b7280', margin: 0 }}>No alerts yet</p>
            <p style={{ fontSize: 13, color: '#c4c9d4', margin: '6px 0 0' }}>
              Start tracking products with a target price to receive alerts
            </p>
          </div>
        ) : (
          <div>
            {alerts.map((alert, idx) => {
              const targetP  = parseFloat(alert.target_price);
              const actualP  = parseFloat(alert.triggered_price);
              const saved    = Math.max(0, targetP - actualP);
              const pct      = Math.round((saved / targetP) * 100);
              const date     = new Date(alert.sent_at);

              return (
                <div key={alert.id} style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 24px',
                  borderBottom: idx < alerts.length - 1 ? '1px solid #f9fafb' : 'none',
                  transition: 'background .15s',
                }}>
                  {/* Icon */}
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bell size={20} color="#10b981" />
                  </div>

                  {/* Product info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {alert.title ?? alert.asin}
                    </p>
                    <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '3px 0 0' }}>
                      {date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &nbsp;·&nbsp;
                      {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Prices */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
                        ₹{actualP.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '3px 9px', borderRadius: 20, fontWeight: 800 }}>
                        -{pct}%
                      </span>
                    </div>
                    <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '3px 0 0' }}>
                      Target was ₹{targetP.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Saved badge */}
                  <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 90 }}>
                    <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 12, padding: '7px 14px' }}>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>You saved</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#16a34a', margin: '2px 0 0' }}>₹{saved.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <a href={alert.url} target="_blank" rel="noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
                      background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', color: '#fff',
                      fontSize: 12.5, fontWeight: 700, boxShadow: '0 3px 10px rgba(108,99,255,.3)',
                    }}>
                      <ExternalLink size={12} /> Buy Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
