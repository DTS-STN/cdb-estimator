import { RedisStore } from 'connect-redis';
import { MemoryStore } from 'express-session';
import { setInterval } from 'node:timers';

import type { ServerEnvironment } from '~/.server/environment';
import { LogFactory } from '~/.server/logging';
import { getRedisClient } from '~/.server/redis';

const log = LogFactory.getLogger(import.meta.url);

/**
 * Creates a memory store for Express sessions.
 * This function initializes a new `MemoryStore` instance and sets
 * up an automated task to purge expired sessions every 60 seconds.
 */
export function createMemoryStore(): MemoryStore {
  log.info('      initializing new memory session store');
  const memoryStore = new MemoryStore();

  log.info('      registering automated session purger (running every 60 seconds)');
  setInterval(() => purgeExpiredSessions(memoryStore), 60_000);

  return memoryStore;
}

/**
 * Creates a Redis store for Express sessions.
 * This function initializes a new `RedisStore` instance, using the
 * Redis client and session configuration from the provided server environment.
 */
export function createRedisStore(environment: ServerEnvironment): RedisStore {
  log.info('      initializing new Redis session store');

  return new RedisStore({
    client: getRedisClient(),
    prefix: environment.SESSION_KEY_PREFIX,
    // The Redis TTL is set to the session expiration
    // time, plus 5% to allow for clock drift
    ttl: environment.SESSION_EXPIRES_SECONDS * 1.05,
  });
}

/**
 * Purges expired sessions from a memory store.
 * This function iterates through all sessions stored in the provided `MemoryStore` instance,
 * checking their expiration times, and removes any sessions that have expired.
 */
function purgeExpiredSessions(memoryStore: MemoryStore): void {
  log.trace('Purging expired sessions');

  memoryStore.all((error, sessions) => {
    if (sessions) {
      const sessionEntries = Object.entries(sessions);
      log.trace('%s sessions in session store', Object.keys(sessions).length);

      for (const [sessionId, sessionData] of sessionEntries) {
        // express-session adds the cookie data to the session
        // so we can use this to check when the session is due to expire
        const expiresAt = sessionData.cookie.expires;

        log.trace('Checking session %s (expires at %s)', sessionId, expiresAt);
        if (expiresAt && expiresAt.getTime() < Date.now()) {
          log.trace('Purging expired session %s', sessionId);
          memoryStore.destroy(sessionId);
        }
      }
    }
  });
}
