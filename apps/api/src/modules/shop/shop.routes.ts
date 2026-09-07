import { FastifyInstance } from 'fastify';
import { ShopService } from './shop.service';
import { authenticate } from '../../middleware/auth';
import { z } from 'zod';
import { BadRequestError } from '../../core/errors';

const PurchaseSchema = z.object({
  quantity: z.number().int().positive().optional().default(1),
});

export async function shopRoutes(app: FastifyInstance) {
  const shopService = new ShopService();

  app.get('/shop', { preHandler: [authenticate] }, async (req) => {
    const { page = 1, limit = 20, type, availability } = req.query as {
      page?: number;
      limit?: number;
      type?: string;
      availability?: string;
    };
    return shopService.getShopItems(page, limit, type, availability);
  });

  app.get('/shop/:id', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    return shopService.getShopItem(id);
  });

  app.post('/shop/:id/purchase', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    const body = PurchaseSchema.safeParse(req.body);
    if (!body.success) {
      throw new BadRequestError('INVALID_INPUT', 'Invalid quantity', body.error.flatten());
    }
    return shopService.purchaseItem(req.user!.id, id, body.data.quantity);
  });
}
