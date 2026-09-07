import prisma from '../../db/prisma';
import { BadRequestError, NotFoundError } from '../../core/errors';
import { WalletService } from '../wallet/wallet.service';

export class MissionService {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  async getMissions(userId: string, type?: string) {
    const where: any = { enabled: true };
    if (type) where.type = type;
    // Filter active missions by date if needed
    where.OR = [{ startAt: null }, { startAt: { lte: new Date() } }];
    where.AND = [{ OR: [{ endAt: null }, { endAt: { gte: new Date() } }] }];

    const missions = await prisma.mission.findMany({
      where,
      include: {
        userMissions: {
          where: { userId },
          select: { progress: true, completed: true, claimed: true },
        },
      },
    });

    return missions.map((mission) => {
      const userMission = mission.userMissions[0];
      return {
        id: mission.id,
        type: mission.type,
        title: mission.title,
        description: mission.description,
        requirement: mission.requirement,
        reward: mission.reward,
        progress: userMission?.progress ?? 0,
        completed: userMission?.completed ?? false,
        claimed: userMission?.claimed ?? false,
      };
    });
  }

  async claimMissionReward(userId: string, missionId: string) {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        userMissions: {
          where: { userId },
        },
      },
    });
    if (!mission) throw new NotFoundError('MISSION_NOT_FOUND', 'Mission not found');
    if (!mission.enabled) throw new BadRequestError('MISSION_DISABLED', 'Mission disabled');
    // Check if completed
    const userMission = mission.userMissions[0];
    if (!userMission || !userMission.completed) {
      throw new BadRequestError('MISSION_NOT_COMPLETED', 'Mission not completed yet');
    }
    if (userMission.claimed) {
      throw new BadRequestError('ALREADY_CLAIMED', 'Reward already claimed');
    }

    const reward = mission.reward as any;
    // Grant rewards
    if (reward.coins) {
      await this.walletService.addCoins(userId, reward.coins, 'MISSION_REWARD', missionId);
    }
    // Handle gems, xp, items etc. For now only coins.

    // Mark claimed
    await prisma.userMission.update({
      where: { id: userMission.id },
      data: { claimed: true, claimedAt: new Date() },
    });

    return { success: true, reward };
  }

  async updateMissionProgress(userId: string, action: string, amount: number = 1) {
    // Find missions that match this action
    const missions = await prisma.mission.findMany({
      where: {
        enabled: true,
        requirement: {
          path: ['type'],
          equals: action,
        },
      },
    });

    for (const mission of missions) {
      const target = (mission.requirement as any).target;
      let userMission = await prisma.userMission.findUnique({
        where: { userId_missionId: { userId, missionId: mission.id } },
      });
      if (!userMission) {
        userMission = await prisma.userMission.create({
          data: { userId, missionId: mission.id, progress: 0 },
        });
      }
      if (userMission.completed) continue;
      const newProgress = userMission.progress + amount;
      const completed = newProgress >= target;
      await prisma.userMission.update({
        where: { id: userMission.id },
        data: {
          progress: Math.min(newProgress, target),
          completed,
          completedAt: completed ? new Date() : null,
        },
      });
    }
  }
}
