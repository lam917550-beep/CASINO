import prisma from '../../db/prisma';
import { BadRequestError, NotFoundError } from '../../core/errors';
import { WalletService } from '../wallet/wallet.service';

export class ShopService {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();
  }

  async getShopItems(page: number = 1, limit: number = 20, type?: string, availability?: string) {
    const skip = (page - 1) * limit;
    const where: any = { enabled: true };
    if (type) where.type = type;
    if (availability) where.availability = availability;
    // Check expiry
    where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];

    const items = await prisma.shopItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { price: 'asc' },
    });
    const total = await prisma.shopItem.count({ where });
    return { items, total, page, limit };
  }

  async getShopItem(id: string) {
    const item = await prisma.shopItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('ITEM_NOT_FOUND', 'Shop item not found');
    return item;
  }

  async purchaseItem(userId: string, itemId: string, quantity: number = 1) {
    if (quantity <= 0) throw new BadRequestError('INVALID_QUANTITY', 'Quantity must be positive');

    const item = await prisma.shopItem.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundError('ITEM_NOT_FOUND', 'Shop item not found');
    if (!item.enabled) throw new BadRequestError('ITEM_DISABLED', 'Item is disabled');
    if (item.stock !== null && item.stock < quantity) {
      throw new BadRequestError('OUT_OF_STOCK', 'Not enough stock');
    }
    if (item.expiresAt && item.expiresAt < new Date()) {
      throw new BadRequestError('ITEM_EXPIRED', 'Item has expired');
    }
    // Check purchase limit (simplified)
    if (item.purchaseLimit) {
      const purchaseCount = await prisma.purchase.count({
        where: { userId, shopItemId: itemId },
      });
      if (purchaseCount + quantity > item.purchaseLimit) {
        throw new BadRequestError('PURCHASE_LIMIT', 'Purchase limit exceeded');
      }
    }

    const totalPrice = item.price * quantity;
    const wallet = await this.walletService.getWallet(userId);
    if (wallet.coins < totalPrice) {
      throw new BadRequestError('INSUFFICIENT_FUNDS', 'Insufficient coins');
    }

    await prisma.$transaction(async (tx) => {
      const walletBefore = await tx.wallet.findUnique({ where: { userId } });
      if (!walletBefore || walletBefore.coins < totalPrice) {
        throw new BadRequestError('INSUFFICIENT_FUNDS', 'Insufficient coins');
      }
      const balanceAfter = walletBefore.coins - totalPrice;
      await tx.wallet.update({
        where: { userId },
        data: { coins: balanceAfter },
      });
      await tx.walletTransaction.create({
        data: {
          userId,
          type: 'SHOP_PURCHASE',
          amount: -totalPrice,
          balanceBefore: walletBefore.coins,
          balanceAfter,
          referenceType: 'SHOP_ITEM',
          referenceId: item.id,
        },
      });
      // Create purchase record
      await tx.purchase.create({
        data: {
          userId,
          shopItemId: item.id,
          quantity,
          totalPrice,
          currency: item.currency,
        },
      });
      // Add to inventory or handle item type
      if (item.type === 'pet') {
        // Pets handled separately, but can add to inventory as well if needed
      } else {
        await tx.inventoryItem.upsert({
          where: { userId_itemId_itemType: { userId, itemId: item.id, itemType: item.type } },
          update: { quantity: { increment: quantity } },
          create: {
            userId,
            itemId: item.id,
            itemType: item.type,
            quantity,
          },
        });
      }
      // Update stock if applicable
      if (item.stock !== null) {
        await tx.shopItem.update({
          where: { id: item.id },
          data: { stock: { decrement: quantity } },
        });
      }
    });

    return { success: true, itemId, quantity, totalPrice };
  }
}
