import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function ShopPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shop', { params: { limit: 50 } });
      setItems(res.data.items);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const purchase = async (itemId: string) => {
    try {
      await api.post(`/shop/${itemId}/purchase`);
      alert('Purchased!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Purchase failed');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shop</h1>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="bg-dark-800 rounded-xl p-4 border border-dark-700 flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">{item.description}</p>
                <p className="text-xs text-gray-500">{item.type} | {item.rarity}</p>
              </div>
              <div className="text-right">
                <p className="text-gold font-semibold">🪙 {item.price.toLocaleString()}</p>
                <button
                  onClick={() => purchase(item.id)}
                  className="mt-2 px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
