import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTracking, getAlerts } from '../api/tracking';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
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

const STAT_CARDS = [
  { label: 'Tracked Products', icon: Target, color: '#818cf8', bg: '#eef2ff', key: 'tracked' },
  { label: 'Total Price Alerts', icon: Bell, color: '#34d399', bg: '#ecfdf5', key: 'alerts' },
  { label: 'Price Drops', icon: TrendingDown, color: '#fbbf24', bg: '#fffbeb', key: 'drops' },
  { label: 'Total Saved', icon: Wallet, color: '#60a5fa', bg: '#eff6ff', key: 'saved' },
];

const PIE_DATA = [
  { name: 'Active', value: 6, color: '#34d399' },
  { name: 'Triggered', value: 3, color: '#fbbf24' },
  { name: 'Expired', value: 1, color: '#f87171' },
  { name: 'Paused', value: 1, color: '#d1d5db' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-900">₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [tracked, setTracked] = useState<TrackedItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTracking(), getAlerts()])
      .then(([t, a]) => { setTracked(t); setAlerts(a); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const dropsCount = alerts.length;
  const totalSaved = alerts.reduce((acc, a) =>
    acc + (parseFloat(a.target_price) - parseFloat(a.triggered_price)), 0);

  const stats = {
    tracked: tracked.length,
    alerts: alerts.length,
    drops: dropsCount,
    saved: `₹${Math.max(0, totalSaved).toLocaleString('en-IN')}`,
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track, analyze and save on Amazon</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, icon: Icon, color, bg, key }) => (
          <div key={key} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none">
                  {(stats as any)[key]}
                </p>
                <p className="text-xs mt-1.5 font-medium" style={{ color: '#34d399' }}>
                  +{key === 'saved' ? '₹2,000' : '2'} this week
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Price History Chart */}
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-gray-900">Price History</h2>
            <div className="flex items-center gap-1">
              {['1M','3M','6M','1Y','All'].map((t) => (
                <button key={t}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    t === '3M' ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  style={t === '3M' ? { background: '#6c63ff' } : {}}
                >{t}</button>
              ))}
              <button className="p-1 rounded-lg hover:bg-gray-100 ml-1">
                <MoreHorizontal size={15} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Product info */}
          {tracked[0] ? (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {tracked[0].image_url && (
                  <img src={tracked[0].image_url} className="w-10 h-10 object-contain rounded-lg bg-gray-50" alt="" />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-xs">
                    {tracked[0].title ?? tracked[0].asin}
                  </p>
                  <p className="text-xs text-gray-400">{tracked[0].asin} • Electronics</p>
                </div>
              </div>
              {tracked[0].current_price && (
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹{Number(tracked[0].current_price).toLocaleString('en-IN')}</p>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">-20%</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-4">No tracked products yet</p>
          )}

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_HISTORY} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="price" stroke="#6c63ff" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#6c63ff', strokeWidth: 2, stroke: '#fff' }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <Target size={13} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green-800">Lowest price ever</p>
              <p className="text-xs text-green-600">You saved ₹5,000 (20%) by waiting!</p>
            </div>
          </div>
        </div>

        {/* Recent Price Drops */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Price Drops</h2>
            <Link to="/alerts" className="text-xs font-medium" style={{ color: '#6c63ff' }}>View All</Link>
          </div>

          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">No price drops yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <Target size={14} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{a.title ?? a.asin}</p>
                    <p className="text-xs text-gray-400">Electronics</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-gray-900">₹{Number(a.triggered_price).toLocaleString('en-IN')}</p>
                    <span className="text-[10px] font-semibold" style={{ color: '#34d399' }}>
                      -{Math.round(((parseFloat(a.target_price) - parseFloat(a.triggered_price)) / parseFloat(a.target_price)) * 100)}% ↓
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="w-full mt-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 transition">
            View All Price Drops <ArrowUpRight size={12} />
          </button>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Tracked Products table */}
        <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Your Tracked Products</h2>
            <Link to="/products" className="text-xs font-medium" style={{ color: '#6c63ff' }}>View All</Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tracked.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No products tracked yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 font-medium" style={{ background: '#fafafa' }}>
                  <th className="text-left px-5 py-3">Product</th>
                  <th className="text-right px-3 py-3">Current Price</th>
                  <th className="text-right px-3 py-3">Target Price</th>
                  <th className="text-right px-3 py-3">Lowest Price</th>
                  <th className="text-center px-3 py-3">Alert Status</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {tracked.slice(0, 5).map((item) => {
                  const current = item.current_price ? parseFloat(item.current_price) : null;
                  const target = item.target_price ? parseFloat(item.target_price) : null;
                  const hitTarget = current !== null && target !== null && current <= target;
                  return (
                    <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img src={item.image_url} className="w-9 h-9 object-contain rounded-lg bg-gray-50" alt="" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Target size={13} className="text-gray-300" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 max-w-[220px] truncate">{item.title ?? item.asin}</p>
                            <p className="text-xs text-gray-400">{item.asin} • Electronics</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-sm font-semibold text-gray-900">
                            {current ? `₹${current.toLocaleString('en-IN')}` : '—'}
                          </span>
                          {hitTarget && <span className="text-[10px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-medium">-20%</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-gray-600">
                        {target ? `₹${target.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-gray-600">
                        {current ? `₹${current.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full ${
                          item.is_active
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {item.is_active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <a href={item.url} target="_blank" rel="noreferrer" className="p-1 rounded-lg hover:bg-gray-100 inline-block transition">
                          <ExternalLink size={13} className="text-gray-400" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Price Alert Summary donut */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-4">Price Alert Summary</h2>
          <div className="flex items-center justify-center">
            <div className="relative">
              <PieChart width={160} height={160}>
                <Pie data={PIE_DATA} cx={75} cy={75} innerRadius={50} outerRadius={72}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{PIE_DATA.reduce((a, b) => a + b.value, 0)}</span>
                <span className="text-xs text-gray-400">Total Alerts</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {PIE_DATA.map((d) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-xs text-gray-600">{d.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-800">{d.value}</span>
                  <span className="text-xs text-gray-400">({Math.round((d.value / 11) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition flex items-center justify-center gap-1.5">
            <Target size={12} /> Manage Alerts
          </button>
        </div>
      </div>
    </div>
  );
}
