import { useEffect, useState } from 'react';
import { getProducts, previewScrape, addProduct } from '../api/products';
import { startTracking } from '../api/tracking';
import { Search, Plus, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  asin: string;
  title: string | null;
  url: string;
  image_url: string | null;
  current_price: string | null;
  retailer: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [tracking, setTracking] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getProducts().then((d) => setProducts(d.data)).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false));
  }, []);

  const handlePreview = async () => {
    if (!url.trim()) return;
    setPreviewing(true);
    setPreview(null);
    try {
      const data = await previewScrape(url);
      setPreview(data);
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to fetch product');
    } finally {
      setPreviewing(false);
    }
  };

  const handleAdd = async () => {
    if (!preview) return;
    try {
      const product = await addProduct({ asin: preview.asin, url: preview.url, title: preview.title });
      if (targetPrice) {
        await startTracking(product.id, parseFloat(targetPrice));
        toast.success('Product added and tracking started!');
      } else {
        await startTracking(product.id);
        toast.success('Product added to tracking!');
      }
      setProducts((prev) => [product, ...prev]);
      setUrl('');
      setPreview(null);
      setTargetPrice('');
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to add product');
    }
  };

  const handleTrack = async (product: Product) => {
    setTracking((t) => ({ ...t, [product.id]: true }));
    try {
      await startTracking(product.id);
      toast.success('Now tracking!');
    } catch (err: any) {
      toast.error(err.response?.data?.error ?? 'Failed to track');
    } finally {
      setTracking((t) => ({ ...t, [product.id]: false }));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Products</h2>
        <p className="text-gray-500 text-sm mt-1">Add an Amazon product URL to start tracking its price</p>
      </div>

      {/* Add product */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">Add New Product</p>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Amazon product URL…"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <button
            onClick={handlePreview} disabled={previewing || !url.trim()}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {previewing ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Fetch
          </button>
        </div>

        {preview && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex gap-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">{preview.title ?? preview.asin}</p>
              <p className="text-orange-600 font-bold mt-1">
                {preview.price ? `₹${Number(preview.price).toLocaleString('en-IN')}` : 'Price not found'}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Target price (optional)"
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-48"
                />
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
                >
                  <Plus size={14} /> Track this product
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              {p.image_url ? (
                <img src={p.image_url} alt={p.title ?? ''} className="w-14 h-14 object-contain rounded-lg bg-gray-50" />
              ) : (
                <div className="w-14 h-14 bg-gray-100 rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.title ?? p.asin}</p>
                <p className="text-xs text-gray-400 mt-0.5">ASIN: {p.asin}</p>
                {p.current_price && (
                  <p className="text-sm font-bold text-orange-500 mt-1">₹{Number(p.current_price).toLocaleString('en-IN')}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={p.url} target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition">
                  <ExternalLink size={15} />
                </a>
                <button
                  onClick={() => handleTrack(p)}
                  disabled={tracking[p.id]}
                  className="text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {tracking[p.id] ? 'Tracking…' : 'Track'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
