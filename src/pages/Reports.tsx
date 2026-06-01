import { useEffect, useState } from 'react';
import { getAlerts, getTracking } from '../api/tracking';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingDown, Bell, Package, Award, Calendar, IndianRupee } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

interface Alert {
  id: string; target_price: string; triggered_price: string;
  sent_at: string; title: string | null; url: string;
}
interface Track {
  id: string; target_price: string | null; current_price: string | null;
  title: string | null; created_at: string; is_active: boolean;
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 18,
  border: '1px solid #eef0f6', boxShadow: '0 2px 8px rgba(0,0,0,.05)',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Reports() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tracking, setTracking] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAlerts(), getTracking()])
      .then(([a, t]) => {
        setAlerts(Array.isArray(a) ? a : []);
        setTracking(Array.isArray(t) ? t : []);
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false));
  }, []);

  const totalSaved = alerts.reduce((acc, a) =>
    acc + Math.max(0, parseFloat(a.target_price) - parseFloat(a.triggered_price)), 0);

  const bestDeal = alerts.reduce<{ saving: number; title: string | null } | null>((best, a) => {
    const s = Math.max(0, parseFloat(a.target_price) - parseFloat(a.triggered_price));
    return !best || s > best.saving ? { saving: s, title: a.title } : best;
  }, null);

  // Group alerts by month for chart
  const monthlySavings: Record<string, number> = {};
  for (const a of alerts) {
    const key = monthKey(a.sent_at);
    const s = Math.max(0, parseFloat(a.target_price) - parseFloat(a.triggered_price));
    monthlySavings[key] = (monthlySavings[key] ?? 0) + s;
  }
  const chartData = Object.entries(monthlySavings)
    .map(([month, savings]) => ({ month, savings: Math.round(savings) }))
    .slice(-6);

  // Group tracked products by month added
  const trackByMonth: Record<string, number> = {};
  for (const t of tracking) {
    const key = monthKey(t.created_at);
    trackByMonth[key] = (trackByMonth[key] ?? 0) + 1;
  }
  const trackChart = Object.entries(trackByMonth)
    .map(([month, count]) => ({ month, count }))
    .slice(-6);

  const activeCount = tracking.filter((t) => t.is_active).length;

  const statCards = [
    { label: 'Total Savings', value: `₹${totalSaved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: IndianRupee, iconColor: '#10b981', iconBg: '#ecfdf5', sub: 'Across all alerts' },
    { label: 'Alerts Received', value: alerts.length, icon: Bell, iconColor: '#818cf8', iconBg: '#eef2ff', sub: 'Price drop notifications' },
    { label: 'Products Tracked', value: tracking.length, icon: Package, iconColor: '#f59e0b', iconBg: '#fffbeb', sub: `${activeCount} currently active` },
    { label: 'Best Single Deal', value: bestDeal ? `₹${bestDeal.saving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—', icon: Award, iconColor: '#ec4899', iconBg: '#fdf2f8', sub: bestDeal?.title ? (bestDeal.title.length > 22 ? bestDeal.title.slice(0, 22) + '…' : bestDeal.title) : 'No deals yet' },
  ];

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #eef0f6', borderRadius: 10, padding: '10px 14px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}>
        <p style={{ fontWeight: 700, color: '#0f1117', margin: '0 0 4px' }}>{label}</p>
        <p style={{ color: '#6c63ff', margin: 0 }}>
          {payload[0]?.name === 'savings' ? '₹' : ''}{payload[0]?.value?.toLocaleString('en-IN')}
          {payload[0]?.name === 'count' ? ' products' : ' saved'}
        </p>
      </div>
    );
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Reports</h1>
        <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>Your price tracking performance and savings overview</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : isTablet ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 14 }}>
        {statCards.map(({ label, value, icon: Icon, iconColor, iconBg, sub }) => (
          <div key={label} style={{ ...card, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${iconColor}30` }}>
                <Icon size={22} color={iconColor} strokeWidth={1.8} />
              </div>
            </div>
            <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>{value}</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0', fontWeight: 500 }}>{label}</p>
            <p style={{ fontSize: 11.5, color: '#c4c9d4', margin: '2px 0 0' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : '1fr 1fr', gap: 16 }}>

        {/* Savings by month */}
        <div style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={16} color="#6c63ff" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f1117', margin: 0 }}>Monthly Savings</p>
              <p style={{ fontSize: 11.5, color: '#9ca3af', margin: 0 }}>Amount saved per month</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f6fb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="savings" name="savings" fill="#6c63ff" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 13, color: '#d1d5db', textAlign: 'center' }}>No savings data yet.<br />Receive price alerts to see your savings.</p>
            </div>
          )}
        </div>

        {/* Products added by month */}
        <div style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={16} color="#f59e0b" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f1117', margin: 0 }}>Products Tracked</p>
              <p style={{ fontSize: 11.5, color: '#9ca3af', margin: 0 }}>New products added per month</p>
            </div>
          </div>
          {trackChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trackChart} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f6fb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="count" name="count" fill="#f59e0b" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 13, color: '#d1d5db', textAlign: 'center' }}>No tracking data yet.<br />Add products to start tracking.</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent alerts table */}
      {alerts.length > 0 && (
        <div style={{ ...card, padding: '24px' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#0f1117', margin: '0 0 18px' }}>Recent Alert Activity</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f4f6fb' }}>
                  {['Product', 'Triggered Price', 'Target Price', 'Savings', 'Date'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '0 12px 12px', color: '#9ca3af', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 10).map((a) => {
                  const saved = Math.max(0, parseFloat(a.target_price) - parseFloat(a.triggered_price));
                  const pct = saved / parseFloat(a.target_price) * 100;
                  return (
                    <tr key={a.id} style={{ borderBottom: '1px solid #f4f6fb' }}>
                      <td style={{ padding: '12px', fontWeight: 500, color: '#0f1117', maxWidth: 200 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title ?? 'Amazon Product'}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: 700 }}>₹{parseFloat(a.triggered_price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px', color: '#9ca3af' }}>₹{parseFloat(a.target_price).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: '#ecfdf5', borderRadius: 20, color: '#10b981', fontWeight: 600, fontSize: 11 }}>
                          ₹{saved.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({pct.toFixed(0)}%)
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                        {new Date(a.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
