import { useEffect, useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  TrendingDown, TrendingUp, Activity, Package,
  ChevronDown, BarChart2, AlertCircle,
} from 'lucide-react';
import { getPriceHistory } from '../api/products';
import { getTracking } from '../api/tracking';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

interface Product {
  id: string; product_id: string; asin: string; title: string | null;
  image_url: string | null; current_price: string | null;
  lowest_price: string | null; highest_price: string | null;
}
interface HistoryPoint {
  id: string; product_id: string; price: string; recorded_at: string;
}

const TIME_FILTERS = [
  { label: '1M', months: 1 },
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
  { label: 'All', months: 0 },
];

function fromDate(months: number): string | undefined {
  if (!months) return undefined;
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString();
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 20,
  border: '1px solid #eef0f6', boxShadow: '0 2px 12px rgba(0,0,0,.05)',
};

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1e2140', borderRadius: 12, padding: '9px 14px', boxShadow: '0 8px 24px rgba(0,0,0,.25)' }}>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>
        ₹{payload[0]?.value?.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

export default function History() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;

  const [products, setProducts]     = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [history, setHistory]       = useState<HistoryPoint[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingHistory, setLoadingHistory]   = useState(false);
  const [activeFilter, setActiveFilter] = useState('3M');
  const [showSelector, setShowSelector] = useState(false);

  /* load user's tracked products */
  useEffect(() => {
    getTracking()
      .then((data: Product[]) => {
        setProducts(data);
        if (data.length) setSelectedId(data[0].product_id);
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoadingProducts(false));
  }, []);

  /* load history whenever product or filter changes */
  useEffect(() => {
    if (!selectedId) return;
    setLoadingHistory(true);
    const tf = TIME_FILTERS.find(f => f.label === activeFilter)!;
    getPriceHistory(selectedId, fromDate(tf.months), 200)
      .then(d => setHistory(d.data ?? []))
      .catch(() => toast.error('Failed to load price history'))
      .finally(() => setLoadingHistory(false));
  }, [selectedId, activeFilter]);

  const selected = products.find(p => p.product_id === selectedId);

  const chartData = useMemo(() =>
    [...history]
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map(h => ({
        date: new Date(h.recorded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        price: parseFloat(h.price),
        ts: new Date(h.recorded_at).getTime(),
      })),
    [history],
  );

  const prices  = chartData.map(d => d.price);
  const minP    = prices.length ? Math.min(...prices) : 0;
  const maxP    = prices.length ? Math.max(...prices) : 0;
  const avgP    = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const currP   = selected?.current_price ? parseFloat(selected.current_price) : (prices.at(-1) ?? 0);
  const firstP  = prices[0] ?? 0;
  const change  = firstP ? ((currP - firstP) / firstP) * 100 : 0;
  const isDown  = change <= 0;

  const statCards = [
    { label: 'Current Price', value: currP ? `₹${currP.toLocaleString('en-IN')}` : '—', icon: Activity, color: '#6c63ff', bg: '#eef2ff' },
    { label: 'Lowest Price',  value: minP  ? `₹${minP.toLocaleString('en-IN')}` : '—',  icon: TrendingDown, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Highest Price', value: maxP  ? `₹${maxP.toLocaleString('en-IN')}` : '—',  icon: TrendingUp,   color: '#f87171', bg: '#fef2f2' },
    { label: 'Average Price', value: avgP  ? `₹${Math.round(avgP).toLocaleString('en-IN')}` : '—', icon: BarChart2, color: '#fbbf24', bg: '#fffbeb' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Price History</h1>
          <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>Track price changes over time for your products</p>
        </div>
      </div>

      {/* Product selector */}
      {loadingProducts ? (
        <div style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 22, height: 22, border: '2.5px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          <span style={{ fontSize: 13, color: '#9ca3af' }}>Loading your products…</span>
        </div>
      ) : products.length === 0 ? (
        <div style={{ ...card, padding: '52px 24px', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Package size={26} color="#818cf8" strokeWidth={1.6} />
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: 0 }}>No products tracked yet</p>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '6px 0 0' }}>Add products from the Tracked Products page to see their price history here.</p>
        </div>
      ) : (
        <>
          {/* Product picker */}
          <div style={{ ...card, padding: '16px 20px' }}>
            <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Viewing history for</p>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSelector(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 14,
                  padding: '12px 16px', cursor: 'pointer', textAlign: 'left',
                }}>
                {selected?.image_url
                  ? <img src={selected.image_url} alt="" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 10, background: '#fff', padding: 3, border: '1px solid #eef0f6', flexShrink: 0 }} />
                  : <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={16} color="#9ca3af" /></div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selected?.title ?? selected?.asin ?? 'Select product'}
                  </p>
                  {selected?.current_price && (
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
                      Current: ₹{Number(selected.current_price).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <ChevronDown size={16} color="#9ca3af" style={{ flexShrink: 0, transition: 'transform .2s', transform: showSelector ? 'rotate(180deg)' : 'none' }} />
              </button>

              {showSelector && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 20,
                  background: '#fff', borderRadius: 16, border: '1px solid #eef0f6',
                  boxShadow: '0 12px 40px rgba(0,0,0,.12)', overflow: 'hidden', maxHeight: 280, overflowY: 'auto',
                }}>
                  {products.map((p, i) => (
                    <button key={p.product_id}
                      onClick={() => { setSelectedId(p.product_id); setShowSelector(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                        padding: '12px 16px', border: 'none', textAlign: 'left', cursor: 'pointer',
                        background: p.product_id === selectedId ? '#eef2ff' : 'transparent',
                        borderBottom: i < products.length - 1 ? '1px solid #f9fafb' : 'none',
                      }}
                      onMouseEnter={e => { if (p.product_id !== selectedId) (e.currentTarget as HTMLButtonElement).style.background = '#fafbfc'; }}
                      onMouseLeave={e => { if (p.product_id !== selectedId) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
                      {p.image_url
                        ? <img src={p.image_url} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 9, background: '#f9fafb', padding: 3, border: '1px solid #eef0f6', flexShrink: 0 }} />
                        : <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Package size={14} color="#d1d5db" /></div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: p.product_id === selectedId ? '#6c63ff' : '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title ?? p.asin}
                        </p>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>ASIN: {p.asin}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: isMobile ? 12 : 16 }}>
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} style={{ ...card, padding: isMobile ? '16px' : '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${color}25` }}>
                  <Icon size={20} color={color} strokeWidth={1.8} />
                </div>
                <div>
                  <p style={{ fontSize: 11.5, color: '#9ca3af', fontWeight: 500, margin: 0 }}>{label}</p>
                  <p style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: '#0f1117', margin: '4px 0 0', letterSpacing: '-1px', lineHeight: 1 }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{ ...card, padding: isMobile ? '18px 14px' : '24px 24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f1117', margin: 0 }}>Price Chart</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  {chartData.length > 0 && (
                    <>
                      <span style={{ fontSize: 12, color: isDown ? '#10b981' : '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {isDown ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                        {Math.abs(change).toFixed(1)}% {isDown ? 'drop' : 'rise'} in period
                      </span>
                      <span style={{ fontSize: 11.5, color: '#c4c9d4' }}>·</span>
                      <span style={{ fontSize: 11.5, color: '#9ca3af' }}>{chartData.length} data points</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {TIME_FILTERS.map(f => (
                  <button key={f.label} onClick={() => setActiveFilter(f.label)} style={{
                    padding: '6px 12px', borderRadius: 9, fontSize: 12, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all .15s',
                    background: activeFilter === f.label ? '#6c63ff' : 'transparent',
                    color: activeFilter === f.label ? '#fff' : '#9ca3af',
                  }}>{f.label}</button>
                ))}
              </div>
            </div>

            {loadingHistory ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
                <div style={{ width: 28, height: 28, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
              </div>
            ) : chartData.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 240, gap: 12 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={24} color="#f59e0b" strokeWidth={1.8} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: 0 }}>No price data for this period</p>
                <p style={{ fontSize: 12.5, color: '#9ca3af', margin: 0 }}>Try a longer time range or wait for the next scheduled scrape</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 6, right: 4, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6c63ff" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#c4c9d4' }} axisLine={false} tickLine={false}
                    interval={Math.max(0, Math.floor(chartData.length / (isMobile ? 4 : 8)))} />
                  <YAxis tick={{ fontSize: 11, fill: '#c4c9d4' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                    domain={['auto', 'auto']} />
                  <Tooltip content={<ChartTip />} />
                  <Area type="monotone" dataKey="price" stroke="#6c63ff" strokeWidth={2.5}
                    fill="url(#hGrad)" dot={false}
                    activeDot={{ r: 6, fill: '#6c63ff', stroke: '#fff', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* History table */}
          {!loadingHistory && chartData.length > 0 && (
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f1117', margin: 0 }}>Price Records</h2>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{chartData.length} entries</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 320 }}>
                  <thead>
                    <tr style={{ background: '#fafbfc' }}>
                      {['Date & Time', 'Price', 'vs. Current', 'vs. Lowest'].map((h, i) => (
                        <th key={i} style={{ padding: '10px 20px', fontSize: 11.5, fontWeight: 600, color: '#9ca3af', textAlign: i === 0 ? 'left' : 'center', borderBottom: '1.5px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...chartData].reverse().slice(0, 20).map((row, idx) => {
                      const vsCurr = currP ? ((row.price - currP) / currP) * 100 : 0;
                      const vsMin  = minP  ? ((row.price - minP)  / minP)  * 100 : 0;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f9fafb' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                          <td style={{ padding: '12px 20px', fontSize: 13, color: '#374151' }}>{row.date}</td>
                          <td style={{ padding: '12px 20px', textAlign: 'center', fontSize: 14, fontWeight: 800, color: row.price === minP ? '#10b981' : '#111827' }}>
                            ₹{row.price.toLocaleString('en-IN')}
                            {row.price === minP && <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 7px', borderRadius: 20, fontWeight: 800, marginLeft: 6 }}>Lowest</span>}
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: vsCurr <= 0 ? '#10b981' : '#ef4444' }}>
                              {vsCurr > 0 ? '+' : ''}{vsCurr.toFixed(1)}%
                            </span>
                          </td>
                          <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: vsMin <= 0 ? '#10b981' : '#6b7280' }}>
                              {vsMin === 0 ? '—' : `+${vsMin.toFixed(1)}%`}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
