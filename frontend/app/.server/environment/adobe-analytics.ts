import * as v from 'valibot';

import { stringToBooleanSchema } from '../validation/string-to-boolean-schema';

export type Buildinfo = Readonly<v.InferOutput<typeof adobeAnalytics>>;

export const defaults = {
  ADOBE_ANALYTICS_SRC: 'https://assets.adobedtm.com/be5dfd287373/9b9cb7867b5b/launch-cad75bf2f0d2-staging.min.js',
  ADOBE_ANALYTICS_JQUERY_SRC: 'https://code.jquery.com/jquery-3.7.1.min.js',
  ADOBE_ANALYTICS_ENABLED: 'true',
  ADOBE_ANALYTICS_DEBUG: 'false',
  ADOBE_ANALYTICS_SERVICE_NAME: 'ESDC-EDSC_CDB-PCH',
  ADOBE_ANALYTICS_ERROR_NAME: 'ESDC-EDSC:CDB-estimator',
} as const;

export const adobeAnalytics = v.object({
  ADOBE_ANALYTICS_SRC: v.optional(
    v.pipe(v.string(), v.url('The ADOBE_ANALYTICS_SRC must be a valid url.')),
    defaults.ADOBE_ANALYTICS_SRC,
  ),
  ADOBE_ANALYTICS_JQUERY_SRC: v.optional(
    v.pipe(v.string(), v.url('The ADOBE_ANALYTICS_JQUERY_SRC must be a valid url.')),
    defaults.ADOBE_ANALYTICS_JQUERY_SRC,
  ),
  ADOBE_ANALYTICS_ENABLED: v.optional(stringToBooleanSchema(), defaults.ADOBE_ANALYTICS_ENABLED),
  ADOBE_ANALYTICS_DEBUG: v.optional(stringToBooleanSchema(), defaults.ADOBE_ANALYTICS_DEBUG),
  ADOBE_ANALYTICS_SERVICE_NAME: v.optional(v.string(), defaults.ADOBE_ANALYTICS_SERVICE_NAME),
  ADOBE_ANALYTICS_CUSTOM_CLICK_PREFIX: v.optional(v.string(), `${defaults.ADOBE_ANALYTICS_SERVICE_NAME}`),
  ADOBE_ANALYTICS_ERROR_NAME: v.optional(v.string(), `${defaults.ADOBE_ANALYTICS_ERROR_NAME}`),
});
