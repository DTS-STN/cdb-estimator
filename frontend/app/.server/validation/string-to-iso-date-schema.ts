import * as v from 'valibot';

export function stringToIsoDateSchema(): v.GenericSchema<string, string> {
  return v.pipe(v.string(), v.isoDate());
}
