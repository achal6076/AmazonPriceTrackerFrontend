import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTracking, getAlerts } from '../api/tracking';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Target, Bell, TrendingDown, Wallet, MoreHorizontal, ArrowUpRight, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrackedItem {
  id: string; target_price: string | null; is_active: boolean;
  product_id: string; title: string | null; url: string;
  image_url: string | null; current_price: string | null; asin: string;
}
interface AlertItem {
  id: string; target_price: string; triggered_price: string;
  sent_at: string; title: string | null; url: string; asin: string;
}

const MOCK_HISTORY = [
  { date: 'Mar 1', price: 24000 }, { date: 'Mar 8', price: 23500 },
  { date: 'Mar 15', price: 23800 }, { date: 'Mar 22', price: 22500 },
  { date: 'Apr 1', price: 21499 }, { date: 'Apr 8', price: 22000 },
  { date: 'Apr 15', price: 21200 }, { date: 'May 1', price: 20800 },
  { date: 'May 8', price: 20500 }, { date: 'May 15', price: 19990 },
  { date: 'Jun 1', price: 19990 },
];

const PIE_DATA = [
  { name: 'Active',    value: 6, color: '#34d399' },
  { name: 'Triggered', value: 3, color: '#fbbf24' },
  { name: 'Expired',   value: 1, color: '#f87171' },
  { name: 'Paused',    value: 1, color: '#d1d5db' },
];
const PIE_TOTAL = PIE_DATA.reduce((a, b) => a + b.value, 0);

const STAT_CARDS = [
  { label: 'Tracked Products',  icon: Target,      iconColor: '#818cf8', iconBg: '#eef2ff', key: 'tracked' },
  { label: 'Total Price Alerts', icon: Bell,        iconColor: '#34d399', iconBg: '#ecfdf5', key: 'alerts'  },
  { label: 'Price Drops',       icon: TrendingDown, iconColor: '#fbbf24', iconBg: '#fffbeb', key: 'drops'   },
  { label: 'Total Saved',       icon: Wallet,       iconColor: '#60a5fa', iconBg: '#eff6ff', key: 'saved'   },
];

const TIME_FILTERS = ['1M', '3M', '6M', '1Y', 'All'];

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #f1f3f9',
  boxShadow: '0 1px 4px rgba(0,0,0,.06)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', borderRadius:12, padding:'8px 12px', boxShadow:'0 4px 16px rgba(0,0,0,.12)', border:'1px solid #f0f0f0' }}>
      <p style={{ fontSize:11, color:'#9ca3af', marginBottom:2 }}>{label}</p>
      <p style={{ fontSize:13, fontWeight:700, color:'#1f2937' }}>₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

export default function Dashboard() {
  const [tracked, setTracked]   = useState<TrackedItem[]>([]);
  const [alerts, setAlerts]     = useState<AlertItem[]>([]);
  const [loading, setLoading]   = useState(true);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page title */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 3 }}>Track, analyze and save on Amazon</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STAT_CARDS.map(({ label, icon: Icon, iconColor, iconBg, key }) => (
          <div key={key} style={{ ...card, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: iconBg, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color={iconColor} />
              </div>
              <div>
                <p style={{ fontSize: 11.5, color: '#9ca3af', fontWeight: 500, margin: 0 }}>{label}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1.1, margin: '4px 0 0' }}>
                  {statValues[key]}
                </p>
                <p style={{ fontSize: 11, color: '#34d399', fontWeight: 600, marginTop: 6 }}>
                  +{key === 'saved' ? '₹2,000' : '2'} this week
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row: Price History + Recent Price Drops */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

        {/* Price History */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Price History</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {TIME_FILTERS.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all .15s',
                  background: activeFilter === f ? '#6c63ff' : 'transparent',
                  color: activeFilter === f ? '#fff' : '#9ca3af',
                }}>{f}</button>
              ))}
              <button style={{ padding: '4px 6px', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                <MoreHorizontal size={16} color="#9ca3af" />
              </button>
            </div>
          </div>

          {/* Product row */}
          {tracked[0] ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {tracked[0].image_url && (
                  <img src={tracked[0].image_url} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, background: '#f9fafb' }} alt="" />
                )}
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tracked[0].title ?? tracked[0].asin}
                  </p>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{tracked[0].asin} • Electronics</p>
                </div>
              </div>
              {tracked[0].current_price && (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: '#111827' }}>
                    ₹{Number(tracked[0].current_price).toLocaleString('en-IN')}
                  </span>
                  <span style={{ marginLeft: 8, fontSize: 11, background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>-20%</span>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Min: ₹{Number(tracked[0].current_price).toLocaleString('en-IN')} | Max: ₹{(Number(tracked[0].current_price) * 1.25).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>No tracked products yet</p>
          )}

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_HISTORY} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="price" stroke="#6c63ff" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#6c63ff', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>

          <div style={{
            marginTop: 12, display: 'flex', alignItems: 'center', gap: 10,
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '10px 14px',
          }}>
            <div style={{ width: 28, height: 28, background: '#dcfce7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Target size={13} color="#16a34a" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#166534', margin: 0 }}>Lowest price ever</p>
              <p style={{ fontSize: 11, color: '#16a34a', margin: '2px 0 0' }}>You saved ₹5,000 (20%) by waiting!</p>
            </div>
          </div>
        </div>

        {/* Recent Price Drops */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Recent Price Drops</h2>
            <Link to="/alerts" style={{ fontSize: 12, fontWeight: 600, color: '#6c63ff', textDecoration: 'none' }}>View All</Link>
          </div>

          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <TrendingDown size={32} color="#e5e7eb" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 12, color: '#9ca3af' }}>No price drops yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {alerts.slice(0, 5).map((a) => {
                const pct = Math.round(((parseFloat(a.target_price) - parseFloat(a.triggered_price)) / parseFloat(a.target_price)) * 100);
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, background: '#f3f4f6', borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Target size={14} color="#9ca3af" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title ?? a.asin}</p>
                      <p style={{ fontSize: 10.5, color: '#9ca3af', margin: '2px 0 0' }}>Electronics</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', margin: 0 }}>₹{Number(a.triggered_price).toLocaleString('en-IN')}</p>
                      <p style={{ fontSize: 10.5, color: '#34d399', fontWeight: 700, margin: '2px 0 0' }}>-{pct}% ↓</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button style={{
            width: '100%', marginTop: 16, padding: '8px 0', border: '1px solid #e5e7eb',
            borderRadius: 10, background: 'transparent', fontSize: 12, fontWeight: 500,
            color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            View All Price Drops <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* Bottom row: Tracked Products Table + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>

        {/* Table */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f9fafb' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: 0 }}>Your Tracked Products</h2>
            <Link to="/products" style={{ fontSize: 12, fontWeight: 600, color: '#6c63ff', textDecoration: 'none' }}>View All</Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 24, height: 24, border: '3px solid #e5e7eb', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            </div>
          ) : tracked.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: 13 }}>No products tracked yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f3f4f6' }}>
                  {['Product', 'Current Price', 'Target Price', 'Lowest Price', 'Alert Status', ''].map((h) => (
                    <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textAlign: h === 'Product' ? 'left' : 'right', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tracked.slice(0, 5).map((item, idx) => {
                  const current = item.current_price ? parseFloat(item.current_price) : null;
                  const target  = item.target_price  ? parseFloat(item.target_price)  : null;
                  const hit     = current !== null && target !== null && current <= target;
                  return (
                    <tr key={item.id} style={{ borderTop: idx > 0 ? '1px solid #f9fafb' : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {item.image_url ? (
                            <img src={item.image_url} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, background: '#f9fafb' }} alt="" />
                          ) : (
                            <div style={{ width: 36, height: 36, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Target size={13} color="#d1d5db" />
                            </div>
                          )}
                          <div>
                            <p style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', margin: 0, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title ?? item.asin}
                            </p>
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{item.asin} • Electronics</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                            {current ? `₹${current.toLocaleString('en-IN')}` : '—'}
                          </span>
                          {hit && <span style={{ fontSize: 10, background: '#fee2e2', color: '#ef4444', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>-20%</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: '#374151' }}>
                        {target ? `₹${target.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, color: '#374151' }}>
                        {current ? `₹${current.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
                          background: item.is_active ? '#ecfdf5' : '#f3f4f6',
                          color: item.is_active ? '#059669' : '#9ca3af',
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.is_active ? '#10b981' : '#d1d5db', flexShrink: 0 }} />
                          {item.is_active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ color: '#9ca3af', display: 'inline-block' }}>
                          <ExternalLink size={13} />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Donut chart */}
        <div style={{ ...card, padding: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Price Alert Summary</h2>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <PieChart width={170} height={170}>
              <Pie data={PIE_DATA} cx={80} cy={80} innerRadius={52} outerRadius={75}
                paddingAngle={3} dataKey="value" strokeWidth={0}>
                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1 }}>{PIE_TOTAL}</p>
              <p style={{ fontSize: 10.5, color: '#9ca3af', margin: '3px 0 0' }}>Total Alerts</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
            {PIE_DATA.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: '#374151' }}>{d.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{d.value}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>({Math.round((d.value / PIE_TOTAL) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>

          <button style={{
            width: '100%', marginTop: 16, padding: '9px 0', border: '1px solid #e5e7eb',
            borderRadius: 10, background: 'transparent', fontSize: 12, fontWeight: 600,
            color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <Target size={13} /> Manage Alerts
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
