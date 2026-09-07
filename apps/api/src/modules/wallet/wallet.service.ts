import prisma from '../../db/prisma';
import { BadRequestError, NotFoundError } from '../../core/errors';
import { EconomyConfig } from '@casino/shared';

export class WalletService {
  async getWallet(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      throw new NotFoundError('WALLET_NOT_FOUND', 'Wallet not found');
    }
    return wallet;
  }

  async addCoins(userId: string, amount: number, type: string, referenceId?: string, metadata?: any) {
    if (amount <= 0) throw new BadRequestError('INVALID_AMOUNT', 'Amount must be positive');
    return this.updateBalance(userId, amount, type, referenceId, metadata);
  }

  async deductCoins(userId: string, amount: number, type: string, referenceId?: string, metadata?: any) {
    if (amount <= 0) throw new BadRequestError('INVALID_AMOUNT', 'Amount must be positive');
    return this.updateBalance(userId, -amount, type, referenceId, metadata);
  }

  private async updateBalance(userId: string, delta: number, type: string, referenceId?: string, metadata?: any) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { coins: true },
      });
      if (!wallet) throw new NotFoundError('WALLET_NOT_FOUND', 'Wallet not found');

      const balanceBefore = wallet.coins;
      const balanceAfter = balanceBefore + delta;
      if (balanceAfter < 0) {
        throw new BadRequestError('INSUFFICIENT_FUNDS', 'Insufficient coins');
      }
      if (balanceAfter > EconomyConfig.maxWalletBalance) {
        throw new BadRequestError('WALLET_CAP', 'Wallet balance exceeds maximum');
      }

      await tx.wallet.update({
        where: { userId },
        data: { coins: balanceAfter },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          type,
          amount: delta,
          balanceBefore,
          balanceAfter,
          referenceType: type,
          referenceId: referenceId || null,
          metadata: metadata || {},
        },
      });

      return {
        balanceBefore,
        balanceAfter,
        amount: delta,
      };
    });
  }

  async processGameResult(
    userId: string,
    bet: number,
    payout: number,
    profit: number,
    roundId: string,
    gameId: string,
    serverSeed: string,
    clientSeed: string,
    outcome: any,
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
        select: { coins: true },
      });
      if (!wallet) throw new NotFoundError('WALLET_NOT_FOUND', 'Wallet not found');

      const balanceBefore = wallet.coins;
      const balanceAfter = balanceBefore - bet + payout;
      if (balanceAfter < 0) {
        throw new BadRequestError('INSUFFICIENT_FUNDS', 'Insufficient coins');
      }
      if (balanceAfter > EconomyConfig.maxWalletBalance) {
        throw new BadRequestError('WALLET_CAP', 'Wallet balance exceeds maximum');
      }

      await tx.wallet.update({
        where: { userId },
        data: { coins: balanceAfter },
      });

      await tx.walletTransaction.create({
        data: {
          userId,
          type: 'GAME_BET',
          amount: -bet,
          balanceBefore,
          balanceAfter: balanceBefore - bet,
          referenceType: 'GAME_ROUND',
          referenceId: roundId,
          metadata: { gameId },
        },
      });

      if (payout > 0) {
        await tx.walletTransaction.create({
          data: {
            userId,
            type: 'GAME_PAYOUT',
            amount: payout,
            balanceBefore: balanceBefore - bet,
            balanceAfter,
            referenceType: 'GAME_ROUND',
            referenceId: roundId,
            metadata: { gameId, outcome },
          },
        });
      }

      return {
        roundId,
        outcome,
        bet,
        payout,
        profit,
        balanceAfter,
      };
    });
  }
}
