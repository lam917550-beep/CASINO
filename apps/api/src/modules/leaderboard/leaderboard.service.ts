import prisma from '../../db/prisma';
import redis from '../../db/redis';

export class LeaderboardService {
  async getLeaderboard(type: string, period: string = 'all_time', page: number = 1, limit: number = 20) {
    const cacheKey = `leaderboard:${type}:${period}:${page}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;
    let query: any = {};

    // Determine sorting and aggregation based on type
    switch (type) {
      case 'coins':
        query = {
          orderBy: { wallet: { coins: 'desc' } },
          select: {
            id: true,
            gameUsername: true,
            displayName: true,
            avatarUrl: true,
            wallet: { select: { coins: true } },
          },
        };
        break;
      case 'level':
        query = {
          orderBy: { level: 'desc' },
          select: {
            id: true,
            gameUsername: true,
            displayName: true,
            avatarUrl: true,
            level: true,
          },
        };
        break;
      case 'streak':
        query = {
          orderBy: { streak: { dailyStreak: 'desc' } },
          select: {
            id: true,
            gameUsername: true,
            displayName: true,
            avatarUrl: true,
            streak: { select: { dailyStreak: true } },
          },
        };
        break;
      case 'pets':
        query = {
          orderBy: { userPets: { _count: 'desc' } },
          select: {
            id: true,
            gameUsername: true,
            displayName: true,
            avatarUrl: true,
            _count: { select: { userPets: true } },
          },
        };
        break;
      case 'games_played':
        query = {
          orderBy: { gameRounds: { _count: 'desc' } },
          select: {
            id: true,
            gameUsername: true,
            displayName: true,
            avatarUrl: true,
            _count: { select: { gameRounds: true } },
          },
        };
        break;
      // Add more types...
      default:
        query = {
          orderBy: { wallet: { coins: 'desc' } },
          select: {
            id: true,
            gameUsername: true,
            displayName: true,
            avatarUrl: true,
            wallet: { select: { coins: true } },
          },
        };
    }

    const users = await prisma.user.findMany({
      ...query,
      skip,
      take: limit,
    });

    // Map to entries with score
    const entries = users.map((user: any, index: number) => {
      let score = 0;
      switch (type) {
        case 'coins': score = user.wallet?.coins || 0; break;
        case 'level': score = user.level || 0; break;
        case 'streak': score = user.streak?.dailyStreak || 0; break;
        case 'pets': score = user._count?.userPets || 0; break;
        case 'games_played': score = user._count?.gameRounds || 0; break;
        default: score = user.wallet?.coins || 0;
      }
      return {
        rank: skip + index + 1,
        userId: user.id,
        username: user.gameUsername,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        score,
      };
    });

    const total = await prisma.user.count();
    const result = { entries, total, page, limit };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    return result;
  }
}
