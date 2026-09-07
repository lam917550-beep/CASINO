import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import prisma from '../../db/prisma';
import { WalletService } from './wallet.service';
import { PrismaClient } from '@prisma/client';

const testPrisma = new PrismaClient();
const walletService = new WalletService();

describe('WalletService', () => {
  let userId: string;

  beforeAll(async () => {
    // Create test user with wallet
    const user = await testPrisma.user.create({
      data: {
        telegramId: 'test_wallet_user',
        displayName: 'Test Wallet',
        gameUsername: 'testwallet',
        wallet: { create: { coins: 1000 } },
        streak: { create: {} },
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await testPrisma.user.delete({ where: { id: userId } });
  });

  it('should add coins correctly', async () => {
    const result = await walletService.addCoins(userId, 500, 'TEST_ADD');
    expect(result.balanceAfter).toBe(1500);
  });

  it('should deduct coins correctly', async () => {
    const result = await walletService.deductCoins(userId, 200, 'TEST_DEDUCT');
    expect(result.balanceAfter).toBe(1300);
  });

  it('should throw error if insufficient funds', async () => {
    await expect(walletService.deductCoins(userId, 10000, 'TEST_FAIL')).rejects.toThrow('Insufficient coins');
  });

  it('should process game result correctly', async () => {
    const result = await walletService.processGameResult(userId, 100, 150, 50, 'round1', 'game1', 'seed', 'clientSeed', { result: 'win' });
    expect(result.balanceAfter).toBe(1350); // 1300 - 100 + 150
  });
});
