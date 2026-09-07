import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      // Listen for auth data
      const handleAuth = async () => {
        const initData = tg.initData;
        if (!initData) {
          setError('No Telegram init data');
          return;
        }
        setLoading(true);
        try {
          const response = await api.post('/auth/telegram', parseInitData(initData));
          setToken(response.data.token);
          setUser(response.data.user);
          navigate('/');
        } catch (err: any) {
          setError(err.response?.data?.message || 'Authentication failed');
        } finally {
          setLoading(false);
        }
      };
      handleAuth();
    } else {
      // Development fallback: simulate Telegram auth
      setError('Telegram WebApp not detected. Open in Telegram.');
    }
  }, []);

  const parseInitData = (initData: string) => {
    const params = new URLSearchParams(initData);
    const data: any = {};
    for (const [key, value] of params.entries()) {
      if (key === 'auth_date') {
        data[key] = parseInt(value, 10);
      } else {
        data[key] = value;
      }
    }
    return data;
  };

  return (
    <div className="flex items-center justify-center h-full bg-dark-900 px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">🎰 Casino Mini App</h1>
          <p className="text-gray-400 mt-2">Play, collect, and compete!</p>
        </div>
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">{error}</div>}
        {loading ? (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors"
          >
            Retry Login
          </button>
        )}
      </div>
    </div>
  );
}
