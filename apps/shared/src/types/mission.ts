export type MissionType = 'daily' | 'weekly' | 'monthly' | 'special' | 'event';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  requirement: MissionRequirement;
  reward: Reward;
  enabled: boolean;
  startAt: Date | null;
  endAt: Date | null;
}

export interface MissionRequirement {
  type: 'play_games' | 'win_games' | 'collect_coins' | 'level_up' | 'feed_pet' | 'buy_pet' | 'sell_pet' | 'login_days';
  target: number;
  metadata: Record<string, unknown>;
}

export interface Reward {
  coins?: number;
  gems?: number;
  tickets?: number;
  xp?: number;
  items?: string[];
  pets?: string[];
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
  completedAt: Date | null;
  claimedAt: Date | null;
}
