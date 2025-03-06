import { useLocation } from 'react-router';

import { describe, expect, it, vi } from 'vitest';

import { useRoute } from '~/hooks/use-route';

vi.mock('react-router', async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importActual<typeof import('react-router')>();

  return {
    ...actual,
    useLocation: vi.fn(),
  };
});

describe('useRoute', () => {
  it('should return the correct route for a given pathname', () => {
    vi.mocked(useLocation, { partial: true }).mockReturnValue({ pathname: '/en' });

    expect(useRoute()).toEqual(
      expect.objectContaining({
        file: 'routes/index.tsx',
        paths: { en: '/en', fr: '/fr' },
      }),
    );
  });
});
