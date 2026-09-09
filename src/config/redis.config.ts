import { registerAs } from '@nestjs/config';

export interface RedisConfigOptions {
  url: string;
  keyPrefix?: string;
}

export default registerAs('redis', (): RedisConfigOptions => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379/0',
  keyPrefix: process.env.REDIS_KEY_PREFIX || undefined,
}));
