export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'daily_reward' | 'streak_warning' | 'mission_completed' | 'achievement_unlocked' | 'level_up' | 'pet_acquired' | 'event_started' | 'event_ending' | 'shop_refresh';
  read: boolean;
  createdAt: Date;
  metadata: Record<string, unknown>;
}
