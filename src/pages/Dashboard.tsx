import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTracking, getAlerts } from '../api/tracking';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Target, Bell, TrendingDown, Wallet,
  MoreHorizontal, ArrowUpRight, ExternalLink, MoreVertical,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TrackedItem {
  id: string; target_price: string | null; is_active: boolean;
  product_id: string; title: string | null; url: string;
  image_url: string | null; current_price: string | null; asin: string;
}
interface AlertItem {
  id: string; target_price: string; triggered_price: string;
  sent_at: string; title: string | null; url: string; asin: string; image_url?: string;
}

const MOCK_HISTORY = [
  { date: 'Mar 1', price: 24000 }, { date: 'Mar 8', price: 23200 },
  { date: 'Mar 15', price: 23800 }, { date: 'Mar 22', price: 22100 },
  { date: 'Apr 1', price: 21499 }, { date: 'Apr 8', price: 22300 },
  { date: 'Apr 15', price: 21000 }, { date: 'May 1', price: 20500 },
  { date: 'May 8', price: 20200 }, { date: 'May 15', price: 19990 },
  { date: 'Jun 1', price: 19990 },
];

const SPARKLINE_UP   = [10, 12, 11, 14, 13, 15, 14, 16];
const SPARKLINE_DOWN = [16, 15, 14, 13, 12, 11, 11, 10];

const PIE_DATA = [
  { name: 'Active',    value: 6, color: '#34d399' },
  { name: 'Triggered', value: 3, color: '#fbbf24' },
  { name: 'Expired',   value: 1, color: '#f87171' },
  { name: 'Paused',    value: 1, color: '#d1d5db' },
];
const PIE_TOTAL = PIE_DATA.reduce((a, b) => a + b.value, 0);

const STAT_CARDS = [
  { label: 'Tracked Products',   icon: Target,       iconColor: '#818cf8', iconBg: '#eef2ff', key: 'tracked', trend: '+3 this week' },
  { label: 'Total Price Alerts', icon: Bell,          iconColor: '#34d399', iconBg: '#ecfdf5', key: 'alerts',  trend: '+2 this week' },
  { label: 'Price Drops',        icon: TrendingDown,  iconColor: '#fbbf24', iconBg: '#fffbeb', key: 'drops',   trend: '+4 this week' },
  { label: 'Total Saved',        icon: Wallet,        iconColor: '#60a5fa', iconBg: '#eff6ff', key: 'saved',   trend: 'All time' },
];

const TIME_FILTERS = ['1M', '3M', '6M', '1Y', 'All'];

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 18,
  border: '1px solid #eef0f6',
  boxShadow: '0 2px 8px rgba(0,0,0,.05)',
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e2140', borderRadius: 12, padding: '8px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => (
  <ResponsiveContainer width={72} height={30}>
    <LineChart data={data.map((v, i) => ({ i, v }))}>
      <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

export default function Dashboard() {
  const [tracked, setTracked] = useState<TrackedItem[]>([]);
  const [alerts,  setAlerts]  = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('3M');

  useEffect(() => {
    Promise.all([getTracking(), getAlerts()])
      .then(([t, a]) => { setTracked(t); setAlerts(a); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const totalSaved = alerts.reduce((acc, a) =>
    acc + Math.max(0, parseFloat(a.target_price) - parseFloat(a.triggered_price)), 0);

  const statValues: Record<string, string | number> = {
    tracked: tracked.length,
    alerts:  alerts.length,
    drops:   alerts.length,
    saved:   `₹${totalSaved.toLocaleString('en-IN')}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Dashboard</h1>
        <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>Track, analyze and save on Amazon</p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STAT_CARDS.map(({ label, icon: Icon, iconColor, iconBg, key, trend }) => (
          <div key={key} style={{ ...card, padding: '22px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 15, background: iconBg, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${iconColor}30`,
              }}>
                <Icon size={24} color={iconColor} strokeWidth={1.8} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, margin: 0, lineHeight: 1 }}>{label}</p>
                <p style={{ fontSize: 30, fontWeight: 800, color: '#0f1117', lineHeight: 1.1, margin: '6px 0 0', letterSpacing: '-1px' }}>
                  {statValues[key]}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>
                    {key !== 'saved' ? `+${Math.max(0, (statValues[key] as number))} ` : ''}
                  </span>
                  <span style={{ fontSize: 11.5, color: '#10b981', fontWeight: 600 }}>{trend}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Middle Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 18 }}>

        {/* Price History Chart */}
        <div style={{ ...card, padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>Price History</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {TIME_FILTERS.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: '5px 11px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all .15s',
                  background: activeFilter === f ? '#6c63ff' : 'transparent',
                  color: activeFilter === f ? '#fff' : '#9ca3af',
                }}>{f}</button>
              ))}
              <button style={{ padding: '5px 8px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <MoreHorizontal size={16} color="#9ca3af" />
              </button>
            </div>
          </div>

          {tracked[0] ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, padding: '12px 14px', background: '#f8f9fc', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {tracked[0].image_url
                  ? <img src={tracked[0].image_url} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10, background: '#fff', padding: 4, border: '1px solid #eef0f6' }} alt="" />
                  : <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} color="#9ca3af" /></div>
                }
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tracked[0].title ?? tracked[0].asin}
                  </p>
                  <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '3px 0 0' }}>{tracked[0].asin} • Electronics</p>
                </div>
              </div>
              {tracked[0].current_price && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0f1117' }}>₹{Number(tracked[0].current_price).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: 11, background: '#fee2e2', color: '#ef4444', padding: '3px 9px', borderRadius: 20, fontWeight: 800 }}>-20%</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>
                    Min: ₹{Number(tracked[0].current_price).toLocaleString('en-IN')} &nbsp;|&nbsp;
                    Max: ₹{(Number(tracked[0].current_price) * 1.25).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 12.5, color: '#9ca3af', marginBottom: 16 }}>No tracked products yet</p>
          )}

          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={MOCK_HISTORY} margin={{ top: 6, right: 6, left: -5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#c4c9d4' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#c4c9d4' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="price" stroke="#6c63ff" strokeWidth={2.5}
                dot={false} activeDot={{ r: 6, fill: '#6c63ff', stroke: '#fff', strokeWidth: 3 }} />
            </LineChart>
          </ResponsiveContainer>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 13, padding: '11px 16px' }}>
            <div style={{ width: 30, height: 30, background: '#dcfce7', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Target size={14} color="#16a34a" />
            </div>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 800, color: '#166534', margin: 0 }}>Lowest price ever</p>
              <p style={{ fontSize: 11.5, color: '#16a34a', margin: '2px 0 0' }}>You saved ₹5,000 (20%) by waiting!</p>
            </div>
          </div>
        </div>

        {/* Recent Price Drops */}
        <div style={{ ...card, padding: '22px 20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>Recent Price Drops</h2>
            <Link to="/alerts" style={{ fontSize: 12, fontWeight: 700, color: '#6c63ff', textDecoration: 'none' }}>View All</Link>
          </div>

          {alerts.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 0' }}>
              <TrendingDown size={36} color="#e5e7eb" />
              <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 10 }}>No price drops yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {alerts.slice(0, 5).map((a) => {
                const pct = Math.round(((parseFloat(a.target_price) - parseFloat(a.triggered_price)) / parseFloat(a.target_price)) * 100);
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 42, height: 42, background: '#f3f4f6', borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {a.image_url
                        ? <img src={a.image_url} style={{ width: 42, height: 42, objectFit: 'contain' }} alt="" />
                        : <Target size={16} color="#d1d5db" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title ?? a.asin}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>Electronics</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>₹{Number(a.triggered_price).toLocaleString('en-IN')}</p>
                      <p style={{ fontSize: 11, color: '#10b981', fontWeight: 700, margin: '3px 0 0' }}>-{pct}% ↓</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: 'transparent', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#6b7280', cursor: 'pointer' }}>
            View All Price Drops <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 18 }}>

        {/* Tracked Products Table */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1.5px solid #f3f4f6' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>Your Tracked Products</h2>
            <Link to="/products" style={{ fontSize: 12, fontWeight: 700, color: '#6c63ff', textDecoration: 'none' }}>View All</Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
              <div style={{ width: 28, height: 28, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            </div>
          ) : tracked.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 13.5 }}>No products tracked yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafbfc' }}>
                  {['Product', 'Current Price', 'Target Price', 'Price Trend', 'Lowest Price', 'Alert Status', ''].map((h, i) => (
                    <th key={i} style={{ padding: '11px 16px', fontSize: 11.5, fontWeight: 600, color: '#9ca3af', textAlign: i === 0 ? 'left' : 'center', borderBottom: '1.5px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tracked.slice(0, 5).map((item, idx) => {
                  const current = item.current_price ? parseFloat(item.current_price) : null;
                  const target  = item.target_price  ? parseFloat(item.target_price)  : null;
                  const hit     = current !== null && target !== null && current <= target;
                  return (
                    <tr key={item.id} style={{ borderBottom: idx < tracked.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          {item.image_url
                            ? <img src={item.image_url} style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 9, background: '#f9fafb', padding: 3, border: '1px solid #eef0f6' }} alt="" />
                            : <div style={{ width: 38, height: 38, background: '#f3f4f6', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={14} color="#d1d5db" /></div>
                          }
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title ?? item.asin}</p>
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: '3px 0 0' }}>{item.asin} • Electronics</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#111827' }}>{current ? `₹${current.toLocaleString('en-IN')}` : '—'}</span>
                          {hit && <span style={{ fontSize: 10, background: '#fee2e2', color: '#ef4444', padding: '2px 7px', borderRadius: 20, fontWeight: 800 }}>-20%</span>}
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                        {target ? `₹${target.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <MiniSparkline data={hit ? SPARKLINE_DOWN : SPARKLINE_UP} color={hit ? '#34d399' : '#6c63ff'} />
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                        {current ? `₹${current.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 20,
                          background: item.is_active ? '#ecfdf5' : '#f3f4f6',
                          color: item.is_active ? '#059669' : '#9ca3af',
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.is_active ? '#10b981' : '#d1d5db' }} />
                          {item.is_active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 12px', textAlign: 'center' }}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          <MoreVertical size={15} color="#d1d5db" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Price Alert Summary */}
        <div style={{ ...card, padding: '22px 20px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: '0 0 20px' }}>Price Alert Summary</h2>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 4 }}>
            <PieChart width={175} height={175}>
              <Pie data={PIE_DATA} cx={83} cy={83} innerRadius={54} outerRadius={78}
                paddingAngle={3} dataKey="value" strokeWidth={0}>
                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <p style={{ fontSize: 30, fontWeight: 800, color: '#0f1117', margin: 0, lineHeight: 1, letterSpacing: '-1px' }}>{PIE_TOTAL}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0', fontWeight: 500 }}>Total Alerts</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 14 }}>
            {PIE_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>{d.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{d.value}</span>
                  <span style={{ fontSize: 11.5, color: '#9ca3af' }}>({Math.round((d.value / PIE_TOTAL) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>

          <button style={{
            width: '100%', marginTop: 20, padding: '10px 0',
            border: '1.5px solid #eef0f6', borderRadius: 11,
            background: '#fafbfc', fontSize: 12.5, fontWeight: 600,
            color: '#374151', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <Target size={13} color="#6b7280" /> Manage Alerts
          </button>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11.5, color: '#c4c9d4', marginTop: 4 }}>
        🔒 We never share your data. Your data is 100% secure.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// needed for TS
function Package({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
