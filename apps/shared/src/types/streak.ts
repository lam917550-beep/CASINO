export interface StreakInfo {
  dailyStreak: number;
  weeklyStreak: number;
  monthlyStreak: number;
  bestDailyStreak: number;
  bestWeeklyStreak: number;
  bestMonthlyStreak: number;
  lastClaimDate: Date | null;
  lastClaimWeek: Date | null;
  lastClaimMonth: Date | null;
}

export interface DailyLoginClaim {
  id: string;
  userId: string;
  claimDate: Date;
  dayNumber: number;
  reward: Reward;
  createdAt: Date;
}
