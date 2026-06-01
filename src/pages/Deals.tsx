import { useEffect, useState } from 'react';
import { getTracking } from '../api/tracking';
import { Package, Tag, ExternalLink, TrendingDown, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

interface TrackItem {
  id: string; target_price: string | null; is_active: boolean;
  product_id: string; title: string | null; url: string;
  image_url: string | null; current_price: string | null;
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 18,
  border: '1px solid #eef0f6', boxShadow: '0 2px 8px rgba(0,0,0,.05)',
};

function ProductImg({ src, title }: { src: string | null; title: string | null }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6fb', borderRadius: 12 }}>
      <Package size={28} color="#c4c9d4" />
    </div>
  );
  return <img src={src} alt={title ?? ''} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }} />;
}

export default function Deals() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const [items, setItems] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTracking()
      .then((data) => setItems(Array.isArray(data) ? data.filter((i: TrackItem) => i.is_active) : []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const deals = items.filter(
    (i) => i.target_price && i.current_price &&
      parseFloat(i.current_price) <= parseFloat(i.target_price),
  );

  const watching = items.filter(
    (i) => !(i.target_price && i.current_price &&
      parseFloat(i.current_price) <= parseFloat(i.target_price)),
  ).sort((a, b) => {
    if (!a.target_price || !a.current_price) return 1;
    if (!b.target_price || !b.current_price) return -1;
    const aPct = (parseFloat(a.current_price) - parseFloat(a.target_price)) / parseFloat(a.target_price);
    const bPct = (parseFloat(b.current_price) - parseFloat(b.target_price)) / parseFloat(b.target_price);
    return aPct - bPct;
  });

  function savingsInfo(item: TrackItem) {
    if (!item.target_price || !item.current_price) return null;
    const saved = parseFloat(item.target_price) - parseFloat(item.current_price);
    const pct = (saved / parseFloat(item.target_price)) * 100;
    return { saved, pct };
  }

  function progressPct(item: TrackItem) {
    if (!item.target_price || !item.current_price) return 0;
    const cur = parseFloat(item.current_price);
    const tgt = parseFloat(item.target_price);
    if (cur <= tgt) return 100;
    const maxPrice = cur * 1.5;
    return Math.max(0, Math.min(100, ((maxPrice - cur) / (maxPrice - tgt)) * 100));
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ width: 40, height: 40, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: isSmall ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isSmall ? 'column' : 'row', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Top Deals</h1>
          <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>Tracked products that have hit or passed your target price</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#ecfdf5', borderRadius: 50, border: '1px solid #d1fae5' }}>
            <CheckCircle2 size={15} color="#10b981" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{deals.length} deal{deals.length !== 1 ? 's' : ''} found</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: '#eff6ff', borderRadius: 50, border: '1px solid #dbeafe' }}>
            <ShoppingBag size={15} color="#3b82f6" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3b82f6' }}>{items.length} tracked</span>
          </div>
        </div>
      </div>

      {/* Deals Found Section */}
      {deals.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingDown size={15} color="#10b981" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>Deals Found — Target Price Reached!</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 14 }}>
            {deals.map((item) => {
              const info = savingsInfo(item);
              return (
                <div key={item.id} style={{ ...card, padding: 0, overflow: 'hidden', border: '2px solid #10b981' }}>
                  <div style={{ background: '#ecfdf5', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={13} color="#10b981" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', letterSpacing: '.3px' }}>TARGET REACHED</span>
                    {info && <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#10b981' }}>Save {info.pct.toFixed(0)}%</span>}
                  </div>
                  <div style={{ padding: 18, display: 'flex', gap: 14 }}>
                    <div style={{ width: 80, height: 80, flexShrink: 0 }}>
                      <ProductImg src={item.image_url} title={item.title} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1117', margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.title ?? 'Amazon Product'}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>₹{parseFloat(item.current_price!).toLocaleString('en-IN')}</span>
                        <span style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'line-through' }}>₹{parseFloat(item.target_price!).toLocaleString('en-IN')}</span>
                      </div>
                      {info && <p style={{ fontSize: 12, color: '#10b981', margin: '4px 0 0', fontWeight: 500 }}>Saving ₹{info.saved.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>}
                    </div>
                  </div>
                  <div style={{ padding: '0 18px 18px' }}>
                    <a href={item.url} target="_blank" rel="noreferrer"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', padding: '10px 0', background: 'linear-gradient(135deg,#10b981,#059669)', borderRadius: 10, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                      <ExternalLink size={14} /> Buy Now on Amazon
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Watching Section */}
      {watching.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={15} color="#3b82f6" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>Still Watching</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {watching.map((item) => {
              const prog = progressPct(item);
              const hasTarget = !!item.target_price && !!item.current_price;
              const gap = hasTarget ? parseFloat(item.current_price!) - parseFloat(item.target_price!) : null;
              return (
                <div key={item.id} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 56, height: 56, flexShrink: 0 }}>
                    <ProductImg src={item.image_url} title={item.title} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f1117', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title ?? 'Amazon Product'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#0f1117' }}>
                        {item.current_price ? `₹${parseFloat(item.current_price).toLocaleString('en-IN')}` : '—'}
                      </span>
                      {item.target_price && (
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>
                          Target: ₹{parseFloat(item.target_price).toLocaleString('en-IN')}
                        </span>
                      )}
                      {gap !== null && gap > 0 && (
                        <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>
                          ₹{gap.toLocaleString('en-IN', { maximumFractionDigits: 0 })} away
                        </span>
                      )}
                    </div>
                    {hasTarget && (
                      <div style={{ marginTop: 8, height: 5, background: '#f4f6fb', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${prog}%`, background: 'linear-gradient(90deg,#6c63ff,#a78bfa)', borderRadius: 99, transition: 'width .4s' }} />
                      </div>
                    )}
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer"
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: '#f4f6fb', borderRadius: 10, color: '#6c63ff', textDecoration: 'none', fontSize: 12, fontWeight: 600, border: '1px solid #eef0f6' }}>
                    <ExternalLink size={13} /> View
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{ ...card, padding: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f4f6fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={34} color="#d1d5db" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f1117', margin: 0 }}>No products tracked yet</h3>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, textAlign: 'center' }}>
            Add products to track and set target prices to see deals here.
          </p>
          <a href="/products" style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#6c63ff,#a78bfa)', borderRadius: 12, color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            Start Tracking Products
          </a>
        </div>
      )}
    </div>
  );
}
