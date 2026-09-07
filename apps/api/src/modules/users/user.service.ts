import prisma from '../../db/prisma';
import { ConflictError, BadRequestError, NotFoundError } from '../../core/errors';
import { EconomyConfig } from '@casino/shared';
import { z } from 'zod';

export class UserService {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        streak: true,
        _count: {
          select: {
            userPets: true,
            gameRounds: true,
            userAchievements: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('USER_NOT_FOUND', 'User not found');
    }

    return {
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      displayName: user.displayName,
      gameUsername: user.gameUsername,
      avatarUrl: user.avatarUrl,
      level: user.level,
      xp: user.xp,
      rank: user.rank,
      coins: user.wallet?.coins ?? 0,
      gems: user.wallet?.gems ?? 0,
      tickets: user.wallet?.tickets ?? 0,
      dailyStreak: user.streak?.dailyStreak ?? 0,
      bestDailyStreak: user.streak?.bestDailyStreak ?? 0,
      petCount: user._count.userPets,
      achievementCount: user._count.userAchievements,
      gamesPlayed: user._count.gameRounds,
      createdAt: user.createdAt,
    };
  }

  async updateGameUsername(userId: string, newUsername: string) {
    // Validate username
    const parsed = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).safeParse(newUsername);
    if (!parsed.success) {
      throw new BadRequestError('INVALID_USERNAME', 'Username must be 3-20 characters, letters/numbers/underscores only');
    }

    // Check if username already taken
    const existing = await prisma.user.findUnique({
      where: { gameUsername: newUsername },
    });
    if (existing && existing.id !== userId) {
      throw new ConflictError('USERNAME_TAKEN', 'Username already taken');
    }

    // Check wallet balance for rename cost
    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.coins < EconomyConfig.renamePrice) {
      throw new BadRequestError('INSUFFICIENT_FUNDS', `Rename requires ${EconomyConfig.renamePrice} coins`);
    }

    // Deduct coins and update username
    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId },
        data: { coins: { decrement: EconomyConfig.renamePrice } },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          type: 'RENAME_COST',
          amount: -EconomyConfig.renamePrice,
          balanceBefore: wallet.coins,
          balanceAfter: wallet.coins - EconomyConfig.renamePrice,
          referenceType: 'USERNAME_CHANGE',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { gameUsername: newUsername },
      });
    });

    return { username: newUsername };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { gameUsername: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        gameUsername: true,
        displayName: true,
        avatarUrl: true,
        level: true,
      },
      skip,
      take: limit,
      orderBy: { level: 'desc' },
    });

    const total = await prisma.user.count({
      where: {
        OR: [
          { gameUsername: { contains: query, mode: 'insensitive' } },
          { displayName: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    return { users, total, page, limit };
  }
}
