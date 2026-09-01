// The Redis cache — Redis's second job, after the sessions.
//
// One cached value: the list of free enclosures. It is read every time the
// admission screen opens, it is short, and it changes only on four events we
// control — admission, move, outcome, maintenance.
//
// A stale answer is safe here, which is the question to expect about any cache.
// The admission locks the enclosure row and re-reads its status inside the
// transaction, so a cached list offering an enclosure that has just been taken
// produces a clean 409. The cache can make a screen a few seconds out of date;
// it can never put two animals in one enclosure.
//
// The key is deleted rather than rewritten: the next reader pays for one query,
// instead of every write computing a list nobody may ask for.

import { redis } from './redis';
import { logger } from './logger';

const FREE_ENCLOSURES_KEY = 'khulula:cache:enclosures:free';

// A safety net, not the mechanism. Correctness comes from deleting the key on
// every write; this expiry only limits the damage if we ever forget one.
const TTL_SECONDS = 60;

// Reads the cached list, or null when there is nothing stored. Redis holds
// text, so dates come back as the strings res.json() would have sent anyway:
// the response is identical whether it was cached or not.
export async function readFreeEnclosures(): Promise<unknown[] | null> {
  const cached = await redis.get(FREE_ENCLOSURES_KEY);

  if (!cached) {
    return null;
  }

  return JSON.parse(cached) as unknown[];
}

export async function writeFreeEnclosures(enclosures: unknown[]): Promise<void> {
  // EX sets the expiry in the same command, so a key can never be written
  // without one and stay in Redis for ever.
  await redis.set(FREE_ENCLOSURES_KEY, JSON.stringify(enclosures), { EX: TTL_SECONDS });
}

// Called by every operation that changes which enclosures are free. It never
// throws: a cache that is down must not stop an admission being recorded, and
// the worst a failed delete does is leave a list sixty seconds out of date.
export async function forgetFreeEnclosures(): Promise<void> {
  try {
    await redis.del(FREE_ENCLOSURES_KEY);
  } catch (error) {
    logger.error('could not clear the free-enclosure cache', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
