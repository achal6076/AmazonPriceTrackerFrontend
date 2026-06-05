import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTracking, getAlerts } from '../api/tracking';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Bell, TrendingDown, Wallet,
  ArrowUpRight, ExternalLink, Package,
  Plus, Activity, ChevronRight, Zap,
  MoreHorizontal, ShoppingBag,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useBreakpoint } from '../hooks/useBreakpoint';
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
  { date: 'Mar 1', price: 24000 }, { date: 'Mar 8', price: 23200 },
  { date: 'Mar 15', price: 23800 }, { date: 'Mar 22', price: 22100 },
  { date: 'Apr 1', price: 21499 }, { date: 'Apr 8', price: 22300 },
  { date: 'Apr 15', price: 21000 }, { date: 'May 1', price: 20500 },
  { date: 'May 8', price: 20200 }, { date: 'May 15', price: 19990 },
  { date: 'Jun 1', price: 19990 },
];

const SPARKLINE_UP   = [10, 12, 11, 14, 13, 15, 14, 16];
const SPARKLINE_DOWN = [16, 15, 14, 13, 12, 11, 11, 10];
const TIME_FILTERS   = ['1M', '3M', '6M', '1Y', 'All'];

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #eef0f6', boxShadow: '0 2px 12px rgba(0,0,0,.05)',
};

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e2140', borderRadius: 12, padding: '9px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.25)' }}>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>₹{payload[0]?.value?.toLocaleString('en-IN')}</p>
    </div>
  );
}

function MiniSpark({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width={64} height={28}>
      <LineChart data={data.map((v, i) => ({ i, v }))}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ProductThumb({ src, size = 40 }: { src: string | null; size?: number }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div style={{ width: size, height: size, borderRadius: 11, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Package size={size * 0.38} color="#d1d5db" />
      </div>
    );
  }
  return <img src={src} onError={() => setErr(true)} alt="" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 11, background: '#f9fafb', padding: 4, border: '1px solid #eef0f6', flexShrink: 0 }} />;
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuthStore();
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;           // stack single-column
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

  const activeTracked  = tracked.filter(t => t.is_active).length;
  const pausedTracked  = tracked.filter(t => !t.is_active).length;
  const withTarget     = tracked.filter(t => t.is_active && t.target_price).length;
  const pieData = [
    { name: 'Active',      value: activeTracked,          color: '#34d399' },
    { name: 'With Target', value: withTarget,             color: '#818cf8' },
    { name: 'Triggered',   value: alerts.length,          color: '#fbbf24' },
    { name: 'Paused',      value: pausedTracked,          color: '#d1d5db' },
  ].filter(d => d.value > 0);
  const pieTotal = pieData.reduce((a, b) => a + b.value, 0);

  const displayName = user?.email?.split('@')[0] ?? 'User';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    {
      label: 'Tracked Products', value: tracked.length, icon: ShoppingBag,
      gradient: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
      glow: 'rgba(108,99,255,.25)', trend: tracked.length, trendLabel: 'total',
    },
    {
      label: 'Price Alerts', value: alerts.length, icon: Bell,
      gradient: 'linear-gradient(135deg,#10b981,#34d399)',
      glow: 'rgba(16,185,129,.25)', trend: alerts.length, trendLabel: 'triggered',
    },
    {
      label: 'Price Drops', value: alerts.length, icon: TrendingDown,
      gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      glow: 'rgba(245,158,11,.25)', trend: alerts.length, trendLabel: 'this month',
    },
    {
      label: 'Total Saved', value: `₹${totalSaved.toLocaleString('en-IN')}`, icon: Wallet,
      gradient: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
      glow: 'rgba(59,130,246,.25)', trend: null, trendLabel: 'all time',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* ── Welcome Banner ── */}
      <div style={{
        borderRadius: 20, overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(135deg, #13152e 0%, #1e2248 60%, #252868 100%)',
        padding: isMobile ? '22px 20px' : '28px 32px',
        boxShadow: '0 8px 32px rgba(108,99,255,.2)',
      }}>
        <div style={{ position: 'absolute', top: -40, right: 80, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 16 : 0, position: 'relative' }}>
          <div>
            <p style={{ fontSize: 12.5, color: '#a78bfa', fontWeight: 600, margin: '0 0 6px', letterSpacing: '.5px' }}>
              {greeting}, {displayName} 👋
            </p>
            <h1 style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-.5px', lineHeight: 1.2 }}>
              {tracked.length === 0 ? 'Start tracking your first product' : `You're tracking ${tracked.length} product${tracked.length !== 1 ? 's' : ''}`}
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 7, lineHeight: 1.6 }}>
              {tracked.length === 0
                ? 'Paste any Amazon product URL to monitor price changes.'
                : `${alerts.length} alert${alerts.length !== 1 ? 's' : ''} triggered · ₹${totalSaved.toLocaleString('en-IN')} saved`}
            </p>
          </div>
          <button onClick={() => navigate('/products')} style={{
            display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
            padding: isMobile ? '11px 20px' : '13px 24px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
            color: '#fff', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 6px 20px rgba(108,99,255,.5)', alignSelf: isMobile ? 'flex-start' : 'center',
          }}>
            <Plus size={15} />
            {tracked.length === 0 ? 'Add Product' : 'Track More'}
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 16 }}>
        {statCards.map(({ label, value, icon: Icon, gradient, glow, trendLabel }) => (
          <div key={label} style={{ ...card, padding: isMobile ? '16px 16px 14px' : '22px 22px 20px', position: 'relative', overflow: 'hidden' }}>
            {/* Subtle gradient corner blob */}
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
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Middle Row: Chart + Recent Drops ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : '1fr 300px', gap: 18 }}>

        {/* Price History */}
        <div style={{ ...card, padding: isMobile ? '18px 16px 16px' : '24px 24px 20px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', gap: isMobile ? 10 : 0, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f1117', margin: 0 }}>Price History</h2>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
                {tracked.length === 0 ? 'Add products to see real price trends' : `${tracked[0]?.title?.slice(0, 40) ?? 'Product'}…`}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {TIME_FILTERS.map(f => (
                <button key={f} onClick={() => setActiveFilter(f)} style={{
                  padding: '5px 10px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer', transition: 'all .15s',
                  background: activeFilter === f ? '#6c63ff' : 'transparent',
                  color: activeFilter === f ? '#fff' : '#9ca3af',
                }}>{f}</button>
              ))}
              <button style={{ padding: '5px 7px', border: 'none', background: 'transparent', cursor: 'pointer', marginLeft: 4 }}>
                <MoreHorizontal size={15} color="#9ca3af" />
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MOCK_HISTORY} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#c4c9d4' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#c4c9d4' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="price" stroke="#6c63ff" strokeWidth={2.5}
                fill="url(#priceGrad)"
                dot={false} activeDot={{ r: 6, fill: '#6c63ff', stroke: '#fff', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Bottom highlight bar */}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1.5px solid #bbf7d0', borderRadius: 14, padding: '12px 16px' }}>
            <div style={{ width: 34, height: 34, background: '#dcfce7', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Zap size={15} color="#16a34a" />
            </div>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 800, color: '#166534', margin: 0 }}>Lowest price in 3 months</p>
              <p style={{ fontSize: 11.5, color: '#16a34a', margin: '2px 0 0' }}>₹19,990 — You saved ₹4,010 (17%) by tracking!</p>
            </div>
          </div>
        </div>

        {/* Recent Price Drops */}
        <div style={{ ...card, padding: '22px 20px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f1117', margin: 0 }}>Recent Drops</h2>
            <Link to="/alerts" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: '#6c63ff', textDecoration: 'none' }}>
              View All <ChevronRight size={13} />
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 12px', textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: '1.5px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <TrendingDown size={26} color="#34d399" strokeWidth={1.8} />
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#374151', margin: 0 }}>No drops yet</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '6px 0 16px', lineHeight: 1.5 }}>
                Set a target price on any tracked product to get notified instantly
              </p>
              <button onClick={() => navigate('/products')} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 11, border: 'none',
                background: '#eef2ff', color: '#6c63ff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              }}>
                <Plus size={13} /> Add Product
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
              {alerts.slice(0, 5).map((a) => {
                const pct = Math.round(((parseFloat(a.target_price) - parseFloat(a.triggered_price)) / parseFloat(a.target_price)) * 100);
                return (
                  <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <ProductThumb src={null} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.title ?? a.asin}
                      </p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                        {new Date(a.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#111827', margin: 0 }}>₹{Number(a.triggered_price).toLocaleString('en-IN')}</p>
                      <span style={{ fontSize: 10.5, background: '#dcfce7', color: '#16a34a', padding: '2px 7px', borderRadius: 20, fontWeight: 800 }}>-{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Row: Products Table + Alert Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr' : '1fr 300px', gap: 18 }}>

        {/* Tracked Products */}
        <div style={{ ...card, overflow: 'hidden', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1.5px solid #f3f4f6' }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f1117', margin: 0 }}>Tracked Products</h2>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>{tracked.length} product{tracked.length !== 1 ? 's' : ''} being monitored</p>
            </div>
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: '#6c63ff', textDecoration: 'none', background: '#eef2ff', padding: '7px 14px', borderRadius: 10 }}>
              View All <ArrowUpRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 52 }}>
              <div style={{ width: 28, height: 28, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            </div>
          ) : tracked.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '52px 24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(108,99,255,.12)' }}>
                <ShoppingBag size={28} color="#818cf8" strokeWidth={1.6} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: 0 }}>No products tracked yet</p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: '6px 0 20px', lineHeight: 1.6 }}>
                Paste any Amazon URL and we'll watch<br />the price 24/7 for you.
              </p>
              <button onClick={() => navigate('/products')} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
                color: '#fff', fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(108,99,255,.35)',
              }}>
                <Plus size={15} /> Track your first product
              </button>
            </div>
          ) : isSmall ? (
            /* ── Mobile / Tablet card list ── */
            <div>
              {tracked.slice(0, 5).map((item, idx) => {
                const current = item.current_price ? parseFloat(item.current_price) : null;
                const target  = item.target_price  ? parseFloat(item.target_price)  : null;
                const hit     = current !== null && target !== null && current <= target;
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: idx < Math.min(tracked.length, 5) - 1 ? '1px solid #f9fafb' : 'none' }}>
                    <ProductThumb src={item.image_url} size={44} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title ?? item.asin}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: hit ? '#10b981' : '#374151' }}>
                          {current ? `₹${current.toLocaleString('en-IN')}` : '—'}
                        </span>
                        {target && <span style={{ fontSize: 11, color: '#9ca3af' }}>Target: ₹{target.toLocaleString('en-IN')}</span>}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: item.is_active ? '#ecfdf5' : '#f3f4f6', color: item.is_active ? '#059669' : '#9ca3af' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.is_active ? '#10b981' : '#d1d5db' }} />
                          {item.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                    </div>
                    <a href={item.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', padding: 8, borderRadius: 10, background: '#f3f4f6', color: '#9ca3af', flexShrink: 0 }}>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── Desktop table ── */
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#fafbfc' }}>
                  {['Product', 'Current Price', 'Target', 'Trend', 'Status', ''].map((h, i) => (
                    <th key={i} style={{ padding: '11px 18px', fontSize: 11.5, fontWeight: 600, color: '#9ca3af', textAlign: i === 0 ? 'left' : 'center', borderBottom: '1.5px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tracked.slice(0, 5).map((item, idx) => {
                  const current = item.current_price ? parseFloat(item.current_price) : null;
                  const target  = item.target_price  ? parseFloat(item.target_price)  : null;
                  const hit     = current !== null && target !== null && current <= target;
                  return (
                    <tr key={item.id} style={{ borderBottom: idx < Math.min(tracked.length, 5) - 1 ? '1px solid #f9fafb' : 'none', transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '13px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <ProductThumb src={item.image_url} size={40} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title ?? item.asin}</p>
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: '3px 0 0' }}>{item.asin}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 18px', textAlign: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: hit ? '#10b981' : '#111827' }}>
                          {current ? `₹${current.toLocaleString('en-IN')}` : '—'}
                        </span>
                        {hit && <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 7px', borderRadius: 20, fontWeight: 800, marginLeft: 6 }}>Hit!</span>}
                      </td>
                      <td style={{ padding: '13px 18px', textAlign: 'center', fontSize: 13, color: '#374151', fontWeight: 500 }}>
                        {target ? `₹${target.toLocaleString('en-IN')}` : <span style={{ color: '#c4c9d4' }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 18px', textAlign: 'center' }}>
                        <MiniSpark data={hit ? SPARKLINE_DOWN : SPARKLINE_UP} color={hit ? '#34d399' : '#6c63ff'} />
                      </td>
                      <td style={{ padding: '13px 18px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: item.is_active ? '#ecfdf5' : '#f3f4f6', color: item.is_active ? '#059669' : '#9ca3af' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.is_active ? '#10b981' : '#d1d5db' }} />
                          {item.is_active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td style={{ padding: '13px 14px', textAlign: 'center' }}>
                        <a href={item.url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', padding: 6, borderRadius: 8, background: '#f3f4f6', color: '#9ca3af' }}>
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

        {/* Price Alert Summary */}
        <div style={{ ...card, padding: '22px 20px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f1117', margin: 0 }}>Alert Summary</h2>
            <span style={{ fontSize: 11, color: '#6c63ff', background: '#eef2ff', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>Live</span>
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>Breakdown of your price alerts</p>

          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', marginBottom: 8 }}>
            {pieTotal > 0 ? (
              <PieChart width={170} height={170}>
                <Pie data={pieData} cx={81} cy={81} innerRadius={52} outerRadius={76}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
              </PieChart>
            ) : (
              <div style={{ width: 170, height: 170, borderRadius: '50%', border: '14px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              </div>
            )}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <p style={{ fontSize: 32, fontWeight: 900, color: '#0f1117', margin: 0, lineHeight: 1, letterSpacing: '-1.5px' }}>{tracked.length}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: '5px 0 0', fontWeight: 500 }}>Tracked</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
            {pieTotal > 0 ? pieData.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: '#374151', fontWeight: 500 }}>{d.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{d.value}</span>
                  <span style={{ fontSize: 11, color: '#c4c9d4', minWidth: 40, textAlign: 'right' }}>({Math.round((d.value / pieTotal) * 100)}%)</span>
                </div>
              </div>
            )) : (
              <p style={{ fontSize: 13, color: '#d1d5db', textAlign: 'center', margin: 0 }}>No products tracked yet</p>
            )}
          </div>

          <button onClick={() => navigate('/alerts')} style={{
            marginTop: 'auto', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            background: 'transparent', border: 'none', fontSize: 13, fontWeight: 700,
            color: '#6c63ff', cursor: 'pointer',
          }}>
            <Activity size={14} /> Manage Alerts
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
