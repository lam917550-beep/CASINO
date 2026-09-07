import prisma from '../../db/prisma';

export class InventoryService {
  async getUserInventory(userId: string, page: number = 1, limit: number = 20, itemType?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = { userId };
    if (itemType) where.itemType = itemType;
    // Search may need join with shop items or pets, but we'll keep simple
    const items = await prisma.inventoryItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        // Could include item details based on type, but for simplicity we return as is
      },
    });
    const total = await prisma.inventoryItem.count({ where });
    return { items, total, page, limit };
  }

  async getInventoryItem(userId: string, itemId: string, itemType: string) {
    return prisma.inventoryItem.findUnique({
      where: { userId_itemId_itemType: { userId, itemId, itemType } },
    });
  }
}
