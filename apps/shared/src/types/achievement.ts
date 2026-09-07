export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  requirement: AchievementRequirement;
  reward: Reward;
  enabled: boolean;
}

export interface AchievementRequirement {
  type: string;
  target: number;
  metadata: Record<string, unknown>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completedAt: Date | null;
  claimedAt: Date | null;
}
