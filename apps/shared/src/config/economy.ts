export const EconomyConfig = {
  // Currency
  currencies: {
    COIN: { name: 'Coin', symbol: '🪙', decimals: 0 },
    GEM: { name: 'Gem', symbol: '💎', decimals: 0 },
    TICKET: { name: 'Ticket', symbol: '🎟️', decimals: 0 },
    ENERGY: { name: 'Energy', symbol: '⚡', decimals: 0 },
  },

  // Wallet
  maxWalletBalance: 1_000_000_000, // 1 billion coins cap
  renamePrice: 50_000, // coins to rename game username

  // Daily Login Rewards
  dailyLoginRewards: [
    { day: 1, coins: 1000 },
    { day: 2, coins: 1500 },
    { day: 3, coins: 2000 },
    { day: 4, coins: 2500 },
    { day: 5, coins: 3000 },
    { day: 6, coins: 3500 },
    { day: 7, coins: 5000 },
    { day: 8, coins: 4000 },
    { day: 9, coins: 4500 },
    { day: 10, coins: 5000 },
    { day: 11, coins: 5500 },
    { day: 12, coins: 6000 },
    { day: 13, coins: 6500 },
    { day: 14, coins: 7500 },
    { day: 15, coins: 8000 },
    { day: 16, coins: 8500 },
    { day: 17, coins: 9000 },
    { day: 18, coins: 9500 },
    { day: 19, coins: 10000 },
    { day: 20, coins: 11000 },
    { day: 21, coins: 12000 },
    { day: 22, coins: 13000 },
    { day: 23, coins: 14000 },
    { day: 24, coins: 15000 },
    { day: 25, coins: 17500 },
    { day: 26, coins: 20000 },
    { day: 27, coins: 22500 },
    { day: 28, coins: 25000 },
    { day: 29, coins: 30000 },
    { day: 30, coins: 50000 },
  ],

  monthlyCompletionBonus: {
    coins: 100_000,
    gems: 50,
    tickets: 10,
  },

  // Game balancing
  targetPlayerReturn: 0.4, // 40% RTP
  riskLimit: 0.05, // max bet = 5% of balance

  // XP
  xpPerGame: 10,
  xpPerWin: 25,
  xpPerLevelUp: 50,
  xpCurve: (level: number) => Math.floor(100 * Math.pow(level, 1.5)),
};
