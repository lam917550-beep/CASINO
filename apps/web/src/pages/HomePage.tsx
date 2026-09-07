import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';

export default function HomePage() {
  const { user } = useAuthStore();
  const [dailyLogin, setDailyLogin] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [featuredGames, setFeaturedGames] = useState<any[]>([]);

  useEffect(() => {
    fetchDailyLogin();
    fetchEvents();
    fetchFeaturedGames();
  }, []);

  const fetchDailyLogin = async () => {
    try {
      const res = await api.get('/daily-login');
      setDailyLogin(res.data);
    } catch (err) {}
  };

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      setEvents(res.data.slice(0, 3));
    } catch (err) {}
  };

  const fetchFeaturedGames = async () => {
    try {
      const res = await api.get('/games?limit=4');
      setFeaturedGames(res.data.games);
    } catch (err) {}
  };

  const claimDaily = async () => {
    try {
      const res = await api.post('/daily-login/claim');
      setDailyLogin(res.data);
      // Refresh user balance
    } catch (err) {}
  };

  return (
    <div className="p-4 space-y-6">
      {/* Balance card */}
      <div className="bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-2xl p-5 border border-accent/30">
        <p className="text-sm text-gray-300">Total Balance</p>
        <p className="text-3xl font-bold text-gold">🪙 {user?.coins?.toLocaleString()}</p>
        <p className="text-sm text-gray-400 mt-1">💎 {user?.gems} Gems | 🎟️ {user?.tickets} Tickets</p>
        <div className="mt-3 flex gap-2">
          <span className="text-xs bg-dark-700 px-3 py-1 rounded-full">Level {user?.level}</span>
          <span className="text-xs bg-dark-700 px-3 py-1 rounded-full">🔥 {user?.dailyStreak} day streak</span>
        </div>
      </div>

      {/* Daily login */}
      <div className="bg-dark-800 rounded-2xl p-4 border border-dark-700">
        <h2 className="font-semibold text-lg mb-2">Daily Login</h2>
        {dailyLogin ? (
          <div>
            <p className="text-sm text-gray-300">
              Day {dailyLogin.currentDay} | Streak: {dailyLogin.streak}
            </p>
            {!dailyLogin.claimedToday ? (
              <button
                onClick={claimDaily}
                className="mt-3 w-full py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors"
              >
                Claim {dailyLogin.nextReward?.coins?.toLocaleString()} Coins
              </button>
            ) : (
              <p className="mt-3 text-center text-green-400">✅ Claimed today</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Loading...</p>
        )}
      </div>

      {/* Events */}
      {events.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-2">Events</h2>
          <div className="space-y-2">
            {events.map((event) => (
              <div key={event.id} className="bg-dark-800 rounded-xl p-3 border border-dark-700">
                <p className="font-medium">{event.name}</p>
                <p className="text-xs text-gray-400">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured games */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">Featured Games</h2>
          <Link to="/games" className="text-sm text-accent">View All</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {featuredGames.map((game) => (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover:border-accent/50 transition-colors"
            >
              <div className="text-2xl mb-2">🎮</div>
              <p className="font-medium text-sm">{game.name}</p>
              <p className="text-xs text-gray-400">{game.category}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation shortcuts */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { to: '/pets', label: 'Pets', icon: '🐾' },
          { to: '/shop', label: 'Shop', icon: '🛒' },
          { to: '/missions', label: 'Missions', icon: '📋' },
          { to: '/leaderboard', label: 'Ranks', icon: '🏆' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="bg-dark-800 rounded-xl p-3 text-center border border-dark-700">
            <div className="text-2xl">{item.icon}</div>
            <p className="text-xs mt-1">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
