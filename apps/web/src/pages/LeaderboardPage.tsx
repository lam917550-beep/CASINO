import { useEffect, useState } from 'react';
import api from '../lib/api';

const types = ['coins', 'level', 'streak', 'pets', 'games_played'];
const periods = ['all_time', 'daily', 'weekly', 'monthly'];

export default function LeaderboardPage() {
  const [type, setType] = useState('coins');
  const [period, setPeriod] = useState('all_time');
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [type, period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaderboards', { params: { type, period, limit: 50 } });
      setEntries(res.data.entries);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Leaderboard</h1>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              type === t ? 'bg-accent text-white' : 'bg-dark-800 text-gray-400'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
              period === p ? 'bg-accent text-white' : 'bg-dark-800 text-gray-400'
            }`}
          >
            {p.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.userId} className="bg-dark-800 rounded-xl p-3 flex items-center gap-3 border border-dark-700">
              <span className="text-lg font-bold text-gray-400 w-8 text-center">{entry.rank}</span>
              {entry.avatarUrl ? (
                <img src={entry.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold">
                  {entry.username?.[0]?.toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{entry.username}</p>
                <p className="text-xs text-gray-400">{entry.displayName}</p>
              </div>
              <span className="font-bold text-gold">{entry.score.toLocaleString()}</span>
            </div>
          ))}
          {entries.length === 0 && <p className="text-gray-500 text-center py-8">No entries</p>}
        </div>
      )}
    </div>
  );
}
