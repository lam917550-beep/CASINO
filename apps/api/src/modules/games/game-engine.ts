import prisma from '../../db/prisma';
import { BadRequestError } from '../../core/errors';
import { WalletService } from '../wallet/wallet.service';
import { GameRegistry } from './game-registry';
import { generateServerSeed, generateClientSeed, secureRandomFloat } from '@casino/shared';
import { v4 as uuidv4 } from 'crypto';

export class GameEngine {
  private walletService: WalletService;
  private gameRegistry: GameRegistry;

  constructor(walletService: WalletService, gameRegistry: GameRegistry) {
    this.walletService = walletService;
    this.gameRegistry = gameRegistry;
  }

  async play(userId: string, gameId: string, bet: number, clientSeed?: string) {
    const game = await prisma.gameDefinition.findUnique({ where: { id: gameId } });
    if (!game) throw new BadRequestError('GAME_NOT_FOUND', 'Game not found');
    if (!game.enabled) throw new BadRequestError('GAME_DISABLED', 'Game is disabled');

    if (bet < game.minBet) throw new BadRequestError('BET_TOO_LOW', `Minimum bet is ${game.minBet}`);
    if (bet > game.maxBet) throw new BadRequestError('BET_TOO_HIGH', `Maximum bet is ${game.maxBet}`);

    const wallet = await this.walletService.getWallet(userId);
    if (wallet.coins < bet) throw new BadRequestError('INSUFFICIENT_FUNDS', 'Insufficient coins');

    const serverSeed = generateServerSeed();
    const finalClientSeed = clientSeed || generateClientSeed();
    const roundId = uuidv4();

    const gameLogic = this.gameRegistry.getGame(game.slug);
    if (!gameLogic) throw new BadRequestError('GAME_LOGIC_MISSING', 'Game logic not found');

    const randomValue = secureRandomFloat();
    const outcome = gameLogic.determineOutcome(randomValue);
    const payoutMultiplier = gameLogic.getPayoutMultiplier(outcome);
    // Apply house edge
    const adjustedPayoutMultiplier = payoutMultiplier * (1 - game.houseEdge);
    const payout = Math.floor(bet * adjustedPayoutMultiplier);
    const profit = payout - bet;

    const result = await this.walletService.processGameResult(
      userId,
      bet,
      payout,
      profit,
      roundId,
      gameId,
      serverSeed,
      finalClientSeed,
      outcome,
    );

    await prisma.gameRound.create({
      data: {
        userId,
        gameId,
        bet,
        outcome: JSON.stringify(outcome),
        payout,
        profit,
        roundId,
        clientSeed: finalClientSeed,
        serverSeed,
        metadata: {},
      },
    });

    return result;
  }
}
