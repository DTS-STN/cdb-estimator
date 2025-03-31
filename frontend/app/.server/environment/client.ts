import * as v from 'valibot';

import { adobeAnalytics, defaults as adobeAnalyticsDefaults } from './adobe-analytics';
import { estimator, defaults as estimatorDefaults } from './estimator';

import { breadcrumbs, defaults as breadcrumbsDefaults } from '~/.server/environment/breadcrumbs';
import { buildinfo, defaults as buildinfoDefaults } from '~/.server/environment/buildinfo';
import { stringToBooleanSchema } from '~/.server/validation/string-to-boolean-schema';

export type Client = Readonly<v.InferOutput<typeof client>>;

export const defaults = {
  ...adobeAnalyticsDefaults,
  ...buildinfoDefaults,
  ...breadcrumbsDefaults,
  ...estimatorDefaults,
} as const;

/**
 * Environment variables that are safe to expose publicly to the client.
 * ⚠️ IMPORTANT: DO NOT PUT SENSITIVE CONFIGURATIONS HERE ⚠️
 */
export const client = v.object({
  ...adobeAnalytics.entries,
  ...buildinfo.entries,
  ...breadcrumbs.entries,
  ...estimator.entries,
  I18NEXT_DEBUG: v.optional(stringToBooleanSchema()),
  isProduction: v.boolean(),
});
