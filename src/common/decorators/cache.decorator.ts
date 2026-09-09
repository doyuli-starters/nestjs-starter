import { createHash } from 'node:crypto';
import { Redis } from 'ioredis';

export interface CacheableOptions {
  prefix: string;
  ttl?: number;
  key?: (...args: unknown[]) => string;
}

let client: Redis | null = null;
export function setCacheClient(c: Redis | null) {
  client = c;
}

export function getCacheClient() {
  return client;
}

const DEFAULT_TTL = 300;

function hashArgs(args: unknown[]) {
  const normalized = args.map((arg) =>
    typeof arg === 'bigint' ? arg.toString() : arg,
  );
  return createHash('sha1')
    .update(JSON.stringify(normalized))
    .digest('hex')
    .slice(0, 16);
}

export function Cacheable(options: CacheableOptions) {
  return function (
    _target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    const original = descriptor.value;
    if (typeof original !== 'function') {
      throw new Error(
        `@Cacheable can only decorate methods (got ${typeof original} at ${String(propertyKey)})`,
      );
    }

    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      if (!client) {
        return original.apply(this, args);
      }

      const suffix = options.key ? options.key(...args) : hashArgs(args);
      const cacheKey = `${options.prefix}:${suffix}`;
      const ttl = Math.max(1, options.ttl ?? DEFAULT_TTL);

      try {
        const raw = await client.get(cacheKey);
        if (raw !== null) {
          return JSON.parse(raw);
        }
      } catch {
        // 缓存不可用，降级执行原方法
      }

      const value = await original.apply(this, args);

      if (value !== undefined) {
        try {
          await client.set(cacheKey, JSON.stringify(value), 'EX', ttl);
        } catch {
          // 写入失败，静默
        }
      }

      return value;
    };

    return descriptor;
  };
}
