import { FastifyInstance } from 'fastify';
import { AnalyticsService } from './analytics.service';
import { authenticate } from '../../middleware/auth';
import { AdminService } from '../admin/admin.service';

export async function analyticsRoutes(app: FastifyInstance) {
  const analyticsService = new AnalyticsService();
  const adminService = new AdminService();

  const adminAuth = async (req: any, reply: any) => {
    await adminService.checkAdmin(req.user.id);
  };

  app.get('/analytics/dau', { preHandler: [authenticate, adminAuth] }, async () => {
    return analyticsService.getDAU();
  });

  app.get('/analytics/wau', { preHandler: [authenticate, adminAuth] }, async () => {
    return analyticsService.getWAU();
  });

  app.get('/analytics/mau', { preHandler: [authenticate, adminAuth] }, async () => {
    return analyticsService.getMAU();
  });

  app.get('/analytics/games-played', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { startDate, endDate } = req.query as any;
    return analyticsService.getGamesPlayed(startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
  });

  app.get('/analytics/currency', { preHandler: [authenticate, adminAuth] }, async () => {
    return analyticsService.getCurrencyStats();
  });

  app.get('/analytics/top-games', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { limit = 10 } = req.query as any;
    return analyticsService.getTopGames(Number(limit));
  });

  app.get('/analytics/new-users', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { days = 7 } = req.query as any;
    return analyticsService.getNewUsersPerDay(Number(days));
  });
}
