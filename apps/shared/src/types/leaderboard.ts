export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string | null;
  score: number;
  rank: number;
}

export interface Leaderboard {
  id: string;
  name: string;
  type: 'coins' | 'level' | 'streak' | 'pets' | 'games_played' | 'wins' | 'achievements' | 'missions';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time';
  enabled: boolean;
}
