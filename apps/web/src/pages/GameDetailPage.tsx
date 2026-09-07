import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [game, setGame] = useState<any>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGame();
    fetchHistory();
  }, [id]);

  const fetchGame = async () => {
    try {
      const res = await api.get(`/games/${id}`);
      setGame(res.data);
      setBetAmount(res.data.minBet);
    } catch (err) {
      navigate('/games');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/games/${id}/history`);
      setHistory(res.data.rounds);
    } catch (err) {}
  };

  const playGame = async () => {
    if (!game || playing) return;
    setPlaying(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post(`/games/${game.id}/play`, { bet: betAmount });
      setResult(res.data);
      // Refresh user balance (assuming response includes balance)
      if (res.data.balanceAfter !== undefined) {
        setUser({ ...user!, coins: res.data.balanceAfter });
      }
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error playing game');
    } finally {
      setPlaying(false);
    }
  };

  if (!game) {
    return (
      <div className="p-4 flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const effectiveMaxBet = Math.min(game.maxBet, Math.floor(user!.coins * 0.05)); // 5% risk limit

  return (
    <div className="p-4">
      <button onClick={() => navigate(-1)} className="text-gray-400 mb-4">← Back</button>

      <h1 className="text-2xl font-bold mb-2">{game.name}</h1>
      <p className="text-gray-400 text-sm mb-4">{game.description}</p>

      {/* Game area */}
      <div className="bg-dark-800 rounded-2xl p-6 mb-4 border border-dark-700">
        {result ? (
          <div className="text-center">
            <div className="text-4xl mb-4">{result.outcome === 'win' ? '🎉' : '😞'}</div>
            <p className={`text-2xl font-bold ${result.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
              {result.outcome === 'win' ? '+' : '-'}{Math.abs(result.profit).toLocaleString()} Coins
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Payout: {result.payout.toLocaleString()} | Balance: {result.balanceAfter.toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-gray-400">Place your bet and play!</p>
          </div>
        )}
      </div>

      {/* Bet controls */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Min: {game.minBet.toLocaleString()}</span>
          <span className="text-gray-400">Max: {effectiveMaxBet.toLocaleString()}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setBetAmount((prev) => Math.max(game.minBet, Math.floor(prev / 2)))}
            className="px-4 py-2 bg-dark-700 rounded-lg"
          >
            -50%
          </button>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(Math.max(game.minBet, Math.min(effectiveMaxBet, parseInt(e.target.value) || game.minBet)))}
            className="flex-1 p-2 bg-dark-700 rounded-lg text-center text-lg font-bold"
            min={game.minBet}
            max={effectiveMaxBet}
          />
          <button
            onClick={() => setBetAmount((prev) => Math.min(effectiveMaxBet, prev * 2))}
            className="px-4 py-2 bg-dark-700 rounded-lg"
          >
            2x
          </button>
        </div>
        <button
          onClick={playGame}
          disabled={playing || user!.coins < game.minBet || betAmount > effectiveMaxBet}
          className="w-full mt-4 py-3 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
        >
          {playing ? 'Playing...' : 'Play'}
        </button>
        {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
      </div>

      {/* History */}
      <div>
        <h2 className="font-semibold text-lg mb-2">Recent Rounds</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm">No history yet</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((round) => (
              <div key={round.id} className="flex justify-between items-center bg-dark-800 rounded-lg p-3 text-sm">
                <span className="text-gray-400">{new Date(round.createdAt).toLocaleTimeString()}</span>
                <span>Bet: {round.bet}</span>
                <span className={round.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {round.profit >= 0 ? '+' : ''}{round.profit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
