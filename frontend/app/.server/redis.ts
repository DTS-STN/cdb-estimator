/**
 * This module provides a singleton Redis client instance for the application.
 * It configures and manages the connection to a Redis server, supporting both
 * standalone and sentinel modes. The client is initialized with settings from
 * the server environment variables and includes error handling and connection
 * management. It uses the official `redis` (node-redis v5) library for Redis interaction.
 */
import { createClient, createSentinel } from 'redis';
import type { RedisClientType, RedisSentinelType } from 'redis';

import { serverEnvironment } from '~/.server/environment';
import type { ServerEnvironment } from '~/.server/environment';
import { LogFactory } from '~/.server/logging';
import { singleton } from '~/.server/utils/instance-registry';

const log = LogFactory.getLogger(import.meta.url);

export type RedisClient = RedisClientType | RedisSentinelType;

/**
 * Retrieves the singleton Redis client instance.
 * Chooses between standalone or sentinel configuration based on environment variables.
 * Ensures only one Redis client is created and reused throughout the application's lifecycle.
 *
 * @returns The connected Redis client instance.
 */
export async function getRedisClient(): Promise<RedisClient> {
  const client = singleton('redisClient', () => {
    if (serverEnvironment.REDIS_CONNECTION_TYPE === 'sentinel') {
      log.info('Using Redis Sentinel configuration');
      return createRedisSentinelClient(serverEnvironment);
    }

    log.info('Using standalone Redis configuration');
    return createRedisClient(serverEnvironment);
  });

  if (!client.isOpen) {
    log.debug('Connecting to Redis...');
    await client.connect();
    log.info('Redis client connected');
  }

  return client;
}

/**
 * Configuration required for a standalone Redis client.
 * Only the specified properties from ServerEnvironment are used.
 */
type RedisStandaloneClientConfig = Pick<
  ServerEnvironment, //
  'REDIS_COMMAND_TIMEOUT_SECONDS' | 'REDIS_HOST' | 'REDIS_PORT' | 'REDIS_USERNAME' | 'REDIS_PASSWORD'
>;

/**
 * Creates and configures a standalone Redis client with logging and reconnection strategy.
 *
 * @param config - Standalone Redis configuration.
 * @returns The configured Redis client instance.
 */
function createRedisClient(config: RedisStandaloneClientConfig): RedisClientType {
  log.info('Initializing standalone Redis client');

  const client = createClient({
    url: `redis://${config.REDIS_HOST}:${config.REDIS_PORT}`,
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD?.value(),
    commandOptions: {
      timeout: config.REDIS_COMMAND_TIMEOUT_SECONDS * 1000,
    },
    socket: {
      reconnectStrategy: exponentialBackoffReconnectionStrategy,
    },
  });

  log.debug('Registering event handlers for standalone Redis client');
  client
    .on('connect', () => {
      log.info('Connecting to redis://%s:%s', config.REDIS_HOST, config.REDIS_PORT);
    })
    .on('ready', () => {
      log.info('Standalone Redis client is ready');
    })
    .on('reconnecting', () => {
      log.warn('Reconnecting to redis://%s:%s', config.REDIS_HOST, config.REDIS_PORT);
    })
    .on('error', (error: Error) => {
      log.error('Standalone Redis client error: %o', error);
    });

  return client as RedisClientType;
}

/**
 * Configuration required for a Redis Sentinel client.
 * Only the specified properties from ServerEnvironment are used.
 */
type RedisSentinelClientConfig = Pick<
  ServerEnvironment, //
  | 'REDIS_SENTINEL_MASTER_NAME'
  | 'REDIS_COMMAND_TIMEOUT_SECONDS'
  | 'REDIS_HOST'
  | 'REDIS_PORT'
  | 'REDIS_USERNAME'
  | 'REDIS_PASSWORD'
>;

/**
 * Creates and configures a Redis Sentinel client with logging and reconnection strategy.
 * Validates required sentinel configuration values and throws if any are missing or invalid.
 *
 * @param config - Sentinel Redis configuration.
 * @returns The configured Redis Sentinel client instance.
 */
function createRedisSentinelClient(config: RedisSentinelClientConfig): RedisSentinelType {
  log.info('Initializing Redis Sentinel client');

  log.debug('Validating Redis Sentinel configuration');

  if (!config.REDIS_SENTINEL_MASTER_NAME) {
    const message = 'Missing required Redis Sentinel configuration: REDIS_SENTINEL_MASTER_NAME';
    log.error(message);
    throw new Error(message);
  }

  const sentinel = createSentinel({
    name: config.REDIS_SENTINEL_MASTER_NAME,
    sentinelRootNodes: [
      {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
      },
    ],
    nodeClientOptions: {
      username: config.REDIS_USERNAME,
      password: config.REDIS_PASSWORD?.value(),
      commandOptions: {
        timeout: config.REDIS_COMMAND_TIMEOUT_SECONDS * 1000,
      },
      socket: {
        reconnectStrategy: exponentialBackoffReconnectionStrategy,
      },
    },
  });

  log.debug('Registering event handlers for Redis Sentinel client');
  sentinel
    .on('connect', () => {
      log.info('Connecting to redis-sentinel://%s:%s', config.REDIS_HOST, config.REDIS_PORT);
    })
    .on('ready', () => {
      log.info('Redis Sentinel client is ready');
    })
    .on('reconnecting', () => {
      log.warn('Reconnecting to redis-sentinel://%s:%s', config.REDIS_HOST, config.REDIS_PORT);
    })
    .on('error', (error: Error) => {
      log.error('Redis Sentinel client error: %o', error);
    });

  return sentinel as RedisSentinelType;
}

/**
 * Implements a custom exponential backoff reconnection strategy for Redis clients.
 * Adds random jitter to avoid thundering herd problems.
 *
 * @param retries - The number of consecutive failed connection attempts.
 * @param cause - The error that caused the reconnection attempt.
 * @returns The delay in milliseconds before the next reconnection attempt.
 *
 * @see https://github.com/redis/docs/blob/5e1b0aad58aedd24a7f93aba58502b4a27e67c32/content/develop/clients/nodejs/connect.md?plain=1#L312
 */
export function exponentialBackoffReconnectionStrategy(retries: number, cause: Error): number {
  // Generate a random jitter between 0 – 99 ms:
  const jitter = Math.floor(Math.random() * 100);

  // Delay is an exponential backoff, (2^retries) * 50 ms, with a
  // maximum value of 3000 ms:
  const delay = Math.min(Math.pow(2, retries) * 50, 3000);

  const retryIn = delay + jitter;
  log.error('Redis connection failed (attempt #%s); retrying in %s ms. Cause: %o', retries, retryIn, cause);
  return retryIn;
}
