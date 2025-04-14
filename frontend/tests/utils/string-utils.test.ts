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
      { input: '.00', output: '.00', lang: 'en' },
      { input: '0.00', output: '0.00', lang: 'en' },
      { input: '1,234.56', output: '1234.56', lang: 'en' },
      { input: '123.56', output: '123.56', lang: 'en' },
      { input: ',00', output: '.00', lang: 'fr' },
      { input: '0,00', output: '0.00', lang: 'fr' },
      { input: '1 234,56', output: '1234.56', lang: 'fr' },
      { input: '123,56', output: '123.56', lang: 'fr' },
    ])(
      'removeNumericFormatting should remove formatting from a formatted decimal string representation',
      ({ input, lang, output }) => {
        const str = removeNumericFormatting(input, lang as Language);
        expect(str).toBe(output);
      },
    );
  });
});
