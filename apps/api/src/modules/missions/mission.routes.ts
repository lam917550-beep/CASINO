import { FastifyInstance } from 'fastify';
import { MissionService } from './mission.service';
import { authenticate } from '../../middleware/auth';

export async function missionRoutes(app: FastifyInstance) {
  const missionService = new MissionService();

  app.get('/missions', { preHandler: [authenticate] }, async (req) => {
    const { type } = req.query as { type?: string };
    return missionService.getMissions(req.user!.id, type);
  });

  app.post('/missions/:id/claim', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    return missionService.claimMissionReward(req.user!.id, id);
  });
}
