export interface UserProfile {
  id: string;
  telegramId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  gameUsername: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  tickets: number;
  streak: number;
  bestStreak: number;
  petCount: number;
  achievementCount: number;
  gamesPlayed: number;
  favoriteGame: string | null;
  rank: string;
  titles: string[];
  createdAt: Date;
  updatedAt: Date;
}
