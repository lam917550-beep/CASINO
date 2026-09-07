import { buildApp } from './app';
import { config } from './config';
import prisma from './db/prisma';
import redis from './db/redis';

async function start() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected');

    // Test redis connection
    await redis.ping();
    console.log('Redis connected');

    const app = await buildApp();

    await app.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Server running on port ${config.port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
