import prisma from '../../db/prisma';
import { BadRequestError, ConflictError } from '../../core/errors';
import { EconomyConfig } from '@casino/shared';
import { WalletService } from '../wallet/wallet.service';
import { StreakService } from '../streak/streak.service';

export class DailyLoginService {
  private walletService: WalletService;
  private streakService: StreakService;

  constructor() {
    this.walletService = new WalletService();
    this.streakService = new StreakService();
  }

  async claimDailyLogin(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if already claimed today
    const existing = await prisma.dailyLogin.findFirst({
      where: {
        userId,
        claimDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    if (existing) {
      throw new ConflictError('ALREADY_CLAIMED', 'Already claimed today');
    }

    // Get streak to determine day number
    const streak = await this.streakService.getStreak(userId);
    const dayNumber = Math.min(streak.dailyStreak % 30 + 1, 30);

    // Get reward from config
    const rewardConfig = EconomyConfig.dailyLoginRewards.find((r) => r.day === dayNumber) || EconomyConfig.dailyLoginRewards[EconomyConfig.dailyLoginRewards.length - 1];
    const reward = { coins: rewardConfig.coins };

    // Update streak
    await this.streakService.updateStreakAfterLogin(userId);

    // Grant reward
    await this.walletService.addCoins(userId, reward.coins, 'DAILY_LOGIN', null, { dayNumber });

    // Create claim record
    await prisma.dailyLogin.create({
      data: {
        userId,
        claimDate: today,
        dayNumber,
        reward,
      },
    });

    // Check monthly completion
    const totalDaysThisMonth = await prisma.dailyLogin.count({
      where: {
        userId,
        claimDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
          lt: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        },
      },
    });

    let monthlyBonusAwarded = false;
    if (totalDaysThisMonth === 30) {
      // Award monthly completion bonus
      const bonus = EconomyConfig.monthlyCompletionBonus;
      await this.walletService.addCoins(userId, bonus.coins, 'MONTHLY_COMPLETION');
      // Add gems/tickets if needed
      monthlyBonusAwarded = true;
    }

    return {
      dayNumber,
      reward,
      streak: await this.streakService.getStreak(userId),
      monthlyBonusAwarded,
    };
  }

  async getDailyLoginStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const claimedToday = await prisma.dailyLogin.findFirst({
      where: {
        userId,
        claimDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const streak = await this.streakService.getStreak(userId);
    const currentDay = claimedToday ? claimedToday.dayNumber : Math.min(streak.dailyStreak % 30 + 1, 30);
    const nextReward = EconomyConfig.dailyLoginRewards.find((r) => r.day === (currentDay % 30) + 1) || EconomyConfig.dailyLoginRewards[0];

    return {
      claimedToday: !!claimedToday,
      currentDay,
      nextReward,
      streak: streak.dailyStreak,
    };
  }
}
