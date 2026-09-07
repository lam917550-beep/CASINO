import { PrismaClient } from '@prisma/client';
import { EconomyConfig } from '@casino/shared';
import { randomInt } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample user if not exists
  const existingUser = await prisma.user.findUnique({
    where: { telegramId: 'test_telegram_id' },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        telegramId: 'test_telegram_id',
        username: 'testuser',
        displayName: 'Test User',
        gameUsername: 'testuser',
        wallet: { create: { coins: 10000 } },
        streak: { create: {} },
      },
    });
    console.log('Created test user');
  }

  // Seed 100+ games
  const gameCategories = ['dice', 'wheel', 'cards', 'slots', 'numbers', 'quick', 'special'];
  const gameCount = await prisma.gameDefinition.count();
  if (gameCount === 0) {
    const games = [];
    // Generate 120 games
    for (let i = 1; i <= 120; i++) {
      const category = gameCategories[i % gameCategories.length];
      const minBet = randomInt(50, 200);
      const maxBet = randomInt(10000, 1000000);
      games.push({
        slug: `game-${i}`,
        name: `Game ${i}`,
        description: `Description for game ${i}`,
        category,
        minBet,
        maxBet,
        enabled: true,
        houseEdge: 0.05,
        volatility: ['low', 'medium', 'high'][i % 3],
        metadata: {},
      });
    }
    await prisma.gameDefinition.createMany({ data: games });
    console.log('Seeded 120 games');
  }

  // Seed pets
  const petCount = await prisma.pet.count();
  if (petCount === 0) {
    const pets = [];
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'secret'];
    for (let i = 1; i <= 50; i++) {
      const rarity = rarities[i % rarities.length];
      const price = randomInt(1000, 1000000);
      const sellPrice = Math.floor(price * 0.7);
      pets.push({
        name: `Pet ${i}`,
        rarity,
        price,
        sellPrice,
        level: 1,
        xp: 0,
        maxLevel: 100,
        passiveEffect: {},
        visual: `pet-${i}.png`,
        description: `Pet ${i} description`,
        obtainableFrom: 'shop',
        active: true,
        metadata: {},
      });
    }
    await prisma.pet.createMany({ data: pets });
    console.log('Seeded 50 pets');
  }

  // Seed shop items
  const shopCount = await prisma.shopItem.count();
  if (shopCount === 0) {
    const items = [
      { name: 'Title: VIP', type: 'title', price: 50000, currency: 'COIN', rarity: 'rare', description: 'VIP Title' },
      { name: 'Avatar: Golden', type: 'avatar', price: 25000, currency: 'COIN', rarity: 'uncommon', description: 'Golden Avatar' },
      { name: 'Frame: Neon', type: 'frame', price: 30000, currency: 'COIN', rarity: 'epic', description: 'Neon Frame' },
      { name: 'Booster: XP Boost', type: 'booster', price: 15000, currency: 'COIN', rarity: 'common', description: '2x XP for 1 hour' },
    ];
    await prisma.shopItem.createMany({ data: items });
    console.log('Seeded shop items');
  }

  // Seed missions
  const missionCount = await prisma.mission.count();
  if (missionCount === 0) {
    const missions = [
      { type: 'daily', title: 'Play 5 Games', description: 'Play 5 games today', requirement: { type: 'play_games', target: 5 }, reward: { coins: 2000 }, enabled: true },
      { type: 'daily', title: 'Win 3 Games', description: 'Win 3 games today', requirement: { type: 'win_games', target: 3 }, reward: { coins: 3000 }, enabled: true },
      { type: 'weekly', title: 'Play 20 Games', description: 'Play 20 games this week', requirement: { type: 'play_games', target: 20 }, reward: { coins: 10000 }, enabled: true },
    ];
    await prisma.mission.createMany({ data: missions });
    console.log('Seeded missions');
  }

  // Seed achievements
  const achievementCount = await prisma.achievement.count();
  if (achievementCount === 0) {
    const achievements = [
      { code: 'first_game', title: 'First Game', description: 'Play your first game', category: 'games', requirement: { type: 'play_games', target: 1 }, reward: { coins: 1000 }, enabled: true },
      { code: 'ten_games', title: '10 Games', description: 'Play 10 games', category: 'games', requirement: { type: 'play_games', target: 10 }, reward: { coins: 5000 }, enabled: true },
      { code: 'first_win', title: 'First Win', description: 'Win a game', category: 'games', requirement: { type: 'win_games', target: 1 }, reward: { coins: 2000 }, enabled: true },
    ];
    await prisma.achievement.createMany({ data: achievements });
    console.log('Seeded achievements');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
