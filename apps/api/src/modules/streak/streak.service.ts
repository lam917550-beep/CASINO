import prisma from '../../db/prisma';
import { BadRequestError } from '../../core/errors';

export class StreakService {
  async getStreak(userId: string) {
    const streak = await prisma.streak.findUnique({
      where: { userId },
    });
    if (!streak) {
      // Create if not exists
      return prisma.streak.create({ data: { userId } });
    }
    return streak;
  }

  async updateStreakAfterLogin(userId: string) {
    const streak = await prisma.streak.findUnique({ where: { userId } });
    if (!streak) {
      return prisma.streak.create({ data: { userId, dailyStreak: 1, weeklyStreak: 1, monthlyStreak: 1, bestDailyStreak: 1, bestWeeklyStreak: 1, bestMonthlyStreak: 1, lastClaimDate: new Date(), lastClaimWeek: new Date(), lastClaimMonth: new Date() } });
    }

    const now = new Date();
    const lastClaim = streak.lastClaimDate;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    const oneMonthMs = 30 * oneDayMs;

    let dailyStreak = streak.dailyStreak;
    let weeklyStreak = streak.weeklyStreak;
    let monthlyStreak = streak.monthlyStreak;

    // Update daily streak
    if (lastClaim && (now.getTime() - lastClaim.getTime()) <= oneDayMs) {
      // Same day, do nothing
    } else if (lastClaim && (now.getTime() - lastClaim.getTime()) <= 2 * oneDayMs) {
      dailyStreak += 1;
    } else {
      dailyStreak = 1;
    }

    // Update weekly and monthly similarly (simplified: use modulo)
    // Actually we'll handle weekly/monthly in claim functions

    const bestDailyStreak = Math.max(streak.bestDailyStreak, dailyStreak);
    const bestWeeklyStreak = Math.max(streak.bestWeeklyStreak, weeklyStreak);
    const bestMonthlyStreak = Math.max(streak.bestMonthlyStreak, monthlyStreak);

    return prisma.streak.update({
      where: { userId },
      data: {
        dailyStreak,
        weeklyStreak,
        monthlyStreak,
        bestDailyStreak,
        bestWeeklyStreak,
        bestMonthlyStreak,
        lastClaimDate: now,
        lastClaimWeek: now,
        lastClaimMonth: now,
      },
    });
  }

  async resetStreakIfMissed(userId: string) {
    const streak = await prisma.streak.findUnique({ where: { userId } });
    if (!streak) return;
    const now = new Date();
    const lastClaim = streak.lastClaimDate;
    if (lastClaim) {
      const diff = now.getTime() - lastClaim.getTime();
      if (diff > 2 * 24 * 60 * 60 * 1000) {
        await prisma.streak.update({
          where: { userId },
          data: { dailyStreak: 0 },
        });
      }
    }
  }
}
