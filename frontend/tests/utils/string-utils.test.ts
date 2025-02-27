import { describe, expect, it } from 'vitest';

import { randomString } from '~/utils/string-utils';

describe('string-utils', () => {
  describe('randomString', () => {
    it('should generate a random string of specified length with the correct default character set', () => {
      const str = randomString(128);
      expect(str.length).toEqual(128);
      expect(str).toMatch(/[0-9a-z]+/);
    });

    it('should generate a random string of specified length with the correct specific character set', () => {
      const str = randomString(128, 'CDB Estimator');
      expect(str.length).toEqual(128);
      expect(str).toMatch(/[CDB Estimator]+/);
    });
  });
});
