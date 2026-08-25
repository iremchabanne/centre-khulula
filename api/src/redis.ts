// One single Redis client for the whole application, exactly like prisma.ts.
//
// Redis is the key/value database of the project — the NoSQL half of CP 8.
// It has three jobs, added one at a time: staff sessions (here), the enclosure
// cache, and rate limiting on the public pages.

import { createClient } from 'redis';
import { config } from './config';
import { logger } from './logger';

export const redis = createClient({ url: config.redisUrl });

// Without a listener on 'error', a lost connection crashes the whole Node
// process. With one, it is logged and the client reconnects on its own.
redis.on('error', (error: unknown) => {
  logger.error('redis error', {
    message: error instanceof Error ? error.message : String(error),
  });
});

// Called once at startup, before the port opens. If Redis is unreachable we
// want to know immediately, not on the first login attempt.
export async function connectRedis(): Promise<void> {
  await redis.connect();
  logger.info('Redis connected');
}
