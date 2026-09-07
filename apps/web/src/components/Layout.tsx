import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useEffect } from 'react';

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/games', label: 'Games', icon: '🎮' },
  { path: '/pets', label: 'Pets', icon: '🐾' },
  { path: '/shop', label: 'Shop', icon: '🛒' },
  { path: '/missions', label: 'Missions', icon: '📋' },
  { path: '/leaderboard', label: 'Ranks', icon: '🏆' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Integrate Telegram Main Button if needed
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-dark-900">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
        <div className="flex items-center gap-2">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold">
              {user?.gameUsername?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{user?.gameUsername}</p>
            <p className="text-xs text-gray-400">Level {user?.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold text-gold">🪙 {user?.coins?.toLocaleString()}</p>
            <p className="text-xs text-gray-400">💎 {user?.gems} | 🎟️ {user?.tickets}</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>

      {/* Bottom navigation */}
      <nav className="flex justify-around items-center bg-dark-800 border-t border-dark-700 py-1 pb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center px-3 py-1 rounded-lg ${
                isActive ? 'text-accent' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs mt-0.5">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
