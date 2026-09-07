import { FastifyInstance } from 'fastify';
import { UserService } from './user.service';
import { authenticate } from '../../middleware/auth';

export async function userRoutes(app: FastifyInstance) {
  const userService = new UserService();

  app.get('/me', { preHandler: [authenticate] }, async (req) => {
    return userService.getProfile(req.user!.id);
  });

  app.patch('/me/username', { preHandler: [authenticate] }, async (req, reply) => {
    const { username } = req.body as { username: string };
    return userService.updateGameUsername(req.user!.id, username);
  });

  app.get('/users/search', { preHandler: [authenticate] }, async (req) => {
    const { q, page = 1, limit = 20 } = req.query as { q: string; page?: number; limit?: number };
    return userService.searchUsers(q, page, limit);
  });
}
