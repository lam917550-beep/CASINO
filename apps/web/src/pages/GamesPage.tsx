import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

const categories = ['all', 'dice', 'wheel', 'cards', 'slots', 'numbers', 'quick', 'special'];

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGames();
  }, [category, search, page]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await api.get('/games', { params });
      setGames(res.data.games);
      setTotal(res.data.total);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Games</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search games..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-gray-500 mb-3"
      />

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm ${
              category === cat ? 'bg-accent text-white' : 'bg-dark-800 text-gray-400'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Game grid */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {games.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover:border-accent/50 transition-colors"
            >
              <div className="text-3xl mb-2">🎮</div>
              <p className="font-medium text-sm">{game.name}</p>
              <p className="text-xs text-gray-400">{game.category}</p>
              <p className="text-xs text-gray-500 mt-1">
                Min: {game.minBet} | Max: {game.maxBet}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 bg-dark-800 rounded-lg disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-4 py-2 text-sm text-gray-400">Page {page}</span>
        <button
          disabled={games.length < 20}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 bg-dark-800 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
