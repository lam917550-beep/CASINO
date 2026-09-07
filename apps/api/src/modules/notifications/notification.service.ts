import prisma from '../../db/prisma';

export class NotificationService {
  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    const total = await prisma.notification.count({ where: { userId } });
    return { notifications, total, page, limit };
  }

  async markAsRead(userId: string, notificationId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return { success: true };
  }

  async createNotification(userId: string, title: string, body: string, type: string, metadata?: any) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        metadata,
      },
    });
  }
}
