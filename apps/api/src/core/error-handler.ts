import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './errors';
import { logger } from './logger';

export function errorHandler(
  error: FastifyError | AppError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof AppError) {
    logger.warn({
      requestId: request.id,
      code: error.code,
      message: error.message,
      path: request.url,
      userId: (request as any).user?.id,
    });
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  // Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    const code = (error as any).code;
    logger.error({
      requestId: request.id,
      prismaCode: code,
      message: error.message,
      path: request.url,
    });
    return reply.status(400).send({
      statusCode: 400,
      code: 'DATABASE_ERROR',
      message: 'Database operation failed',
    });
  }

  logger.error({
    requestId: request.id,
    error: error.message,
    stack: error.stack,
    path: request.url,
  });

  return reply.status(500).send({
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  });
}
