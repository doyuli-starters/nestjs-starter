import { z } from 'zod';

export const configValidationSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.url({ protocol: /^mysql$/ }),
  REDIS_URL: z
    .url({ protocol: /^rediss?$/ })
    .default('redis://localhost:6379/0'),
  REDIS_KEY_PREFIX: z.string().default(''),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
});
