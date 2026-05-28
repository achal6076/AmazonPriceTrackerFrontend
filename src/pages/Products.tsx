import { useEffect, useState } from 'react';
import { getProducts, previewScrape, addProduct } from '../api/products';
import { startTracking } from '../api/tracking';
import { Search, Plus, ExternalLink, Loader2, Package, Bell, X, Link2 } from 'lucide-react';
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

export default function Products() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [url, setUrl]             = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview]     = useState<Preview | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [adding, setAdding]       = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then(d => setProducts(d.data))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const handlePreview = async () => {
    if (!url.trim()) return;
    setPreviewing(true);
    setPreview(null);
    try {
      const data = await previewScrape(url);
      setPreview(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Could not fetch product. Check the URL.');
    } finally {
      setPreviewing(false);
    }
  };

  const handleAdd = async () => {
    if (!preview) return;
    setAdding(true);
    try {
      const product = await addProduct({ asin: preview.asin, url: preview.url, title: preview.title ?? undefined });
      const tracking = await startTracking(product.id, targetPrice ? parseFloat(targetPrice) : undefined);
      setProducts(prev => [product, ...prev]);
      toast.success('Product added and tracking started!');
      setUrl(''); setPreview(null); setTargetPrice('');
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
      toast.error(err.response?.data?.error ?? 'Already tracking or error occurred');
    } finally {
      setTrackingId(null);
    }
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
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Paste any Amazon product URL to fetch its details</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 12, padding: '10px 16px' }}>
            <Link2 size={14} color="#9ca3af" />
            <input
              type="url" value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePreview()}
              placeholder="https://www.amazon.in/dp/..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#374151' }}
            />
            {url && (
              <button onClick={() => { setUrl(''); setPreview(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={13} color="#9ca3af" />
              </button>
            )}
          </div>
          <button
            onClick={handlePreview}
            disabled={previewing || !url.trim()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 12, border: 'none',
              background: previewing || !url.trim() ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#a78bfa)',
              color: previewing || !url.trim() ? '#9ca3af' : '#fff',
              fontSize: 13.5, fontWeight: 700, cursor: previewing || !url.trim() ? 'not-allowed' : 'pointer',
              boxShadow: url.trim() && !previewing ? '0 4px 14px rgba(108,99,255,.35)' : 'none',
              transition: 'all .2s',
            }}>
            {previewing ? <Loader2 size={15} style={{ animation: 'spin .7s linear infinite' }} /> : <Search size={15} />}
            {previewing ? 'Fetching…' : 'Fetch Product'}
          </button>
        </div>

        {/* Preview result */}
        {preview && (
          <div style={{ marginTop: 16, padding: '16px 18px', background: '#f8f9fc', borderRadius: 14, border: '1.5px solid #eef0f6', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#fff', borderRadius: 12, border: '1px solid #eef0f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={24} color="#d1d5db" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {preview.title ?? preview.asin}
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 10px' }}>ASIN: {preview.asin}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#6c63ff' }}>
                  {preview.price ? `₹${preview.price.toLocaleString('en-IN')}` : 'Price unavailable'}
                </span>
                {preview.price && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1.5px solid #eef0f6', borderRadius: 10, padding: '6px 12px' }}>
                      <Bell size={13} color="#9ca3af" />
                      <input
                        type="number"
                        value={targetPrice}
                        onChange={e => setTargetPrice(e.target.value)}
                        placeholder="Target price (₹)"
                        style={{ width: 140, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#374151' }}
                      />
                    </div>
                    <button
                      onClick={handleAdd}
                      disabled={adding}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '8px 18px', borderRadius: 10, border: 'none',
                        background: adding ? '#e5e7eb' : 'linear-gradient(135deg,#10b981,#34d399)',
                        color: adding ? '#9ca3af' : '#fff',
                        fontSize: 13, fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer',
                        boxShadow: adding ? 'none' : '0 4px 12px rgba(16,185,129,.3)',
                      }}>
                      {adding ? <Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} /> : <Plus size={13} />}
                      {adding ? 'Adding…' : 'Track Product'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products list */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>All Products</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>{products.length} products in database</p>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 28, height: 28, border: '3px solid #eef0f6', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Package size={44} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', margin: 0 }}>No products yet</p>
            <p style={{ fontSize: 12.5, color: '#c4c9d4', marginTop: 4 }}>Paste an Amazon URL above to get started</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafbfc' }}>
                {['Product', 'ASIN', 'Current Price', 'Retailer', 'Action'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 20px', fontSize: 11.5, fontWeight: 600, color: '#9ca3af', textAlign: i === 0 ? 'left' : 'center', borderBottom: '1.5px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={p.id} style={{ borderBottom: idx < products.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {p.image_url
                        ? <img src={p.image_url} style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 10, background: '#f9fafb', padding: 4, border: '1px solid #eef0f6' }} alt="" />
                        : <div style={{ width: 42, height: 42, background: '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={16} color="#d1d5db" /></div>
                      }
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.title ?? p.asin}
                        </p>
                        <a href={p.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#6c63ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                          <ExternalLink size={10} /> View on Amazon
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', background: '#f3f4f6', padding: '3px 8px', borderRadius: 6, color: '#6b7280' }}>{p.asin}</span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    {p.current_price
                      ? <span style={{ fontSize: 14, fontWeight: 800, color: '#111827' }}>₹{Number(p.current_price).toLocaleString('en-IN')}</span>
                      : <span style={{ fontSize: 12.5, color: '#c4c9d4' }}>Not scraped yet</span>
                    }
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <span style={{ fontSize: 11.5, background: '#eff6ff', color: '#3b82f6', padding: '3px 10px', borderRadius: 20, fontWeight: 600, textTransform: 'capitalize' }}>{p.retailer}</span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleTrack(p.id)}
                      disabled={trackingId === p.id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '7px 16px', borderRadius: 10, border: 'none',
                        background: trackingId === p.id ? '#f3f4f6' : '#eef2ff',
                        color: trackingId === p.id ? '#9ca3af' : '#6c63ff',
                        fontSize: 12.5, fontWeight: 700, cursor: trackingId === p.id ? 'not-allowed' : 'pointer',
                        transition: 'all .15s',
                      }}>
                      {trackingId === p.id
                        ? <><Loader2 size={12} style={{ animation: 'spin .7s linear infinite' }} /> Tracking…</>
                        : <><Bell size={12} /> Track</>
                      }
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
