import { describe, expect, it } from 'vitest';

import { randomString, removeNumericFormatting } from '~/utils/string-utils';

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

    it.each([
      { input: '.00', output: '.00' },
      { input: '0.00', output: '0.00' },
      { input: '1,234.56', output: '1234.56' },
      { input: '123.56', output: '123.56' },
      { input: ',00', output: '.00' },
      { input: '0,00', output: '0.00' },
      { input: '1 234,56', output: '1234.56' },
      { input: '123,56', output: '123.56' },
      { input: '1 234', output: '1234' },
      { input: '1,234', output: '1234' },
      { input: '1,234,567', output: '1234567' },
      { input: '1 234 567', output: '1234567' },
      { input: '1', output: '1' },
      { input: '12', output: '12' },
      { input: '123', output: '123' },
      { input: '1.1', output: '1.1' },
      { input: '1,1', output: '1.1' },
      { input: '1,12', output: '1.12' },
      { input: '1.12', output: '1.12' },
      { input: '123.12', output: '123.12' },
      { input: '123,12', output: '123.12' },
      { input: '1,234.12', output: '1234.12' },
      { input: '1 234,12', output: '1234.12' },
    ])(
      'removeNumericFormatting should remove formatting from a formatted decimal string representation ($input)',
      ({ input, output }) => {
        const str = removeNumericFormatting(input);
        expect(str).toBe(output);
      },
    );
  });
});
