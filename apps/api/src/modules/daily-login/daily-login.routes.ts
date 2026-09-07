import { FastifyInstance } from 'fastify';
import { DailyLoginService } from './daily-login.service';
import { authenticate } from '../../middleware/auth';

export async function dailyLoginRoutes(app: FastifyInstance) {
  const dailyLoginService = new DailyLoginService();

  app.get('/daily-login', { preHandler: [authenticate] }, async (req) => {
    return dailyLoginService.getDailyLoginStatus(req.user!.id);
  });

  app.post('/daily-login/claim', { preHandler: [authenticate] }, async (req) => {
    return dailyLoginService.claimDailyLogin(req.user!.id);
  });
}
