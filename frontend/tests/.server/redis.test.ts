import { createClient, createSentinel } from 'redis';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { serverEnvironment } from '~/.server/environment';
import { exponentialBackoffReconnectionStrategy, getRedisClient } from '~/.server/redis';
import { singleton } from '~/.server/utils/instance-registry';

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    isOpen: false,
    connect: vi.fn(() => Promise.resolve()),
    on: vi.fn().mockReturnThis(),
  })),
  createSentinel: vi.fn(() => ({
    isOpen: false,
    connect: vi.fn(() => Promise.resolve()),
    on: vi.fn().mockReturnThis(),
  })),
}));

vi.mock('~/.server/environment', () => ({
  serverEnvironment: {
    REDIS_CONNECTION_TYPE: undefined, // set in each test
    REDIS_HOST: 'localhost',
    REDIS_PORT: 6379,
    REDIS_PASSWORD: { value: () => 'password' },
    REDIS_USERNAME: 'user',
    REDIS_SENTINEL_MASTER_NAME: 'mymaster',
    REDIS_COMMAND_TIMEOUT_SECONDS: 10,
  },
}));

vi.mock('~/.server/utils/instance-registry', () => ({
  singleton: vi.fn((_, factory) => factory()),
}));

describe('Redis Client Initialization', () => {
  describe('getRedisClient', () => {
    it('should create a Redis client in standalone mode', async () => {
      vi.mocked(serverEnvironment).REDIS_CONNECTION_TYPE = 'standalone';

      const redisClient = await getRedisClient();

      expect(createClient).toHaveBeenCalledWith({
        url: 'redis://localhost:6379',
        username: 'user',
        password: 'password',
        commandOptions: {
          timeout: 10_000,
        },
        socket: {
          reconnectStrategy: expect.any(Function),
        },
      });

      expect(redisClient.connect).toHaveBeenCalled();
      expect(redisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(redisClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(redisClient.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
      expect(redisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should create a Redis client in sentinel mode', async () => {
      vi.mocked(serverEnvironment).REDIS_CONNECTION_TYPE = 'sentinel';

      const redisClient = await getRedisClient();

      expect(createSentinel).toHaveBeenCalledWith({
        name: 'mymaster',
        sentinelRootNodes: [{ host: 'localhost', port: 6379 }],
        nodeClientOptions: {
          username: 'user',
          password: 'password',
          commandOptions: {
            timeout: 10_000,
          },
          socket: {
            reconnectStrategy: expect.any(Function),
          },
        },
      });

      expect(redisClient.connect).toHaveBeenCalled();
      expect(redisClient.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(redisClient.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(redisClient.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
      expect(redisClient.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should skip connect() when the client is already open', async () => {
      vi.mocked(serverEnvironment).REDIS_CONNECTION_TYPE = 'standalone';

      const alreadyConnectedClient = {
        isOpen: true,
        connect: vi.fn(),
        on: vi.fn().mockReturnThis(),
      };
      vi.mocked(singleton).mockImplementationOnce((_key, _factory) => alreadyConnectedClient);

      const redisClient = await getRedisClient();

      expect(redisClient.connect).not.toHaveBeenCalled();
    });

    it('should throw when REDIS_SENTINEL_MASTER_NAME is missing in sentinel mode', async () => {
      vi.mocked(serverEnvironment).REDIS_CONNECTION_TYPE = 'sentinel';
      vi.mocked(serverEnvironment).REDIS_SENTINEL_MASTER_NAME = undefined;

      await expect(getRedisClient()).rejects.toThrow(
        'Missing required Redis Sentinel configuration: REDIS_SENTINEL_MASTER_NAME',
      );
    });
  });
});

describe('exponentialBackoffReconnectionStrategy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return an exponential backoff delay plus jitter', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // jitter = floor(0.5 * 100) = 50

    // retries=0: delay = min(2^0 * 50, 3000) = 50 → retryIn = 50 + 50 = 100
    expect(exponentialBackoffReconnectionStrategy(0, new Error('test'))).toBe(100);

    // retries=3: delay = min(2^3 * 50, 3000) = 400 → retryIn = 400 + 50 = 450
    expect(exponentialBackoffReconnectionStrategy(3, new Error('test'))).toBe(450);
  });

  it('should cap the delay at 3000ms regardless of retry count', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // jitter = 0

    // retries=10: delay = min(2^10 * 50, 3000) = min(51200, 3000) = 3000 → retryIn = 3000 + 0 = 3000
    expect(exponentialBackoffReconnectionStrategy(10, new Error('test'))).toBe(3000);
  });

  it('should add jitter between 0 and 99ms to the base delay', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // jitter = floor(0.99 * 100) = 99

    // retries=0: delay = 50 → retryIn = 50 + 99 = 149
    expect(exponentialBackoffReconnectionStrategy(0, new Error('test'))).toBe(149);
  });
});
