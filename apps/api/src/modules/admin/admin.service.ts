import prisma from '../../db/prisma';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../core/errors';

export class AdminService {
  async checkAdmin(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      throw new ForbiddenError('NOT_ADMIN', 'Admin access required');
    }
  }

  async toggleGame(gameId: string, enabled: boolean) {
    const game = await prisma.gameDefinition.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundError('GAME_NOT_FOUND', 'Game not found');
    await prisma.gameDefinition.update({
      where: { id: gameId },
      data: { enabled },
    });
    return { success: true };
  }

  async updateGameConfig(gameId: string, config: any) {
    const game = await prisma.gameDefinition.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundError('GAME_NOT_FOUND', 'Game not found');
    await prisma.gameDefinition.update({
      where: { id: gameId },
      data: {
        minBet: config.minBet ?? game.minBet,
        maxBet: config.maxBet ?? game.maxBet,
        houseEdge: config.houseEdge ?? game.houseEdge,
        metadata: config.metadata ?? game.metadata,
      },
    });
    return { success: true };
  }

  async updatePet(petId: string, updates: any) {
    const pet = await prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundError('PET_NOT_FOUND', 'Pet not found');
    await prisma.pet.update({
      where: { id: petId },
      data: updates,
    });
    return { success: true };
  }

  async createPet(data: any) {
    const pet = await prisma.pet.create({ data });
    return pet;
  }

  async banUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('USER_NOT_FOUND', 'User not found');
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true },
    });
    // Revoke sessions
    await prisma.session.deleteMany({ where: { userId } });
    return { success: true };
  }

  async unbanUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('USER_NOT_FOUND', 'User not found');
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: false },
    });
    return { success: true };
  }

  async getTransactions(userId?: string, page: number = 1, limit: number = 50) {
    const where = userId ? { userId } : {};
    const skip = (page - 1) * limit;
    const transactions = await prisma.walletTransaction.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.walletTransaction.count({ where });
    return { transactions, total, page, limit };
  }

  async getGameRounds(gameId?: string, userId?: string, page: number = 1, limit: number = 50) {
    const where: any = {};
    if (gameId) where.gameId = gameId;
    if (userId) where.userId = userId;
    const skip = (page - 1) * limit;
    const rounds = await prisma.gameRound.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.gameRound.count({ where });
    return { rounds, total, page, limit };
  }

  async createMission(data: any) {
    return prisma.mission.create({ data });
  }

  async createAchievement(data: any) {
    return prisma.achievement.create({ data });
  }

  async createEvent(data: any) {
    return prisma.gameEvent.create({ data });
  }

  async getAuditLogs(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const logs = await prisma.auditLog.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.auditLog.count();
    return { logs, total, page, limit };
  }
}
