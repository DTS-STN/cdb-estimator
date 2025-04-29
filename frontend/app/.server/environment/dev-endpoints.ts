import * as v from 'valibot';

import { stringToBooleanSchema } from '../validation/string-to-boolean-schema';

export type DevEndpoints = Readonly<v.InferOutput<typeof devEndpoints>>;

export const defaults = {
  DEV_ENDPOINTS_ENABLED: 'false',
} as const;

export const devEndpoints = v.object({
  DEV_ENDPOINTS_ENABLED: v.optional(stringToBooleanSchema(), defaults.DEV_ENDPOINTS_ENABLED),
});
