import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { ButtonLink } from '~/components/button-link';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';
import { mergeMeta } from '~/utils/meta-utils';
import { getTitleMetaTags } from '~/utils/seo-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:index.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace, 'common', 'estimator'],
} as const satisfies RouteHandle;

export const meta: Route.MetaFunction = mergeMeta(({ data }) => {
  if (!data) {
    return [];
  }
  return getTitleMetaTags(data.meta.title);
});

export async function loader({ request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);

  const meta = { title: t('common:meta.title.default') };

  return {
    meta,
  };
}

function formatBenefitPaymentsPeriodDate(date: Date, lang: 'fr' | 'en' | undefined) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  };

  return date.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', options);
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation(handle.i18nNamespace);
  const {
    ESTIMATOR_CDB_BENEFIT_PAYMENT_PERIOD_START,
    ESTIMATOR_CDB_BENEFIT_PAYMENT_PERIOD_END,
    ESTIMATOR_CDB_CONTACT_URL_EN,
    ESTIMATOR_CDB_CONTACT_URL_FR,
    ESTIMATOR_CDB_ELIGIBILITY_URL_EN,
    ESTIMATOR_CDB_ELIGIBILITY_URL_FR,
  } = globalThis.__appEnvironment;

  const cdbRequirementsLink = (
    <InlineLink
      to={i18n.language === 'fr' ? ESTIMATOR_CDB_ELIGIBILITY_URL_FR : ESTIMATOR_CDB_ELIGIBILITY_URL_EN}
      className="external-link"
      target="_blank"
    />
  );

  const cdbContactLink = (
    <InlineLink
      to={i18n.language === 'fr' ? ESTIMATOR_CDB_CONTACT_URL_FR : ESTIMATOR_CDB_CONTACT_URL_EN}
      className="external-link"
      target="_blank"
    />
  );

  return (
    <>
      <PageTitle>{t('estimator:index.page-title')}</PageTitle>

      <div className="space-y-6">
        <section className="space-y-6">
          <p>
            <Trans ns={handle.i18nNamespace} i18nKey="estimator:index.content.description" />
          </p>
          <h2 className="font-lato mb-4 text-2xl font-bold">{t('estimator:index.content.eligibility.header')}</h2>

          <p className="mb-4">{t('estimator:index.content.estimator-steps.intro')}</p>
          <ol className="list-decimal space-y-1 pl-7">
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="estimator:index.content.estimator-steps.step-1" />
            </li>
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="estimator:index.content.estimator-steps.step-2" />
            </li>
          </ol>
          <p>{t('estimator:index.content.completion-time')}</p>
          <p>
            <Trans
              ns={handle.i18nNamespace}
              i18nKey="estimator:index.content.result-disclaimer"
              components={{ cdbRequirementsLink }}
            />
          </p>
        </section>

        <section className="my-10">
          <div>
            <ButtonLink
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Dashboard:Start estimator button')}
              file="routes/estimator/step-marital-status.tsx"
              variant="primary"
              size="lg"
            >
              {t('estimator:index.start')}
            </ButtonLink>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-lato text-2xl font-bold">{t('estimator:index.content.results.header')}</h2>
          <p>
            {t('estimator:index.content.results.description', {
              paymentPeriodStart: formatBenefitPaymentsPeriodDate(
                new Date(ESTIMATOR_CDB_BENEFIT_PAYMENT_PERIOD_START),
                i18n.language,
              ),
              paymentPeriodEnd: formatBenefitPaymentsPeriodDate(
                new Date(ESTIMATOR_CDB_BENEFIT_PAYMENT_PERIOD_END),
                i18n.language,
              ),
            })}

            {i18n.language === 'fr' && ESTIMATOR_CDB_CONTACT_URL_FR && (
              <Trans
                ns={handle.i18nNamespace}
                i18nKey="estimator:index.content.results.contact"
                components={{ cdbContactLink }}
              />
            )}

            {i18n.language === 'en' && ESTIMATOR_CDB_CONTACT_URL_EN && (
              <Trans
                ns={handle.i18nNamespace}
                i18nKey="estimator:index.content.results.contact"
                components={{ cdbContactLink }}
              />
            )}
          </p>
        </section>
      </div>
    </>
  );
}
