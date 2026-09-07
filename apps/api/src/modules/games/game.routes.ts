import { FastifyInstance } from 'fastify';
import { GameService } from './game.service';
import { authenticate } from '../../middleware/auth';
import { z } from 'zod';
import { BadRequestError } from '../../core/errors';

const PlaySchema = z.object({
  bet: z.number().int().positive(),
  clientSeed: z.string().optional(),
});

export async function gameRoutes(app: FastifyInstance) {
  const gameService = new GameService();

  app.get('/games', { preHandler: [authenticate] }, async (req) => {
    const { page = 1, limit = 20, category, search } = req.query as any;
    return gameService.getGames(Number(page), Number(limit), category, search);
  });

  app.get('/games/:id', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    return gameService.getGame(id);
  });

  app.post('/games/:id/play', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    const body = PlaySchema.safeParse(req.body);
    if (!body.success) {
      throw new BadRequestError('INVALID_INPUT', 'Invalid bet amount', body.error.flatten());
    }
    return gameService.playGame(req.user!.id, id, body.data.bet, body.data.clientSeed);
  });

  app.get('/games/:id/history', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    const { page = 1, limit = 20 } = req.query as any;
    return gameService.getGameHistory(req.user!.id, id, Number(page), Number(limit));
  });

  app.get('/games/history', { preHandler: [authenticate] }, async (req) => {
    const { page = 1, limit = 20 } = req.query as any;
    return gameService.getPlayerHistory(req.user!.id, Number(page), Number(limit));
  });
}
