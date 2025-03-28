import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { ButtonLink } from '~/components/button-link';
import { ContextualAlert } from '~/components/contextual-alert';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'common:index.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace, 'common'],
} as const satisfies RouteHandle;

export async function loader({ request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('common:index.page-title') };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export default function Home() {
  const { t } = useTranslation(handle.i18nNamespace);

  const cdbLink = <InlineLink to={t('common:index.content.cdb-href')} className="external-link" target="_blank" />;
  const contactLink = <InlineLink to={t('common:index.content.contact-href')} className="external-link" target="_blank" />;
  const feedbackLink = (
    <InlineLink to={t('common:index.content.alert-work-in-progress.feedback-href')} className="external-link" target="_blank" />
  );

  return (
    <>
      <PageTitle>{t('common:index.page-title')}</PageTitle>

      <ContextualAlert type="info" className="my-6">
        <p>
          <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.alert-work-in-progress.work-in-progress" />
        </p>
        <p>
          <Trans
            ns={handle.i18nNamespace}
            i18nKey="common:index.content.alert-work-in-progress.feedback"
            components={{ feedbackLink }}
          />
        </p>
      </ContextualAlert>

      <div className="space-y-6">
        <section className="space-y-6">
          <p>
            <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.description" components={{ cdbLink }} />
          </p>
          <h2 className="font-lato mb-4 text-lg font-bold">{t('common:index.content.eligibility.header')}</h2>
          <p>
            <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.intro" components={{ cdbLink }} />
          </p>
          <p className="mb-4">{t('common:index.content.eligibility.criterias.intro')}</p>
          <ol className="list-decimal space-y-1 pl-7">
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.criteria-1" />
            </li>
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.criteria-2" />
            </li>
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.criteria-3" />
            </li>
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.criteria-4" />
            </li>
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.criteria-5" />
              <ul className="list-disc space-y-1 pl-7">
                <li>
                  <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.target-audience-1" />
                </li>
                <li>
                  <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.target-audience-2" />
                </li>
                <li>
                  <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.target-audience-3" />
                </li>
                <li>
                  <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.target-audience-4" />
                </li>
                <li>
                  <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.criterias.target-audience-5" />
                </li>
              </ul>
            </li>
          </ol>
          <p>{t('common:index.content.eligibility.spouse-requirement')}</p>
          <p className="mb-4">{t('common:index.content.eligibility.spouse-requirement-waive.intro')}</p>
          <ol className="list-decimal space-y-1 pl-7">
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.spouse-requirement-waive.criteria-1" />
            </li>
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.spouse-requirement-waive.criteria-2" />
            </li>
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.eligibility.spouse-requirement-waive.criteria-3" />
            </li>
          </ol>
          <p className="mb-4">{t('common:index.content.estimator-steps.intro')}</p>
          <ol className="list-decimal space-y-1 pl-7">
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.estimator-steps.step-1" />
            </li>
            <li>
              <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.estimator-steps.step-2" />
            </li>
          </ol>
          <p>{t('common:index.content.completion-time')}</p>
          <p>
            <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.result-disclaimer" />
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
              {t('common:index.start')}
            </ButtonLink>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-lato text-lg font-bold">{t('common:index.content.results.header')}</h2>
          <p>
            <Trans ns={handle.i18nNamespace} i18nKey="common:index.content.results.description" components={{ contactLink }} />
          </p>
        </section>
      </div>
    </>
  );
}
