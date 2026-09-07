import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../db/prisma';
import { WalletService } from '../wallet/wallet.service';
import { GameEngine } from './game-engine';
import { GameRegistry } from './game-registry';
import { PrismaClient } from '@prisma/client';

const testPrisma = new PrismaClient();

describe('GameEngine', () => {
  let userId: string;
  let gameId: string;
  let engine: GameEngine;

  beforeAll(async () => {
    // Create user
    const user = await testPrisma.user.create({
      data: {
        telegramId: 'test_game_user',
        displayName: 'Test Game',
        gameUsername: 'testgame',
        wallet: { create: { coins: 10000 } },
        streak: { create: {} },
      },
    });
    userId = user.id;

    // Create a game
    const game = await testPrisma.gameDefinition.create({
      data: {
        slug: 'test-game',
        name: 'Test Game',
        description: 'Test',
        category: 'dice',
        minBet: 10,
        maxBet: 1000,
        enabled: true,
        houseEdge: 0,
        volatility: 'medium',
        metadata: {},
      },
    });
    gameId = game.id;

    const walletService = new WalletService();
    const registry = new GameRegistry();
    engine = new GameEngine(walletService, registry);
  });

  afterAll(async () => {
    await testPrisma.gameRound.deleteMany({ where: { userId } });
    await testPrisma.user.delete({ where: { id: userId } });
    await testPrisma.gameDefinition.delete({ where: { id: gameId } });
  });

  it('should play game and update balance', async () => {
    const result = await engine.play(userId, gameId, 100);
    expect(result).toHaveProperty('roundId');
    expect(result.balanceAfter).toBeDefined();
  });

  it('should reject bet below min', async () => {
    await expect(engine.play(userId, gameId, 5)).rejects.toThrow('Minimum bet');
  });

  it('should reject bet above max', async () => {
    await expect(engine.play(userId, gameId, 2000)).rejects.toThrow('Maximum bet');
  });

  it('should reject if insufficient funds', async () => {
    // Set balance to 50
    await testPrisma.wallet.update({ where: { userId }, data: { coins: 50 } });
    await expect(engine.play(userId, gameId, 100)).rejects.toThrow('Insufficient coins');
    // Reset balance
    await testPrisma.wallet.update({ where: { userId }, data: { coins: 10000 } });
  });
});
