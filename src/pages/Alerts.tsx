import { useEffect, useState } from 'react';
import { getAlerts } from '../api/tracking';
import { Bell, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  target_price: string;
  triggered_price: string;
  sent_at: string;
  product_id: string;
  title: string | null;
  url: string;
  asin: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts().then(setAlerts).catch(() => toast.error('Failed to load alerts')).finally(() => setLoading(false));
  }, []);

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
        <h2 className="text-xl font-bold text-gray-900">Price Alerts</h2>
        <p className="text-gray-500 text-sm mt-1">History of price drop notifications sent to you</p>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <Bell className="mx-auto text-gray-300 mb-3" size={40} />
          <p className="text-gray-500 font-medium">No alerts yet</p>
          <p className="text-sm text-gray-400 mt-1">You'll see alerts here when a price drops to your target</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {alerts.map((alert) => {
            const saved = (parseFloat(alert.target_price) - parseFloat(alert.triggered_price)).toFixed(2);
            return (
              <div key={alert.id} className="bg-white rounded-xl border border-green-200 bg-green-50 p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <Bell size={16} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{alert.title ?? alert.asin}</p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-green-700 font-bold text-sm">₹{Number(alert.triggered_price).toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-500">Target was ₹{Number(alert.target_price).toLocaleString('en-IN')}</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Saved ₹{saved}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{new Date(alert.sent_at).toLocaleString('en-IN')}</p>
                </div>
                <a href={alert.url} target="_blank" rel="noreferrer"
                  className="p-2 rounded-lg text-gray-400 hover:bg-white transition shrink-0">
                  <ExternalLink size={15} />
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
