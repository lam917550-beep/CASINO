import crypto from 'crypto';
import { config } from '../../config';
import { UnauthorizedError } from '../../core/errors';

interface TelegramInitData {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  [key: string]: any;
}

export function verifyTelegramInitData(initData: TelegramInitData): boolean {
  if (!config.telegramBotToken) {
    throw new UnauthorizedError('TELEGRAM_NOT_CONFIGURED', 'Telegram bot token not configured');
  }

  const { hash, ...rest } = initData;

  // Build data-check-string
  const dataCheckString = Object.keys(rest)
    .sort()
    .map((key) => `${key}=${rest[key]}`)
    .join('\n');

  // Generate secret key from bot token
  const secretKey = crypto.createHash('sha256').update(config.telegramBotToken).digest();

  // Calculate HMAC-SHA256
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  // Check hash
  if (calculatedHash !== hash) {
    return false;
  }

  // Check auth_date is within last 24 hours
  const authTime = initData.auth_date * 1000;
  const now = Date.now();
  if (now - authTime > 24 * 60 * 60 * 1000) {
    return false;
  }

  return true;
}
