import prisma from '../../db/prisma';

export class EventService {
  async getActiveEvents() {
    const now = new Date();
    return prisma.gameEvent.findMany({
      where: {
        enabled: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
    });
  }

  async getEvent(id: string) {
    return prisma.gameEvent.findUnique({ where: { id } });
  }
}
