import { FastifyInstance } from 'fastify';
import { LeaderboardService } from './leaderboard.service';
import { authenticate } from '../../middleware/auth';

export async function leaderboardRoutes(app: FastifyInstance) {
  const leaderboardService = new LeaderboardService();

  app.get('/leaderboards', { preHandler: [authenticate] }, async (req) => {
    const { type = 'coins', period = 'all_time', page = 1, limit = 20 } = req.query as {
      type?: string;
      period?: string;
      page?: number;
      limit?: number;
    };
    return leaderboardService.getLeaderboard(type, period, page, limit);
  });
}
