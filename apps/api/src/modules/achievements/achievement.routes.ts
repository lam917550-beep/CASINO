import { FastifyInstance } from 'fastify';
import { AchievementService } from './achievement.service';
import { authenticate } from '../../middleware/auth';

export async function achievementRoutes(app: FastifyInstance) {
  const achievementService = new AchievementService();

  app.get('/achievements', { preHandler: [authenticate] }, async (req) => {
    const { category } = req.query as { category?: string };
    return achievementService.getAchievements(req.user!.id, category);
  });

  app.post('/achievements/:id/claim', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    return achievementService.claimAchievementReward(req.user!.id, id);
  });
}
