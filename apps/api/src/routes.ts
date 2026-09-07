import { FastifyInstance } from 'fastify';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/user.routes';
import { walletRoutes } from './modules/wallet/wallet.routes';
import { gameRoutes } from './modules/games/game.routes';
import { petRoutes } from './modules/pets/pet.routes';
import { shopRoutes } from './modules/shop/shop.routes';
import { inventoryRoutes } from './modules/inventory/inventory.routes';
import { streakRoutes } from './modules/streak/streak.routes';
import { dailyLoginRoutes } from './modules/daily-login/daily-login.routes';
import { missionRoutes } from './modules/missions/mission.routes';
import { achievementRoutes } from './modules/achievements/achievement.routes';
import { leaderboardRoutes } from './modules/leaderboard/leaderboard.routes';
import { notificationRoutes } from './modules/notifications/notification.routes';
import { eventRoutes } from './modules/events/event.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';

export async function registerRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/api' });
  app.register(userRoutes, { prefix: '/api' });
  app.register(walletRoutes, { prefix: '/api' });
  app.register(gameRoutes, { prefix: '/api' });
  app.register(petRoutes, { prefix: '/api' });
  app.register(shopRoutes, { prefix: '/api' });
  app.register(inventoryRoutes, { prefix: '/api' });
  app.register(streakRoutes, { prefix: '/api' });
  app.register(dailyLoginRoutes, { prefix: '/api' });
  app.register(missionRoutes, { prefix: '/api' });
  app.register(achievementRoutes, { prefix: '/api' });
  app.register(leaderboardRoutes, { prefix: '/api' });
  app.register(notificationRoutes, { prefix: '/api' });
  app.register(eventRoutes, { prefix: '/api' });
  app.register(adminRoutes, { prefix: '/api' });
  app.register(analyticsRoutes, { prefix: '/api' });
}
