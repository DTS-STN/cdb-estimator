import * as v from 'valibot';

import { client, defaults as clientDefaults } from '~/.server/environment/client';
import { features, defaults as featuresDefaults } from '~/.server/environment/features';
import { logging, defaults as loggingDefaults } from '~/.server/environment/logging';
import { redis, defaults as redisDefaults } from '~/.server/environment/redis';
import { session, defaults as sessionDefaults } from '~/.server/environment/session';
import { telemetry, defaults as telemetryDefaults } from '~/.server/environment/telemetry';
import { LogFactory } from '~/.server/logging';
import { stringToIntegerSchema } from '~/.server/validation/string-to-integer-schema';
import { isValidTimeZone } from '~/utils/date-utils';

const log = LogFactory.getLogger(import.meta.url);

export type Server = Readonly<v.InferOutput<typeof server>>;

export const defaults = {
  BASE_TIMEZONE: 'Canada/Eastern',
  NODE_ENV: 'development',
  PORT: '3000',
  ...clientDefaults,
  ...featuresDefaults,
  ...loggingDefaults,
  ...redisDefaults,
  ...sessionDefaults,
  ...telemetryDefaults,
} as const;

/**
 * Server-side environment variables.
 * Also includes all client-side variables.
 */
export const server = v.pipe(
  v.object({
    ...client.entries,
    ...features.entries,
    ...logging.entries,
    ...redis.entries,
    ...session.entries,
    ...telemetry.entries,
    BASE_TIMEZONE: v.optional(v.pipe(v.string(), v.check(isValidTimeZone)), defaults.BASE_TIMEZONE),
    NODE_ENV: v.optional(v.picklist(['production', 'development', 'test']), defaults.NODE_ENV),
    PORT: v.optional(v.pipe(stringToIntegerSchema(), v.minValue(0)), defaults.PORT),
  }),
  v.rawCheck(({ dataset }) => {
    if (dataset.typed) {
      const { value } = dataset;

      warn(
        value.isProduction && value.ENABLE_DEVMODE_OIDC === true,
        'Setting ENABLE_DEVMODE_OIDC=true is not recommended in production!',
      );
    }
  }),
);

/**
 * Logs a warning if the check evaluates to true.
 * Always returns true so it can be used in a zod refine() function.
 */
function warn(check: boolean, message: string): true {
  return check && log.warn(message), true;
}
