import { useEffect, useState } from 'react';
import { getTracking } from '../api/tracking';
import { stopTracking, updateTracking } from '../api/tracking';
import { TrendingDown, Trash2, Bell, BellOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface TrackedProduct {
  id: string;
  target_price: string | null;
  is_active: boolean;
  product_id: string;
  title: string;
  url: string;
  image_url: string | null;
  current_price: string | null;
  asin: string;
}

export default function Dashboard() {
  const [items, setItems] = useState<TrackedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getTracking();
      setItems(data);
    } catch {
      toast.error('Failed to load tracked products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleStop = async (id: string) => {
    try {
      await stopTracking(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Removed from tracking');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleToggle = async (item: TrackedProduct) => {
    try {
      await updateTracking(item.id, { is_active: !item.is_active });
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, is_active: !i.is_active } : i));
    } catch {
      toast.error('Failed to update');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">My Tracked Products</h2>
        <p className="text-gray-500 text-sm mt-1">{items.length} product{items.length !== 1 ? 's' : ''} being tracked</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <TrendingDown className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 font-medium">No products tracked yet</p>
          <p className="text-sm text-gray-400 mt-1">Go to Products to start tracking</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => {
            const current = item.current_price ? parseFloat(item.current_price) : null;
            const target = item.target_price ? parseFloat(item.target_price) : null;
            const hitTarget = current !== null && target !== null && current <= target;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-4 flex items-center gap-4 ${
                  hitTarget ? 'border-green-300 bg-green-50' : 'border-gray-200'
                }`}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-16 h-16 object-contain rounded-lg bg-gray-50" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-xs">No img</div>
                )}

                <div className="flex-1 min-w-0">
                  <a href={item.url} target="_blank" rel="noreferrer"
                    className="font-medium text-gray-900 hover:text-orange-500 line-clamp-2 text-sm leading-snug">
                    {item.title ?? item.asin}
                  </a>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {current !== null ? (
                      <span className={`text-base font-bold ${hitTarget ? 'text-green-600' : 'text-gray-900'}`}>
                        ₹{current.toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Price not scraped yet</span>
                    )}
                    {target !== null && (
                      <span className="text-sm text-gray-500">
                        Target: <span className="font-medium">₹{target.toLocaleString('en-IN')}</span>
                      </span>
                    )}
                    {hitTarget && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Target reached!
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    title={item.is_active ? 'Pause tracking' : 'Resume tracking'}
                    className={`p-2 rounded-lg transition ${
                      item.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {item.is_active ? <Bell size={16} /> : <BellOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleStop(item.id)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
