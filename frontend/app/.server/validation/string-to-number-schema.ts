import * as v from 'valibot';

export function stringToNumberSchema(): v.GenericSchema<string, number> {
  return v.pipe(v.string(), v.trim(), v.nonEmpty(), v.transform(Number));
}
