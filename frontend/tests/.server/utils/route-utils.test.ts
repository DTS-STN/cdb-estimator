import { describe, expect, it } from 'vitest';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { ErrorCodes } from '~/errors/error-codes';

describe('route-utils', () => {
  describe('i18nRedirect', () => {
    it('should throw an error if no language is found', () => {
      expect(() => i18nRedirect('routes/index.tsx', '')).toThrow(
        expect.objectContaining({
          msg: 'No language found in request',
          errorCode: ErrorCodes.NO_LANGUAGE_FOUND,
        }),
      );
    });

    it('should redirect to the correct path if language is found', () => {
      const result = i18nRedirect('routes/index.tsx', '/en/');

      expect(result.status).toBe(302);
      expect(result.headers.get('location')).toBe('/en');
    });

    it('should redirect to the correct path when search params are provided', () => {
      const result = i18nRedirect('routes/index.tsx', '/en/', { search: new URLSearchParams('foo=bar=baz') });

      expect(result.status).toBe(302);
      expect(result.headers.get('location')).toBe('/en?foo=bar%3Dbaz');
    });
  });
});
