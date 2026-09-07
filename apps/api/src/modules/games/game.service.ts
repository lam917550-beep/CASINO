import prisma from '../../db/prisma';
import { BadRequestError, NotFoundError } from '../../core/errors';
import { WalletService } from '../wallet/wallet.service';
import { GameEngine } from './game-engine';
import { GameRegistry } from './game-registry';

export class GameService {
  private walletService: WalletService;
  private gameEngine: GameEngine;
  private gameRegistry: GameRegistry;

  constructor() {
    this.walletService = new WalletService();
    this.gameRegistry = new GameRegistry();
    this.gameEngine = new GameEngine(this.walletService, this.gameRegistry);
  }

  async getGames(page: number = 1, limit: number = 20, category?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { enabled: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const games = await prisma.gameDefinition.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    });
    const total = await prisma.gameDefinition.count({ where });
    return { games, total, page, limit };
  }

  async getGame(id: string) {
    const game = await prisma.gameDefinition.findUnique({ where: { id } });
    if (!game) throw new NotFoundError('GAME_NOT_FOUND', 'Game not found');
    return game;
  }

  async playGame(userId: string, gameId: string, bet: number, clientSeed?: string) {
    return this.gameEngine.play(userId, gameId, bet, clientSeed);
  }

  async getGameHistory(userId: string, gameId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const where = { userId, gameId };
    const rounds = await prisma.gameRound.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.gameRound.count({ where });
    return { rounds, total, page, limit };
  }

  async getPlayerHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const rounds = await prisma.gameRound.findMany({
      where: { userId },
      include: { game: { select: { name: true, slug: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
    const total = await prisma.gameRound.count({ where: { userId } });
    return { rounds, total, page, limit };
  }
}
