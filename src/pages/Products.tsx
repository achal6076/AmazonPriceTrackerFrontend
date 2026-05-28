import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, previewScrape, addProduct } from '../api/products';
import { startTracking } from '../api/tracking';
import { Search, Plus, ExternalLink, Loader2, Bell, X, Link2, Package, AlertCircle } from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

interface Product {
  id: string; asin: string; title: string | null;
  url: string; image_url: string | null;
  current_price: string | null; retailer: string;
}
interface Preview {
  asin: string; title: string | null; price: number | null; currency: string; url: string;
}

const card: React.CSSProperties = {
  background: '#fff', borderRadius: 18,
  border: '1px solid #eef0f6', boxShadow: '0 2px 8px rgba(0,0,0,.05)',
};

function ProductImage({ src, size = 42 }: { src: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div style={{ width: size, height: size, background: '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Package size={size * 0.38} color="#d1d5db" />
      </div>
    );
  }
  return (
    <img
      src={src}
      onError={() => setFailed(true)}
      style={{ width: size, height: size, objectFit: 'contain', borderRadius: 10, background: '#f9fafb', padding: 4, border: '1px solid #eef0f6', flexShrink: 0 }}
      alt=""
    />
  );
}

export default function Products() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [url, setUrl]             = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview]     = useState<Preview | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [adding, setAdding]       = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') ?? '');

  useEffect(() => {
    getProducts()
      .then(d => setProducts(d.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  // Sync local search with URL param
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setLocalSearch(q);
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!localSearch.trim()) return products;
    const q = localSearch.toLowerCase();
    return products.filter(p =>
      (p.title ?? '').toLowerCase().includes(q) ||
      p.asin.toLowerCase().includes(q)
    );
  }, [products, localSearch]);

  const handlePreview = async () => {
    if (!url.trim()) return;
    setPreviewing(true);
    setPreview(null);
    setPreviewError('');
    try {
      const data = await previewScrape(url);
      setPreview(data);
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Could not fetch product. Amazon may be blocking the request.';
      setPreviewError(msg);
      toast.error(msg);
    } finally {
      setPreviewing(false);
    }
  };

  const handleAdd = async () => {
    if (!preview) return;
    setAdding(true);
    try {
      const product = await addProduct({ asin: preview.asin, url: preview.url, title: preview.title ?? undefined });
      await startTracking(product.id, targetPrice ? parseFloat(targetPrice) : undefined);
      setProducts(prev => [product, ...prev]);
      toast.success('Product added and tracking started!');
      setUrl(''); setPreview(null); setTargetPrice(''); setPreviewError('');
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to add product');
    } finally {
      setAdding(false);
    }
  };

  const handleTrack = async (productId: string) => {
    setTrackingId(productId);
    try {
      await startTracking(productId);
      toast.success('Now tracking!');
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Failed to start tracking';
      toast.error(msg.includes('Conflict') ? 'Already tracking this product' : msg);
    } finally {
      setTrackingId(null);
    }
  };

  const handleSearchClear = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f1117', margin: 0, letterSpacing: '-.5px' }}>Tracked Products</h1>
        <p style={{ fontSize: 13.5, color: '#9ca3af', marginTop: 4 }}>Add Amazon products and monitor their prices</p>
      </div>

      {/* Add product panel */}
      <div style={{ ...card, padding: '22px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Plus size={16} color="#818cf8" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0 }}>Add New Product</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Paste any Amazon product URL (amazon.in/dp/...) to fetch its details</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 12, padding: '10px 16px' }}>
            <Link2 size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              type="url" value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePreview()}
              placeholder={isMobile ? 'Paste Amazon URL…' : 'https://www.amazon.in/dp/ASIN or paste full product URL'}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#374151', minWidth: 0 }}
            />
            {url && (
              <button onClick={() => { setUrl(''); setPreview(null); setPreviewError(''); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}>
                <X size={13} color="#9ca3af" />
              </button>
            )}
          </div>
          <button
            onClick={handlePreview}
            disabled={previewing || !url.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 12, border: 'none',
              background: previewing || !url.trim() ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#a78bfa)',
              color: previewing || !url.trim() ? '#9ca3af' : '#fff',
              fontSize: 13.5, fontWeight: 700,
              cursor: previewing || !url.trim() ? 'not-allowed' : 'pointer',
              boxShadow: url.trim() && !previewing ? '0 4px 14px rgba(108,99,255,.35)' : 'none',
              transition: 'all .2s', whiteSpace: 'nowrap',
            }}>
            {previewing
              ? <><Loader2 size={15} style={{ animation: 'spin .7s linear infinite' }} /> Fetching…</>
              : <><Search size={15} /> Fetch Product</>
            }
          </button>
        </div>

        {/* Error state */}
        {previewError && !preview && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, padding: '12px 16px' }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#dc2626', margin: 0 }}>Could not fetch product</p>
              <p style={{ fontSize: 12, color: '#ef4444', margin: '3px 0 0' }}>{previewError}</p>
              <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '6px 0 0' }}>Tip: Make sure the URL is a valid amazon.in product link (contains /dp/ASIN)</p>
            </div>
          </div>
        )}

        {/* Preview result */}
        {preview && (
          <div style={{ marginTop: 14, padding: '16px 18px', background: '#f8f9fc', borderRadius: 14, border: '1.5px solid #eef0f6', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 68, height: 68, background: '#fff', borderRadius: 12, border: '1px solid #eef0f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={28} color="#d1d5db" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {preview.title ?? preview.asin}
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>ASIN: {preview.asin}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#6c63ff' }}>
                  {preview.price ? `₹${preview.price.toLocaleString('en-IN')}` : 'Price unavailable'}
                </span>
                {preview.price && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid #eef0f6', borderRadius: 10, padding: '7px 12px' }}>
                      <Bell size={13} color="#9ca3af" />
                      <input
                        type="number" value={targetPrice}
                        onChange={e => setTargetPrice(e.target.value)}
                        placeholder="Alert me at ₹ (optional)"
                        style={{ width: 160, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#374151' }}
                      />
                    </div>
                    <button onClick={handleAdd} disabled={adding} style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '9px 20px', borderRadius: 11, border: 'none',
                      background: adding ? '#e5e7eb' : 'linear-gradient(135deg,#10b981,#34d399)',
                      color: adding ? '#9ca3af' : '#fff',
                      fontSize: 13.5, fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer',
                      boxShadow: adding ? 'none' : '0 4px 12px rgba(16,185,129,.3)',
                    }}>
                      {adding ? <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} /> : <Plus size={14} />}
                      {adding ? 'Adding…' : 'Track Product'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products list */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>All Products</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
              {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''}
              {localSearch ? ` matching "${localSearch}"` : ' in database'}
            </p>
          </div>
          {/* Local search filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 11, padding: '8px 14px', minWidth: 240 }}>
            <Search size={13} color="#9ca3af" />
            <input
              type="text" value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Filter by name or ASIN…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: '#374151' }}
            />
            {localSearch && (
              <button onClick={handleSearchClear} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                <X size={12} color="#9ca3af" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Package size={44} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', margin: 0 }}>
              {localSearch ? `No products matching "${localSearch}"` : 'No products yet'}
            </p>
            <p style={{ fontSize: 12.5, color: '#c4c9d4', marginTop: 4 }}>
              {localSearch ? 'Try a different search term' : 'Paste an Amazon URL above to get started'}
            </p>
          </div>
        ) : isSmall ? (
          /* ── Mobile / Tablet card list ── */
          <div>
            {filtered.map((p, idx) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 18px', borderBottom: idx < filtered.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                <ProductImage src={p.image_url} size={46} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title ?? p.asin}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                    {p.current_price
                      ? <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>₹{Number(p.current_price).toLocaleString('en-IN')}</span>
                      : <span style={{ fontSize: 11.5, color: '#c4c9d4' }}>Not scraped yet</span>
                    }
                    <span style={{ fontSize: 10.5, background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: 20, fontWeight: 600, textTransform: 'capitalize' as const }}>{p.retailer}</span>
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, color: '#6c63ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                    <ExternalLink size={9} /> View on Amazon
                  </a>
                </div>
                <button
                  onClick={() => handleTrack(p.id)}
                  disabled={trackingId === p.id}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
                    padding: '8px 14px', borderRadius: 10, border: 'none',
                    background: trackingId === p.id ? '#f3f4f6' : '#eef2ff',
                    color: trackingId === p.id ? '#9ca3af' : '#6c63ff',
                    fontSize: 12, fontWeight: 700, cursor: trackingId === p.id ? 'not-allowed' : 'pointer',
                  }}>
                  {trackingId === p.id
                    ? <Loader2 size={12} style={{ animation: 'spin .7s linear infinite' }} />
                    : <Bell size={12} />
                  }
                  {!isMobile && (trackingId === p.id ? 'Tracking…' : 'Track')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* ── Desktop table ── */
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafbfc' }}>
                {['Product', 'ASIN', 'Current Price', 'Retailer', 'Action'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 20px', fontSize: 11.5, fontWeight: 600, color: '#9ca3af', textAlign: i === 0 ? 'left' : 'center', borderBottom: '1.5px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <ProductImage src={p.image_url} size={42} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title ?? p.asin}
                        </p>
                        <a href={p.url} target="_blank" rel="noreferrer"
                          style={{ fontSize: 11, color: '#6c63ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                          <ExternalLink size={10} /> View on Amazon
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', background: '#f3f4f6', padding: '3px 9px', borderRadius: 6, color: '#6b7280', letterSpacing: '.5px' }}>{p.asin}</span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    {p.current_price
                      ? <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>₹{Number(p.current_price).toLocaleString('en-IN')}</span>
                      : <span style={{ fontSize: 11.5, color: '#c4c9d4', display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e5e7eb' }} />Not scraped yet</span>
                    }
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11.5, background: '#eff6ff', color: '#3b82f6', padding: '4px 11px', borderRadius: 20, fontWeight: 600, textTransform: 'capitalize' as const }}>{p.retailer}</span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button onClick={() => handleTrack(p.id)} disabled={trackingId === p.id}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, border: 'none', background: trackingId === p.id ? '#f3f4f6' : '#eef2ff', color: trackingId === p.id ? '#9ca3af' : '#6c63ff', fontSize: 12.5, fontWeight: 700, cursor: trackingId === p.id ? 'not-allowed' : 'pointer' }}>
                      {trackingId === p.id
                        ? <><Loader2 size={12} style={{ animation: 'spin .7s linear infinite' }} /> Tracking…</>
                        : <><Bell size={12} /> Track</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
