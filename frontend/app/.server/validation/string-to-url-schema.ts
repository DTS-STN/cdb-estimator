import * as v from 'valibot';

export function stringToUrlSchema(): v.GenericSchema<string, string> {
  return v.pipe(v.string(), v.url('must be a valid url'));
}
