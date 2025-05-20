import type { HealthCheckOptions } from '@dts-stn/health-checks';
import { execute } from '@dts-stn/health-checks';

import type { Route } from './+types/health';

import { serverEnvironment } from '~/.server/environment';
import { LogFactory } from '~/.server/logging';
import { getRedisClient } from '~/.server/redis';

const log = LogFactory.getLogger(import.meta.url);

export async function loader({ context, params, request }: Route.LoaderArgs) {
  log.info('Handling health check request');

  const { include, exclude, timeout } = Object.fromEntries(new URL(request.url).searchParams);
  const redisHealthCheck = { name: 'redis', check: async () => void (await getRedisClient().ping()) };

  const healthCheckOptions: HealthCheckOptions = {
    excludeComponents: toArray(exclude),
    includeComponents: toArray(include),
    // TODO: Simplify helath check so we don't need to hide any details.
    includeDetails: true,
    metadata: {
      buildId: serverEnvironment.BUILD_ID,
      version: serverEnvironment.BUILD_VERSION,
    },
    timeoutMs: toNumber(timeout),
  };

  log.debug('Health check options:', healthCheckOptions);

  if (serverEnvironment.SESSION_TYPE !== 'redis') {
    log.debug('Skipping Redis health check because SESSION_TYPE is not redis.');
    healthCheckOptions.excludeComponents ??= [];
    healthCheckOptions.excludeComponents.push(redisHealthCheck.name);
  }

  const summary = await execute([redisHealthCheck], healthCheckOptions);
  log.debug('Health check completed successfully. Summary:', summary);

  return Response.json({ summary });
}

function toArray(str?: string): string[] | undefined {
  const result = str?.split(',').filter(Boolean);
  return result && result.length > 0 ? result : undefined;
}

function toNumber(str?: string): number | undefined {
  const num = Number.parseInt(str ?? '');
  return Number.isNaN(num) ? undefined : num;
}
