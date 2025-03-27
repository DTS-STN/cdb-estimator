import type { RouteHandle } from 'react-router';

import type { i18n } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';

import type { Route } from './+types/results';
import type { CDBEstimator, FormattedCDBEstimator } from './@types';
import { calculateEstimation } from './calculator';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { ButtonLink } from '~/components/button-link';
import { ContextualAlert } from '~/components/contextual-alert';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import type { I18nRouteFile } from '~/i18n-routes';
import { handle as parentHandle } from '~/routes/estimator/layout';
import { calculateAge } from '~/utils/age-utils';
import { estimatorStepGate } from '~/utils/state-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:results.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  estimatorStepGate(context.session.estimator, 'routes/estimator/results.tsx', request);
  const { t } = await getTranslation(request, handle.i18nNamespace);

  if (context.session.estimator === undefined) {
    throw i18nRedirect('routes/index.tsx', request);
  }

  return {
    documentTitle: t('estimator:results.page-title'),
    results: context.session.estimator as CDBEstimator,
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {}

function formatCurrency(number: number, internationalization: i18n) {
  return number.toLocaleString(internationalization.language === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
  });
}

export default function Results({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t, i18n } = useTranslation(handle.i18nNamespace);
  const nonCdbPartnerEstimation = formatCurrency(calculateEstimation(loaderData.results, false), i18n);
  const cdbPartnerEstimation = formatCurrency(calculateEstimation(loaderData.results, true), i18n);

  const formattedResults: FormattedCDBEstimator = {
    age: calculateAge(loaderData.results.dateOfBirth.month, loaderData.results.dateOfBirth.year).toString(),
    maritalStatus: t(`estimator:results.form-data-summary.enum-display.marital-status.${loaderData.results.maritalStatus}`),
    income:
      loaderData.results.income.kind === 'single'
        ? {
            kind: 'single',
            netIncome: formatCurrency(loaderData.results.income.netIncome, i18n),
            workingIncome: formatCurrency(loaderData.results.income.workingIncome, i18n),
            claimedIncome: loaderData.results.income.claimedIncome
              ? formatCurrency(loaderData.results.income.claimedIncome, i18n)
              : undefined,
            claimedRepayment: loaderData.results.income.claimedRepayment
              ? formatCurrency(loaderData.results.income.claimedRepayment, i18n)
              : undefined,
          }
        : {
            kind: 'married',
            netIncome: formatCurrency(loaderData.results.income.netIncome, i18n),
            workingIncome: formatCurrency(loaderData.results.income.workingIncome, i18n),
            claimedIncome: loaderData.results.income.claimedIncome
              ? formatCurrency(loaderData.results.income.claimedIncome, i18n)
              : undefined,
            claimedRepayment: loaderData.results.income.claimedRepayment
              ? formatCurrency(loaderData.results.income.claimedRepayment, i18n)
              : undefined,
            partner: {
              netIncome: formatCurrency(loaderData.results.income.partner.netIncome, i18n),
              workingIncome: formatCurrency(loaderData.results.income.partner.workingIncome, i18n),
              claimedIncome: loaderData.results.income.partner.claimedIncome
                ? formatCurrency(loaderData.results.income.partner.claimedIncome, i18n)
                : undefined,
              claimedRepayment: loaderData.results.income.partner.claimedRepayment
                ? formatCurrency(loaderData.results.income.partner.claimedRepayment, i18n)
                : undefined,
            },
          },
  };

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('common:application-title')}>{t('estimator:results.page-title')}</PageTitle>

      <ContextualAlert type="info" className="my-6">
        <p>{t('estimator:results.disclaimer-alert')}</p>
      </ContextualAlert>

      <div className="flex flex-col space-y-12">
        <div className="md:grid md:grid-cols-3 md:gap-12">
          <section className="col-span-2 row-span-1 space-y-6">
            <h2 className="font-lato mb-4 text-lg font-bold">{t('estimator:results.content.your-estimate.header')}</h2>

            {loaderData.results.maritalStatus === 'single-divorced-separated-or-widowed' && (
              <>
                <p className="mb-4">{t('estimator:results.content.your-estimate.single.intro')}</p>
                <ul className="list-disc space-y-1 pl-7">
                  <li>
                    <Trans
                      ns={handle.i18nNamespace}
                      i18nKey="estimator:results.content.your-estimate.single.result"
                      values={{ result: nonCdbPartnerEstimation }}
                    />
                  </li>
                </ul>
              </>
            )}

            {loaderData.results.maritalStatus === 'married-or-common-law' && (
              <>
                <p className="mb-4">{t('estimator:results.content.your-estimate.married-common-law.intro')}</p>
                <ul className="list-disc space-y-1 pl-7">
                  <li>
                    <Trans
                      ns={handle.i18nNamespace}
                      i18nKey="estimator:results.content.your-estimate.married-common-law.non-cdb-partner-result"
                      values={{ result: nonCdbPartnerEstimation }}
                    />
                  </li>
                  <li>
                    <Trans
                      ns={handle.i18nNamespace}
                      i18nKey="estimator:results.content.your-estimate.married-common-law.cdb-partner-result"
                      values={{ result: cdbPartnerEstimation }}
                    />
                  </li>
                </ul>
              </>
            )}

            <h2 className="font-lato mb-4 text-lg font-bold">{t('estimator:results.content.next-steps.header')}</h2>

            <div className="my-6 space-y-6 rounded border border-[#6F6F6F] px-8 py-6">
              <div>
                <ButtonLink file="routes/estimator/step-age.tsx" variant="primary" startIcon={'external-link'} size="xl">
                  {t('estimator:results.content.next-steps.apply-cdb')}
                </ButtonLink>
              </div>

              <div>
                <ButtonLink file="routes/estimator/step-age.tsx" variant="alternative" startIcon={'external-link'} size="xl">
                  {t('estimator:results.content.next-steps.learn-more')}
                </ButtonLink>
              </div>
            </div>
          </section>
          <section className="col-span-1 row-span-2 space-y-4">
            <div className="my-8 rounded bg-stone-100 p-5 md:mt-0 md:max-w-[360px]">
              <h3 className="font-lato text-xl font-bold">{t('estimator:results.form-data-summary.title')}</h3>

              <div className="space-y-4">
                {InfoBlock(
                  t('estimator:results.form-data-summary.field-labels.age'),
                  t('estimator:results.form-data-summary.edit-aria-labels.age'),
                  'routes/estimator/step-age.tsx',
                  formattedResults.age,
                  false,
                )}
                {InfoBlock(
                  t('estimator:results.form-data-summary.field-labels.marital-status'),
                  t('estimator:results.form-data-summary.edit-aria-labels.marital-status'),
                  'routes/estimator/step-marital-status.tsx',
                  formattedResults.maritalStatus,
                  true,
                )}
                {InfoBlock(
                  t('estimator:results.form-data-summary.field-labels.net-income'),
                  t('estimator:results.form-data-summary.edit-aria-labels.net-income'),
                  'routes/estimator/step-income.tsx',
                  formattedResults.income.netIncome,
                  true,
                )}
                {InfoBlock(
                  t('estimator:results.form-data-summary.field-labels.working-income'),
                  t('estimator:results.form-data-summary.edit-aria-labels.working-income'),
                  'routes/estimator/step-income.tsx',
                  formattedResults.income.workingIncome,
                  true,
                )}
                {InfoBlock(
                  t('estimator:results.form-data-summary.field-labels.uccb-rdsp-income'),
                  t('estimator:results.form-data-summary.edit-aria-labels.uccb-rdsp-income'),
                  'routes/estimator/step-income.tsx',
                  formattedResults.income.claimedIncome ?? '-',
                  true,
                )}
                {InfoBlock(
                  t('estimator:results.form-data-summary.field-labels.uccb-rdsp-repayment'),
                  t('estimator:results.form-data-summary.edit-aria-labels.uccb-rdsp-repayment'),
                  'routes/estimator/step-income.tsx',
                  formattedResults.income.claimedRepayment ?? '-',
                  true,
                )}

                {formattedResults.income.kind === 'married' && (
                  <>
                    {InfoBlock(
                      t('estimator:results.form-data-summary.field-labels.partner-net-income'),
                      t('estimator:results.form-data-summary.edit-aria-labels.partner-net-income'),
                      'routes/estimator/step-income.tsx',
                      formattedResults.income.partner.netIncome,
                      true,
                    )}
                    {InfoBlock(
                      t('estimator:results.form-data-summary.field-labels.partner-working-income'),
                      t('estimator:results.form-data-summary.edit-aria-labels.partner-working-income'),
                      'routes/estimator/step-income.tsx',
                      formattedResults.income.partner.workingIncome,
                      true,
                    )}
                    {InfoBlock(
                      t('estimator:results.form-data-summary.field-labels.partner-uccb-rdsp-income'),
                      t('estimator:results.form-data-summary.edit-aria-labels.partner-uccb-rdsp-income'),
                      'routes/estimator/step-income.tsx',
                      formattedResults.income.partner.claimedIncome ?? '-',
                      true,
                    )}
                    {InfoBlock(
                      t('estimator:results.form-data-summary.field-labels.partner-uccb-rdsp-repayment'),
                      t('estimator:results.form-data-summary.edit-aria-labels.partner-uccb-rdsp-repayment'),
                      'routes/estimator/step-income.tsx',
                      formattedResults.income.partner.claimedRepayment ?? '-',
                      true,
                    )}
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoBlock(title: string, editAriaLabel: string, editRoute: I18nRouteFile, value: string, showBorder: boolean) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className={showBorder ? 'border-t border-stone-600' : ''}>
      <div>{title}</div>
      <div className="grid grid-cols-3 gap-0">
        <div className="col-span-2">
          <strong>{value}</strong>
        </div>
        <div className="self-end justify-self-end">
          <InlineLink file={editRoute} aria-label={editAriaLabel}>
            {t('common:edit')}
          </InlineLink>
        </div>
      </div>
    </div>
  );
}
