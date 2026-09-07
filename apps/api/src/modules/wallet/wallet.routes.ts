import { FastifyInstance } from 'fastify';
import { WalletService } from './wallet.service';
import { authenticate } from '../../middleware/auth';

export async function walletRoutes(app: FastifyInstance) {
  const walletService = new WalletService();

  app.get('/wallet', { preHandler: [authenticate] }, async (req) => {
    return walletService.getWallet(req.user!.id);
  });
}
