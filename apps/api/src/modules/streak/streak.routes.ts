import { FastifyInstance } from 'fastify';
import { StreakService } from './streak.service';
import { authenticate } from '../../middleware/auth';

export async function streakRoutes(app: FastifyInstance) {
  const streakService = new StreakService();

  app.get('/streak', { preHandler: [authenticate] }, async (req) => {
    return streakService.getStreak(req.user!.id);
  });
}
