import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../core/errors';
import prisma from '../db/prisma';

export interface AuthUser {
  id: string;
  telegramId: string;
  sessionId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function authenticate(req: FastifyRequest, _reply: FastifyReply) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('MISSING_TOKEN', 'Missing authentication token');
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      sessionId: string;
      telegramId: string;
    };

    // Verify session exists in database
    const session = await prisma.session.findFirst({
      where: {
        token: token,
        userId: decoded.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new UnauthorizedError('INVALID_SESSION', 'Session expired or invalid');
    }

    // Check user exists and not banned
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isBanned: true },
    });

    if (!user || user.isBanned) {
      throw new UnauthorizedError('USER_BANNED', 'User is banned');
    }

    req.user = {
      id: decoded.userId,
      telegramId: decoded.telegramId,
      sessionId: decoded.sessionId,
    };
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError('INVALID_TOKEN', 'Invalid authentication token');
  }
}
