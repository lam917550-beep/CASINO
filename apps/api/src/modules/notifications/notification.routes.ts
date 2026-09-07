import { FastifyInstance } from 'fastify';
import { NotificationService } from './notification.service';
import { authenticate } from '../../middleware/auth';

export async function notificationRoutes(app: FastifyInstance) {
  const notificationService = new NotificationService();

  app.get('/notifications', { preHandler: [authenticate] }, async (req) => {
    const { page = 1, limit = 20 } = req.query as { page?: number; limit?: number };
    return notificationService.getNotifications(req.user!.id, page, limit);
  });

  app.post('/notifications/:id/read', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    return notificationService.markAsRead(req.user!.id, id);
  });

  app.post('/notifications/read-all', { preHandler: [authenticate] }, async (req) => {
    return notificationService.markAllAsRead(req.user!.id);
  });
}
