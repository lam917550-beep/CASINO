export interface GameDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: GameCategory;
  minBet: number;
  maxBet: number;
  enabled: boolean;
  houseEdge: number;
  volatility: 'low' | 'medium' | 'high';
  metadata: Record<string, unknown>;
}

export type GameCategory = 
  | 'dice'
  | 'wheel'
  | 'cards'
  | 'slots'
  | 'numbers'
  | 'quick'
  | 'multiplayer'
  | 'special';

export interface GameRound {
  id: string;
  userId: string;
  gameId: string;
  bet: number;
  outcome: string;
  payout: number;
  profit: number;
  roundId: string;
  clientSeed: string | null;
  serverSeed: string | null;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

export interface GameResult {
  roundId: string;
  gameId: string;
  userId: string;
  bet: number;
  outcome: string;
  payout: number;
  profit: number;
  balanceAfter: number;
  timestamp: Date;
}

export interface GameStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalBet: number;
  totalWon: number;
  totalLost: number;
  largestWin: number;
  favoriteGame: string;
}
