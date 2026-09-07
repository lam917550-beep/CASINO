import { FastifyInstance } from 'fastify';
import { InventoryService } from './inventory.service';
import { authenticate } from '../../middleware/auth';

export async function inventoryRoutes(app: FastifyInstance) {
  const inventoryService = new InventoryService();

  app.get('/inventory', { preHandler: [authenticate] }, async (req) => {
    const { page = 1, limit = 20, itemType, search } = req.query as {
      page?: number;
      limit?: number;
      itemType?: string;
      search?: string;
    };
    return inventoryService.getUserInventory(req.user!.id, page, limit, itemType, search);
  });
}
