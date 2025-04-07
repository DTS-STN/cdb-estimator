import { createRoutesStub } from 'react-router';

import { render } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BreadcrumbItem } from '~/components/breadcrumbs';
import { Breadcrumbs } from '~/components/breadcrumbs';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

vi.mock('~/utils/adobe-analytics-utils', () => ({
  __esModule: true,
  isEnabled: vi.fn(),
  getCustomClick: vi.fn(),
}));

describe('Breadcrumbs', () => {
  afterEach(() => {
    vi.mocked(useTranslation).mockReset();
    vi.mocked(adobeAnalytics.isEnabled).mockReset();
    vi.mocked(adobeAnalytics.getCustomClick).mockReset();
  });

  it.each(
    new Array<{ lang: Language; items: BreadcrumbItem[] }>(
      {
        lang: 'en',
        items: [] as BreadcrumbItem[],
      },
      {
        lang: 'fr',
        items: [
          {
            label: { en: 'Canada.ca en', fr: 'Canada.ca fr' },
            destination: { en: 'https://www.canada.ca/en.html', fr: 'https://www.canada.ca/fr.html' },
          },
        ] as BreadcrumbItem[],
      },
      {
        lang: 'en',
        items: [
          {
            label: { en: 'Canada.ca en', fr: 'Canada.ca fr' },
            destination: { en: 'https://www.canada.ca/en.html', fr: 'https://www.canada.ca/fr.html' },
          },
        ] as BreadcrumbItem[],
      },
      {
        lang: 'fr',
        items: [{ labelKey: 'estimator:index.breadcrumb', destinationRoute: { file: 'routes/index.tsx' } }] as BreadcrumbItem[],
      },
      {
        lang: 'en',
        items: [{ labelKey: 'estimator:index.breadcrumb', destinationRoute: { file: 'routes/index.tsx' } }] as BreadcrumbItem[],
      },
      {
        lang: 'en',
        items: [
          {
            label: { en: 'Canada.ca', fr: 'Canada.ca' },
            destination: { en: 'https://www.canada.ca/en.html', fr: 'https://www.canada.ca/fr.html' },
          },
          {
            label: { en: 'Benefits', fr: 'Prestations' },
            destination: {
              en: 'https://www.canada.ca/en/services/benefits.html',
              fr: 'https://www.canada.ca/fr/services/prestations.html',
            },
          },
          {
            label: { en: 'Disability benefits', fr: "Prestations d'invalidité" },
            destination: {
              en: 'https://www.canada.ca/en/services/benefits/disability.html',
              fr: 'https://www.canada.ca/fr/services/prestations/handicap.html',
            },
          },
          {
            label: { en: 'Canada Disability Benefit', fr: 'Prestation canadienne pour les personnes handicapées' },
            destination: {
              en: 'https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit.html',
              fr: 'https://www.canada.ca/fr/services/prestations/handicap/prestation-canadienne-personnes-situation-handicap.html',
            },
          },
          { labelKey: 'estimator:index.breadcrumb', destinationRoute: { file: 'routes/index.tsx' } },
        ] as BreadcrumbItem[],
      },
    ),
  )('should render links', ({ lang, items }) => {
    const translation = useTranslation();
    vi.mocked(useTranslation).mockReturnValue({ ...translation, i18n: { ...translation.i18n, language: lang } });
    vi.mocked(adobeAnalytics.isEnabled).mockReturnValue(false);
    const getCustomClickMock = vi.mocked(adobeAnalytics.getCustomClick).mockReturnValue(undefined);

    const RoutesStub = createRoutesStub([
      {
        path: `/${lang}`,
        Component: () => <Breadcrumbs items={items} />,
      },
    ]);

    const { container } = render(<RoutesStub initialEntries={[`/${lang}`]} />);
    expect(container).toMatchSnapshot('expected html');
    expect(getCustomClickMock).toBeCalledTimes(items.length);
  });
});
