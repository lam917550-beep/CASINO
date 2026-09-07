import { randomBytes, randomInt } from 'crypto';

/**
 * Cryptographically secure random integer between min and max (inclusive)
 */
export function secureRandomInt(min: number, max: number): number {
  return randomInt(min, max + 1);
}

/**
 * Cryptographically secure random float between 0 and 1
 */
export function secureRandomFloat(): number {
  return randomBytes(4).readUInt32LE(0) / 0xffffffff;
}

/**
 * Generate a random seed for game rounds
 */
export function generateServerSeed(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate a client seed (can be provided by client, but validated)
 */
export function generateClientSeed(): string {
  return randomBytes(16).toString('hex');
}

/**
 * Deterministic outcome from seeds (for provably fair games)
 */
export function deterministicOutcome(serverSeed: string, clientSeed: string, nonce: number): number {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(`${serverSeed}:${clientSeed}:${nonce}`).digest('hex');
  return parseInt(hash.slice(0, 8), 16) / 0xffffffff;
}
