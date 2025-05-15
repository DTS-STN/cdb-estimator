import { describe, expect, it } from 'vitest';

import { formatCurrency } from '~/utils/currency-utils';

describe('currency-utils', () => {
  describe('formatCurrency', () => {
    it.each([
      { input: 1199.994, output: '$1,199.99', lang: 'en', description: 'rounds cents down (en-CA)' },
      { input: 1199.995, output: '$1,200.00', lang: 'en', description: 'rounds half cent up (en-CA)' },
      { input: 2000.54, output: '$2,000.54', lang: 'en', description: 'whole cent matches output (en-CA)' },
      { input: 1199.994, output: '1\u00A0199,99\u00A0$', lang: 'fr', description: 'rounds cents down (fr-CA)' },
      { input: 1199.995, output: '1\u00A0200,00\u00A0$', lang: 'fr', description: 'rounds half cent up (fr-CA)' },
      { input: 2000.54, output: '2\u00A0000,54\u00A0$', lang: 'fr', description: 'whole cent matches output (fr-CA)' },
    ])(
      'formatCurrency should format numbers into proper canadian currency formats based on language/locale:$description',
      ({ input, output, lang }) => {
        const str = formatCurrency(input, lang as Language);
        expect(str).toBe(output);
      },
    );
  });
});
