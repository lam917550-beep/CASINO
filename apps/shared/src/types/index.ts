export interface User {
  id: string;
  telegramId: string;
  username: string | null;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}

export interface GameDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  minBet: number;
  maxBet: number;
  enabled: boolean;
  metadata: Record<string, unknown>;
}

export interface Wallet {
  id: string;
  userId: string;
  coins: number;
  gems: number;
  tickets: number;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: string;
  referenceId: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface GameRound {
  id: string;
  userId: string;
  gameId: string;
  bet: number;
  outcome: string;
  payout: number;
  profit: number;
  roundId: string;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

// Thêm các type cho pet, shop, inventory, missions, achievements, leaderboard, streak...
