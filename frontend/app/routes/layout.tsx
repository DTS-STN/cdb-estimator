import type { RouteHandle } from 'react-router';
import { Outlet } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/layout';

import { Breadcrumbs } from '~/components/breadcrumbs';
import { LanguageSwitcher } from '~/components/language-switcher';
import { AppLink } from '~/components/links';
import { PageDetails } from '~/components/page-details';
import { SkipNavigationLinks } from '~/components/skip-navigation-links';
import { useRoute } from '~/hooks/use-route';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

export const handle = {
  breadcrumbs: [
    ...globalThis.__appEnvironment.BREADCRUMBS.map((item) => {
      return { label: { en: item.label.en, fr: item.label.fr }, destination: { en: item.url.en, fr: item.url.fr } };
    }),
  ],
  i18nNamespace: ['common'],
} as const satisfies RouteHandle;

export default function Layout({ matches }: Route.ComponentProps) {
  const { t, i18n } = useTranslation(['common']);
  const currentLanguage = i18n.language as Language;
  const { id: pageId } = useRoute();

  const { BUILD_DATE, BUILD_VERSION } = globalThis.__appEnvironment;

  const breadcrumbs = (matches[matches.length - 1]?.handle as RouteHandle).breadcrumbs;

  return (
    <>
      <header className="border-b-[3px] border-slate-700 print:hidden">
        <SkipNavigationLinks />
        <div id="wb-bnr">
          <div className="container flex items-center justify-between gap-6 py-2.5 sm:py-3.5">
            <AppLink to="https://canada.ca/">
              <img
                className="h-8 w-auto"
                src={`https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-${currentLanguage}.svg`}
                alt={t('common:header.govt-of-canada.text')}
                width="300"
                height="28"
                decoding="async"
              />
            </AppLink>
            <LanguageSwitcher data-gc-analytics-customclick={adobeAnalytics.getCustomClick(`LanguageSwitcher:Toggle`)}>
              <span className="hidden md:block" lang={t('common:language-switcher.alt-lang-abbr-prop')}>
                {t('common:language-switcher.alt-lang')}
              </span>
              <abbr title={t('common:language-switcher.alt-lang')} className="cursor-help uppercase md:hidden">
                {t('common:language-switcher.alt-lang-abbr')}
              </abbr>
            </LanguageSwitcher>
          </div>
        </div>
      </header>
      <Breadcrumbs items={breadcrumbs} className="my-4" />
      <main className="container">
        <Outlet />
        <PageDetails buildDate={BUILD_DATE} buildVersion={BUILD_VERSION} pageId={pageId} />
      </main>
      <footer id="wb-info" tabIndex={-1} className="bg-stone-50 print:hidden">
        <div className="container flex items-center justify-end gap-6 py-2.5 sm:py-3.5">
          <div>
            <h2 className="sr-only">{t('common:footer.about-site')}</h2>
            <div>
              <img
                src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/wmms-blk.svg"
                alt={t('common:footer.gc-symbol')}
                width={300}
                height={71}
                className="h-10 w-auto"
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
