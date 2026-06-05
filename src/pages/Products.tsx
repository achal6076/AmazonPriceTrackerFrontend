import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { previewScrape, addProduct } from '../api/products';
import { getTracking, startTracking, updateTracking, stopTracking } from '../api/tracking';
import {
  Search, Plus, ExternalLink, Loader2, Bell, X, Link2,
  Package, AlertCircle, Trash2, Edit2, Check, PauseCircle, PlayCircle,
} from 'lucide-react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import toast from 'react-hot-toast';

interface TrackItem {
  id: string;
  product_id: string;
  asin: string;
  title: string | null;
  url: string;
  image_url: string | null;
  current_price: string | null;
  target_price: string | null;
  is_active: boolean;
  retailer: string;
  created_at: string;
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
  if (!src || failed) return (
    <div style={{ width: size, height: size, background: '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Package size={size * 0.38} color="#d1d5db" />
    </div>
  );
  return <img src={src} onError={() => setFailed(true)} style={{ width: size, height: size, objectFit: 'contain', borderRadius: 10, background: '#f9fafb', padding: 4, border: '1px solid #eef0f6', flexShrink: 0 }} alt="" />;
}

export default function Products() {
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet;
  const [searchParams, setSearchParams] = useSearchParams();

  const [tracked, setTracked]       = useState<TrackItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [url, setUrl]               = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview]       = useState<Preview | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [adding, setAdding]         = useState(false);
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') ?? '');

  // inline edit state
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState('');
  const [savingId, setSavingId]     = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getTracking()
      .then(data => setTracked(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load tracked products'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLocalSearch(searchParams.get('q') ?? '');
  }, [searchParams]);

  const filtered = useMemo(() => {
    if (!localSearch.trim()) return tracked;
    const q = localSearch.toLowerCase();
    return tracked.filter(t =>
      (t.title ?? '').toLowerCase().includes(q) || t.asin.toLowerCase().includes(q)
    );
  }, [tracked, localSearch]);

  const handlePreview = async () => {
    if (!url.trim()) return;
    setPreviewing(true);
    setPreview(null);
    setPreviewError('');
    try {
      const result = await previewScrape(url);
      // Check if already tracked before showing the preview
      if (tracked.some(t => t.asin === result.asin)) {
        setPreviewError('already_tracking');
      } else {
        setPreview(result);
      }
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
    // Guard: don't add if already tracking this ASIN
    if (tracked.some(t => t.asin === preview.asin)) {
      toast.error('You\'re already tracking this product');
      setUrl(''); setPreview(null); setTargetPrice(''); setPreviewError('');
      return;
    }
    setAdding(true);
    try {
      const product = await addProduct({ asin: preview.asin, url: preview.url, title: preview.title ?? undefined });
      const trackEntry = await startTracking(product.id, targetPrice ? parseFloat(targetPrice) : undefined);
      setTracked(prev => [{
        ...trackEntry,
        asin: product.asin,
        title: product.title,
        url: product.url,
        image_url: product.image_url ?? null,
        current_price: preview.price ? String(preview.price) : null,
        retailer: product.retailer ?? 'amazon',
      }, ...prev]);
      toast.success('Product added and tracking started!');
      setUrl(''); setPreview(null); setTargetPrice(''); setPreviewError('');
    } catch (err: any) {
      const msg = err.response?.data?.error ?? 'Failed to add product';
      if (err.response?.status === 409) {
        toast.error('You\'re already tracking this product');
        setUrl(''); setPreview(null); setTargetPrice(''); setPreviewError('');
      } else {
        toast.error(msg);
      }
    } finally {
      setAdding(false);
    }
  };

  const handleSaveTarget = async (item: TrackItem) => {
    setSavingId(item.id);
    try {
      const updated = await updateTracking(item.id, {
        target_price: editTarget ? parseFloat(editTarget) : null,
      });
      setTracked(prev => prev.map(t => t.id === item.id ? { ...t, target_price: updated.target_price } : t));
      setEditingId(null);
      toast.success('Target price updated');
    } catch {
      toast.error('Failed to update target price');
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (item: TrackItem) => {
    setSavingId(item.id);
    try {
      await updateTracking(item.id, { is_active: !item.is_active });
      setTracked(prev => prev.map(t => t.id === item.id ? { ...t, is_active: !t.is_active } : t));
      toast.success(item.is_active ? 'Tracking paused' : 'Tracking resumed');
    } catch {
      toast.error('Failed to update tracking status');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (item: TrackItem) => {
    setDeletingId(item.id);
    try {
      await stopTracking(item.id);
      setTracked(prev => prev.filter(t => t.id !== item.id));
      toast.success('Stopped tracking');
    } catch {
      toast.error('Failed to stop tracking');
    } finally {
      setDeletingId(null);
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
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Paste any Amazon product URL to fetch details and start tracking</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 12, padding: '10px 16px' }}>
            <Link2 size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              type="url" value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePreview()}
              placeholder={isMobile ? 'Paste Amazon URL…' : 'https://www.amazon.in/dp/ASIN or full product URL'}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#374151', minWidth: 0 }}
            />
            {url && (
              <button onClick={() => { setUrl(''); setPreview(null); setPreviewError(''); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', flexShrink: 0 }}>
                <X size={13} color="#9ca3af" />
              </button>
            )}
          </div>
          <button onClick={handlePreview} disabled={previewing || !url.trim()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 12, border: 'none',
              background: previewing || !url.trim() ? '#e5e7eb' : 'linear-gradient(135deg,#6c63ff,#a78bfa)',
              color: previewing || !url.trim() ? '#9ca3af' : '#fff',
              fontSize: 13.5, fontWeight: 700,
              cursor: previewing || !url.trim() ? 'not-allowed' : 'pointer',
              boxShadow: url.trim() && !previewing ? '0 4px 14px rgba(108,99,255,.35)' : 'none',
              whiteSpace: 'nowrap',
            }}>
            {previewing
              ? <><Loader2 size={15} style={{ animation: 'spin .7s linear infinite' }} /> Fetching…</>
              : <><Search size={15} /> Fetch Product</>}
          </button>
        </div>

        {previewError === 'already_tracking' ? (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fefce8', border: '1.5px solid #fde68a', borderRadius: 12, padding: '12px 16px' }}>
            <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#92400e', margin: 0 }}>Already tracking this product</p>
              <p style={{ fontSize: 12, color: '#b45309', margin: '3px 0 0' }}>This product is already in your tracking list.</p>
            </div>
          </div>
        ) : previewError && !preview && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, padding: '12px 16px' }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#dc2626', margin: 0 }}>Could not fetch product</p>
              <p style={{ fontSize: 12, color: '#ef4444', margin: '3px 0 0' }}>{previewError}</p>
              <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '6px 0 0' }}>Tip: Make sure the URL is a valid amazon.in product link (contains /dp/ASIN)</p>
            </div>
          </div>
        )}

        {preview && (
          <div style={{ marginTop: 14, padding: '16px 18px', background: '#f8f9fc', borderRadius: 14, border: '1.5px solid #eef0f6', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
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
                    <button onClick={handleAdd} disabled={adding}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '9px 20px', borderRadius: 11, border: 'none',
                        background: adding ? '#e5e7eb' : 'linear-gradient(135deg,#10b981,#34d399)',
                        color: adding ? '#9ca3af' : '#fff',
                        fontSize: 13.5, fontWeight: 700, cursor: adding ? 'not-allowed' : 'pointer',
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

      {/* Tracked products list */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1117', margin: 0 }}>My Tracked Products</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
              {filtered.length} of {tracked.length} product{tracked.length !== 1 ? 's' : ''}
              {localSearch ? ` matching "${localSearch}"` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8f9fc', border: '1.5px solid #eef0f6', borderRadius: 11, padding: '8px 14px', minWidth: isMobile ? '100%' : 220 }}>
            <Search size={13} color="#9ca3af" />
            <input
              type="text" value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Filter by name or ASIN…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: '#374151' }}
            />
            {localSearch && (
              <button onClick={() => { setLocalSearch(''); setSearchParams({}); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
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
              {localSearch ? `No products matching "${localSearch}"` : 'No products tracked yet'}
            </p>
            <p style={{ fontSize: 12.5, color: '#c4c9d4', marginTop: 4 }}>
              {localSearch ? 'Try a different search term' : 'Paste an Amazon URL above to get started'}
            </p>
          </div>
        ) : isSmall ? (
          /* Mobile / Tablet card list */
          <div>
            {filtered.map((item, idx) => {
              const cur = item.current_price ? parseFloat(item.current_price) : null;
              const tgt = item.target_price  ? parseFloat(item.target_price)  : null;
              const hit = cur !== null && tgt !== null && cur <= tgt;
              const isEditing = editingId === item.id;
              return (
                <div key={item.id} style={{ padding: '14px 18px', borderBottom: idx < filtered.length - 1 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <ProductImage src={item.image_url} size={46} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title ?? item.asin}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: hit ? '#10b981' : '#111827' }}>
                          {cur ? `₹${cur.toLocaleString('en-IN')}` : '—'}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: item.is_active ? '#ecfdf5' : '#f3f4f6', color: item.is_active ? '#059669' : '#9ca3af' }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.is_active ? '#10b981' : '#d1d5db' }} />
                          {item.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                          <input
                            autoFocus type="number" value={editTarget}
                            onChange={e => setEditTarget(e.target.value)}
                            placeholder="Target price ₹"
                            style={{ width: 120, padding: '5px 9px', borderRadius: 8, border: '1.5px solid #6c63ff', fontSize: 12, outline: 'none' }}
                          />
                          <button onClick={() => handleSaveTarget(item)} disabled={savingId === item.id}
                            style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#6c63ff', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                            {savingId === item.id ? '…' : 'Save'}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ padding: '5px 8px', borderRadius: 8, border: '1px solid #eef0f6', background: '#fff', color: '#9ca3af', fontSize: 12, cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : tgt ? (
                        <p style={{ fontSize: 11.5, color: '#9ca3af', margin: '4px 0 0' }}>
                          Target: ₹{tgt.toLocaleString('en-IN')}
                          <button onClick={() => { setEditingId(item.id); setEditTarget(String(tgt)); }}
                            style={{ marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#6c63ff', fontSize: 11, padding: 0 }}>Edit</button>
                        </p>
                      ) : (
                        <button onClick={() => { setEditingId(item.id); setEditTarget(''); }}
                          style={{ fontSize: 11.5, color: '#6c63ff', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 0', textDecoration: 'underline' }}>
                          + Set target price
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                      <a href={item.url} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', padding: 7, borderRadius: 8, background: '#f3f4f6', color: '#9ca3af' }}>
                        <ExternalLink size={13} />
                      </a>
                      <button onClick={() => handleDelete(item)} disabled={deletingId === item.id}
                        style={{ display: 'inline-flex', padding: 7, borderRadius: 8, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer' }}>
                        {deletingId === item.id ? <Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop table */
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafbfc' }}>
                {['Product', 'Current Price', 'Target Price', 'Status', 'Actions'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 20px', fontSize: 11.5, fontWeight: 600, color: '#9ca3af', textAlign: i === 0 ? 'left' : 'center', borderBottom: '1.5px solid #f3f4f6', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const cur = item.current_price ? parseFloat(item.current_price) : null;
                const tgt = item.target_price  ? parseFloat(item.target_price)  : null;
                const hit = cur !== null && tgt !== null && cur <= tgt;
                const isEditing = editingId === item.id;
                return (
                  <tr key={item.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f9fafb' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ProductImage src={item.image_url} size={42} />
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827', margin: 0, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.title ?? item.asin}
                          </p>
                          <a href={item.url} target="_blank" rel="noreferrer"
                            style={{ fontSize: 11, color: '#6c63ff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
                            <ExternalLink size={10} /> View on Amazon
                          </a>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: hit ? '#10b981' : '#111827' }}>
                        {cur ? `₹${cur.toLocaleString('en-IN')}` : '—'}
                      </span>
                      {hit && <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '2px 7px', borderRadius: 20, fontWeight: 800, marginLeft: 6 }}>Hit!</span>}
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'center' }}>
                      {isEditing ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <input autoFocus type="number" value={editTarget}
                            onChange={e => setEditTarget(e.target.value)}
                            placeholder="₹ amount"
                            style={{ width: 100, padding: '6px 10px', borderRadius: 8, border: '1.5px solid #6c63ff', fontSize: 12.5, outline: 'none', textAlign: 'center' }}
                          />
                          <button onClick={() => handleSaveTarget(item)} disabled={savingId === item.id}
                            style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#6c63ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            {savingId === item.id ? <Loader2 size={12} style={{ animation: 'spin .7s linear infinite' }} /> : <Check size={12} />}
                          </button>
                          <button onClick={() => setEditingId(null)}
                            style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #eef0f6', background: '#fff', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 13, color: tgt ? '#374151' : '#d1d5db', fontWeight: tgt ? 600 : 400 }}>
                            {tgt ? `₹${tgt.toLocaleString('en-IN')}` : 'Not set'}
                          </span>
                          <button onClick={() => { setEditingId(item.id); setEditTarget(tgt ? String(tgt) : ''); }}
                            style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid #eef0f6', background: '#f9fafb', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Edit2 size={11} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 700, padding: '5px 12px', borderRadius: 20, background: item.is_active ? '#ecfdf5' : '#f3f4f6', color: item.is_active ? '#059669' : '#9ca3af' }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: item.is_active ? '#10b981' : '#d1d5db' }} />
                        {item.is_active ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => handleToggleActive(item)} disabled={savingId === item.id} title={item.is_active ? 'Pause tracking' : 'Resume tracking'}
                          style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid #eef0f6', background: '#f9fafb', color: item.is_active ? '#f59e0b' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          {savingId === item.id
                            ? <Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} />
                            : item.is_active ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                        </button>
                        <button onClick={() => handleDelete(item)} disabled={deletingId === item.id} title="Stop tracking"
                          style={{ width: 32, height: 32, borderRadius: 9, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                          onMouseLeave={e => (e.currentTarget.style.background = '#fff')}>
                          {deletingId === item.id ? <Loader2 size={13} style={{ animation: 'spin .7s linear infinite' }} /> : <Trash2 size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
