import { createRoutesStub } from 'react-router';

import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';

import { CurrencyField } from '~/components/currency-field';

vi.mock('~/i18n-routes', async (importActual) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await importActual<typeof import('~/i18n-routes')>();

  return {
    ...actual,

    i18nRoutes: [
      {
        id: 'ROUTE-0001',
        file: 'routes/index.tsx',
        paths: { en: '/en', fr: '/fr' },
      },
    ],
  };
});

describe('CurrencyField', () => {
  it.each([
    { lang: 'en', input: '1.1', output: '1.10' },
    { lang: 'en', input: '.1', output: '0.10' },
    { lang: 'en', input: '12345.1', output: '12,345.10' },
    { lang: 'en', input: '12345', output: '12,345' },
    { lang: 'en', input: '12,345.56', output: '12,345.56' },
    { lang: 'en', input: '12345.56', output: '12,345.56' },
    { lang: 'en', input: '.56', output: '0.56' },
    { lang: 'en', input: '56', output: '56' },
    { lang: 'en', input: 'bla bla', output: '' },
    { lang: 'fr', input: '1,1', output: '1,10' },
    { lang: 'fr', input: ',1', output: '0,10' },
    { lang: 'fr', input: '12345,1', output: '12 345,10' },
    { lang: 'fr', input: '12345', output: '12 345' },
    { lang: 'fr', input: '12 345,56', output: '12 345,56' },
    { lang: 'fr', input: '12345,56', output: '12 345,56' },
    { lang: 'fr', input: ',56', output: '0,56' },
    { lang: 'fr', input: '56', output: '56' },
    { lang: 'fr', input: 'bla bla', output: '' },
    { lang: 'fr', input: '12.34', output: '12,34' },
  ])('should render currency field component with correct value', ({ lang, input, output }) => {
    const translation = useTranslation();
    vi.mocked(useTranslation).mockReturnValue({ ...translation, i18n: { ...translation.i18n, language: lang as Language } });
    const RoutesStub = createRoutesStub([
      {
        path: `/${lang}`,
        Component: () => <CurrencyField id="test-id" name="test" label="label test" defaultValue={input} />,
      },
    ]);

    render(<RoutesStub initialEntries={[`/${lang}`]} />);

    const inputElement = document.querySelector('#input-text-field-test-id-input');
    expect(inputElement).toBeDefined();
    expect(inputElement?.getAttribute('value')).toBe(output);
  });
});
