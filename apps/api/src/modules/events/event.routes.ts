import { FastifyInstance } from 'fastify';
import { EventService } from './event.service';
import { authenticate } from '../../middleware/auth';

export async function eventRoutes(app: FastifyInstance) {
  const eventService = new EventService();

  app.get('/events', { preHandler: [authenticate] }, async () => {
    return eventService.getActiveEvents();
  });

  app.get('/events/:id', { preHandler: [authenticate] }, async (req) => {
    const { id } = req.params as { id: string };
    return eventService.getEvent(id);
  });
}
