import { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service';
import { z } from 'zod';
import { BadRequestError } from '../../core/errors';
import { authenticate } from '../../middleware/auth';

const TelegramAuthSchema = z.object({
  id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().url().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService();

  app.post('/auth/telegram', async (req, reply) => {
    const body = TelegramAuthSchema.safeParse(req.body);
    if (!body.success) {
      throw new BadRequestError('INVALID_INPUT', 'Invalid Telegram auth data', body.error.flatten());
    }

    const result = await authService.authenticateTelegram(body.data);
    return result;
  });

  app.post('/auth/logout', { preHandler: [authenticate] }, async (req) => {
    const user = req.user!;
    await authService.logout(user.sessionId);
    return { success: true };
  });
}
