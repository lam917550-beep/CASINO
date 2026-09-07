import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import api from '../lib/api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.gameUsername || '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateUsername = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.patch('/me/username', { username: newUsername });
      setUser({ ...user!, gameUsername: res.data.username });
      setEditing(false);
      setSuccess('Username updated!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update');
    }
  };

  if (!user) return null;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700 mb-4">
        <div className="flex items-center gap-4 mb-4">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-2xl font-bold">
              {user.gameUsername?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xl font-bold">{user.gameUsername}</p>
            <p className="text-sm text-gray-400">@{user.username || 'no telegram'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-gray-400">Level</p>
            <p className="text-lg font-bold">{user.level}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-gray-400">Rank</p>
            <p className="text-lg font-bold">{user.rank}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-gray-400">XP</p>
            <p className="text-lg font-bold">{user.xp}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-gray-400">Streak</p>
            <p className="text-lg font-bold">🔥 {user.dailyStreak}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-gray-400">Pets</p>
            <p className="text-lg font-bold">{user.petCount}</p>
          </div>
          <div className="bg-dark-700 rounded-lg p-3">
            <p className="text-gray-400">Games Played</p>
            <p className="text-lg font-bold">{user.gamesPlayed}</p>
          </div>
        </div>
      </div>

      <div className="bg-dark-800 rounded-2xl p-5 border border-dark-700">
        <h2 className="font-semibold mb-3">Game Username</h2>
        {editing ? (
          <div>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="w-full p-3 bg-dark-700 rounded-xl text-white mb-2"
            />
            {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-400 text-sm mb-2">{success}</p>}
            <div className="flex gap-2">
              <button onClick={updateUsername} className="flex-1 py-2 bg-accent text-white rounded-lg">Save</button>
              <button onClick={() => setEditing(false)} className="flex-1 py-2 bg-dark-700 rounded-lg">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-lg">{user.gameUsername}</span>
            <button onClick={() => setEditing(true)} className="px-4 py-2 bg-dark-700 rounded-lg text-sm">Change</button>
          </div>
        )}
      </div>
    </div>
  );
}
