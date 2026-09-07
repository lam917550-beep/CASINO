import jwt from 'jsonwebtoken';
import { config } from '../../config';
import prisma from '../../db/prisma';
import { UnauthorizedError } from '../../core/errors';
import { verifyTelegramInitData } from './telegram';
import { v4 as uuidv4 } from 'crypto';

export interface TelegramAuthData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export class AuthService {
  async authenticateTelegram(data: TelegramAuthData) {
    // Verify Telegram init data
    if (!verifyTelegramInitData(data)) {
      throw new UnauthorizedError('INVALID_TELEGRAM_DATA', 'Invalid Telegram authentication data');
    }

    const telegramId = data.id;
    const displayName = [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Player';

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      // Create user with wallet and streak
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            telegramId,
            username: data.username || null,
            displayName,
            avatarUrl: data.photo_url || null,
            gameUsername: await this.generateUniqueGameUsername(tx, data.username || `user_${telegramId.slice(-6)}`),
            wallet: {
              create: {
                coins: 1000, // Starting bonus
                gems: 10,
                tickets: 5,
              },
            },
            streak: {
              create: {},
            },
          },
        });
        return newUser;
      });
    }

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    // Create session
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days session

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
      },
    });

    // Create JWT
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        telegramId: user.telegramId,
        sessionId: sessionToken,
      },
      config.jwtSecret,
      { expiresIn: '30d' },
    );

    return {
      token: jwtToken,
      user: {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        displayName: user.displayName,
        gameUsername: user.gameUsername,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  private async generateUniqueGameUsername(tx: any, base: string): Promise<string> {
    let username = base.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
    if (username.length < 3) username = 'user' + Math.random().toString(36).slice(2, 8);
    let exists = await tx.user.findUnique({ where: { gameUsername: username } });
    let attempts = 0;
    while (exists && attempts < 10) {
      username = `${username}_${Math.floor(Math.random() * 1000)}`;
      exists = await tx.user.findUnique({ where: { gameUsername: username } });
      attempts++;
    }
    return username;
  }

  async logout(sessionToken: string) {
    await prisma.session.deleteMany({
      where: { token: sessionToken },
    });
  }
}
