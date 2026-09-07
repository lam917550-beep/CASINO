import { FastifyInstance } from 'fastify';
import { AdminService } from './admin.service';
import { authenticate } from '../../middleware/auth';

export async function adminRoutes(app: FastifyInstance) {
  const adminService = new AdminService();

  // Middleware to check admin
  const adminAuth = async (req: any, reply: any) => {
    await adminService.checkAdmin(req.user.id);
  };

  app.post('/admin/games/:id/toggle', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { id } = req.params as { id: string };
    const { enabled } = req.body as { enabled: boolean };
    return adminService.toggleGame(id, enabled);
  });

  app.patch('/admin/games/:id', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { id } = req.params as { id: string };
    return adminService.updateGameConfig(id, req.body);
  });

  app.post('/admin/pets', { preHandler: [authenticate, adminAuth] }, async (req) => {
    return adminService.createPet(req.body);
  });

  app.patch('/admin/pets/:id', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { id } = req.params as { id: string };
    return adminService.updatePet(id, req.body);
  });

  app.post('/admin/users/:id/ban', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { id } = req.params as { id: string };
    return adminService.banUser(id);
  });

  app.post('/admin/users/:id/unban', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { id } = req.params as { id: string };
    return adminService.unbanUser(id);
  });

  app.get('/admin/transactions', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { userId, page = 1, limit = 50 } = req.query as any;
    return adminService.getTransactions(userId, Number(page), Number(limit));
  });

  app.get('/admin/game-rounds', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { gameId, userId, page = 1, limit = 50 } = req.query as any;
    return adminService.getGameRounds(gameId, userId, Number(page), Number(limit));
  });

  app.post('/admin/missions', { preHandler: [authenticate, adminAuth] }, async (req) => {
    return adminService.createMission(req.body);
  });

  app.post('/admin/achievements', { preHandler: [authenticate, adminAuth] }, async (req) => {
    return adminService.createAchievement(req.body);
  });

  app.post('/admin/events', { preHandler: [authenticate, adminAuth] }, async (req) => {
    return adminService.createEvent(req.body);
  });

  app.get('/admin/audit-logs', { preHandler: [authenticate, adminAuth] }, async (req) => {
    const { page = 1, limit = 50 } = req.query as any;
    return adminService.getAuditLogs(Number(page), Number(limit));
  });
}
