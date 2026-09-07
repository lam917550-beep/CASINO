import prisma from '../../db/prisma';
import { BadRequestError, NotFoundError } from '../../core/errors';
import { WalletService } from '../wallet/wallet.service';

export class AchievementService {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  async getAchievements(userId: string, category?: string) {
    const where: any = { enabled: true };
    if (category) where.category = category;

    const achievements = await prisma.achievement.findMany({
      where,
      include: {
        userAchievements: {
          where: { userId },
          select: { progress: true, completed: true, claimed: true },
        },
      },
    });

    return achievements.map((achievement) => {
      const userAchievement = achievement.userAchievements[0];
      return {
        id: achievement.id,
        code: achievement.code,
        title: achievement.title,
        description: achievement.description,
        category: achievement.category,
        requirement: achievement.requirement,
        reward: achievement.reward,
        progress: userAchievement?.progress ?? 0,
        completed: userAchievement?.completed ?? false,
        claimed: userAchievement?.claimed ?? false,
      };
    });
  }

  async claimAchievementReward(userId: string, achievementId: string) {
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
      include: {
        userAchievements: {
          where: { userId },
        },
      },
    });
    if (!achievement) throw new NotFoundError('ACHIEVEMENT_NOT_FOUND', 'Achievement not found');
    if (!achievement.enabled) throw new BadRequestError('ACHIEVEMENT_DISABLED', 'Achievement disabled');

    const userAchievement = achievement.userAchievements[0];
    if (!userAchievement || !userAchievement.completed) {
      throw new BadRequestError('ACHIEVEMENT_NOT_COMPLETED', 'Achievement not completed');
    }
    if (userAchievement.claimed) {
      throw new BadRequestError('ALREADY_CLAIMED', 'Reward already claimed');
    }

    const reward = achievement.reward as any;
    if (reward.coins) {
      await this.walletService.addCoins(userId, reward.coins, 'ACHIEVEMENT_REWARD', achievementId);
    }

    await prisma.userAchievement.update({
      where: { id: userAchievement.id },
      data: { claimed: true, claimedAt: new Date() },
    });

    return { success: true, reward };
  }

  async checkAndUpdateAchievements(userId: string, action: string, amount: number = 1) {
    const achievements = await prisma.achievement.findMany({
      where: {
        enabled: true,
        requirement: {
          path: ['type'],
          equals: action,
        },
      },
    });

    for (const achievement of achievements) {
      const target = (achievement.requirement as any).target;
      let userAchievement = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
      });
      if (!userAchievement) {
        userAchievement = await prisma.userAchievement.create({
          data: { userId, achievementId: achievement.id, progress: 0 },
        });
      }
      if (userAchievement.completed) continue;
      const newProgress = userAchievement.progress + amount;
      const completed = newProgress >= target;
      await prisma.userAchievement.update({
        where: { id: userAchievement.id },
        data: {
          progress: Math.min(newProgress, target),
          completed,
          completedAt: completed ? new Date() : null,
        },
      });
    }
  }
}
