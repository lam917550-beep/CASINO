import prisma from '../../db/prisma';

export class AnalyticsService {
  async getDAU() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const count = await prisma.user.count({
      where: { lastActiveAt: { gte: today, lt: tomorrow } },
    });
    return { date: today, count };
  }

  async getWAU() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const count = await prisma.user.count({
      where: { lastActiveAt: { gte: weekAgo } },
    });
    return { count };
  }

  async getMAU() {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const count = await prisma.user.count({
      where: { lastActiveAt: { gte: monthAgo } },
    });
    return { count };
  }

  async getGamesPlayed(startDate?: Date, endDate?: Date) {
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = { gte: startDate, lte: endDate };
    }
    const count = await prisma.gameRound.count({ where });
    return { count };
  }

  async getCurrencyStats() {
    const totalWallets = await prisma.wallet.aggregate({
      _sum: { coins: true, gems: true, tickets: true },
    });
    return totalWallets;
  }

  async getTopGames(limit: number = 10) {
    const games = await prisma.gameDefinition.findMany({
      select: {
        name: true,
        _count: { select: { gameRounds: true } },
      },
      orderBy: { gameRounds: { _count: 'desc' } },
      take: limit,
    });
    return games.map((g) => ({ name: g.name, count: g._count.gameRounds }));
  }

  async getNewUsersPerDay(days: number = 7) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = await prisma.user.count({
        where: { createdAt: { gte: day, lt: nextDay } },
      });
      result.push({ date: day.toISOString().slice(0,10), count });
    }
    return result;
  }
}
