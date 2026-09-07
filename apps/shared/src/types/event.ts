export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'weekend' | 'holiday' | 'monthly' | 'special';
  startAt: Date;
  endAt: Date;
  rules: Record<string, unknown>;
  rewards: Reward[];
  enabled: boolean;
}
