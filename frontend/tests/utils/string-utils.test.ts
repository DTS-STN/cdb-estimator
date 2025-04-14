import { describe, expect, it } from 'vitest';

import { formatCurrency, randomString, removeNumericFormatting } from '~/utils/string-utils';

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

  describe('formatCurrency', () => {
    it.each([
      { input: 1199.994, output: '$1,199.99', lang: 'en', description: 'rounds cents down (en-CA)' },
      { input: 1199.995, output: '$1,200.00', lang: 'en', description: 'rounds half cent up (en-CA)' },
      { input: 2000.54, output: '$2,000.54', lang: 'en', description: 'whole cent matches output (en-CA)' },
      { input: 1199.994, output: '1\u00a0199,99\u00a0$', lang: 'fr', description: 'rounds cents down (fr-CA)' },
      { input: 1199.995, output: '1\u00a0200,00\u00a0$', lang: 'fr', description: 'rounds half cent up (fr-CA)' },
      { input: 2000.54, output: '2\u00a0000,54\u00a0$', lang: 'fr', description: 'whole cent matches output (fr-CA)' },
    ])(
      'formatCurrency should format numbers into proper canadian currency formats based on language/locale:$description',
      ({ input, output, lang }) => {
        const str = formatCurrency(input, lang as Language);
        expect(str).toBe(output);
      },
    );
  });
});
