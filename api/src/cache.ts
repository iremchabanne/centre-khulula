// The Redis cache — Redis's second job, after the sessions.
//
// ONE cached value: the list of free enclosures. It is the right candidate and
// the reason is worth knowing. It is read on every opening of the admission
// screen, it is short, and it changes only when an animal is admitted, moved,
// released or an enclosure goes under maintenance — four events we control.
// Nothing else in the application is read that often and written that rarely.
//
// WHY A STALE ANSWER IS SAFE HERE, which is the question a jury asks about any
// cache. It cannot cause a wrong admission. The admission locks the enclosure
// row and re-reads its status inside the transaction (animal.service.ts), so a
// cached list offering an enclosure that has just been taken produces a clean
// 409 — the same answer the second keeper gets in the race. The cache can make
// a screen a few seconds out of date; it can never let two animals into one
// enclosure.
//
// The key is deleted rather than rewritten on every change: the next reader
// pays for one query and stores the fresh list. Rewriting it at each write
// would compute a list nobody may ask for.

import { redis } from './redis';
import { logger } from './logger';

const FREE_ENCLOSURES_KEY = 'khulula:cache:enclosures:free';

// A safety net, not the mechanism. Correctness comes from deleting the key on
// every write; this expiry only limits the damage if we ever forget one.
const TTL_SECONDS = 60;

// Reads the cached list, or null when there is nothing stored.
//
// Redis holds text, so the value is JSON. Dates come back as the strings they
// were serialised into — which is exactly what res.json() would have sent
// anyway, so the response is identical whether it was cached or not.
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

// Called by every operation that can change which enclosures are free.
//
// It never throws. A cache that is down must not stop an admission from being
// recorded: the worst a failed delete can do is leave a list up to sixty
// seconds out of date, and the transaction protects the data regardless.
export async function forgetFreeEnclosures(): Promise<void> {
  try {
    await redis.del(FREE_ENCLOSURES_KEY);
  } catch (error) {
    logger.error('could not clear the free-enclosure cache', {
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
