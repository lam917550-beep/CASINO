import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/missions');
      setMissions(res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const claim = async (missionId: string) => {
    try {
      await api.post(`/missions/${missionId}/claim`);
      fetchMissions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Claim failed');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Missions</h1>
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map((mission) => (
            <div key={mission.id} className="bg-dark-800 rounded-xl p-4 border border-dark-700">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{mission.title}</p>
                  <p className="text-xs text-gray-400">{mission.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Progress: {mission.progress}/{mission.requirement.target}
                  </p>
                  <p className="text-xs text-gold">Reward: 🪙 {mission.reward.coins}</p>
                </div>
                <button
                  onClick={() => claim(mission.id)}
                  disabled={!mission.completed || mission.claimed}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                    mission.claimed
                      ? 'bg-green-500/20 text-green-400'
                      : mission.completed
                      ? 'bg-accent text-white'
                      : 'bg-dark-700 text-gray-500'
                  }`}
                >
                  {mission.claimed ? 'Claimed' : mission.completed ? 'Claim' : 'In Progress'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
