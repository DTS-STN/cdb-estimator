import { data } from 'react-router';
import type { RouteHandle } from 'react-router';

import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/results';
import type {
  CDBEstimator,
  FormattedCDBEstimator,
  FormattedMarriedIncome,
  FormattedMarriedResults,
  FormattedSingleIncome,
  FormattedSingleResults,
} from './@types';
import { calculateEstimation } from './calculator';
import { validMaritalStatuses } from './types';

import { ButtonLink } from '~/components/button-link';
import { ContextualAlert } from '~/components/contextual-alert';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import type { I18nRouteFile } from '~/i18n-routes';
import { handle as parentHandle } from '~/routes/estimator/layout';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';
import { estimatorStepGate } from '~/utils/state-utils';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:results.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  estimatorStepGate(context.session.estimator, 'routes/estimator/results.tsx', request);
  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  if (context.session.estimator === undefined) {
    throw data({ errors: 'state is undefined' }, { status: 500 });
  }

  const formattedPersonIncomeSchema = v.object({
    netIncome: v.number(),
    workingIncome: v.number(),
    claimedIncome: v.optional(v.number()),
    claimedRepayment: v.optional(v.number()),
  });

  const formattedResultsSchema = v.pipe(
    v.object({
      maritalStatus: v.picklist(validMaritalStatuses),
      income: v.variant('kind', [
        v.object({
          kind: v.literal('single'),
          ...formattedPersonIncomeSchema.entries,
        }),
        v.object({
          kind: v.literal('married'),
          ...formattedPersonIncomeSchema.entries,
          partner: formattedPersonIncomeSchema,
        }),
      ]),
    }),
    v.transform((input) => {
      return {
        maritalStatus: t(`estimator:results.form-data-summary.enum-display.marital-status.${input.maritalStatus}`),
        income: {
          kind: input.income.kind,
          netIncome: formatCurrency(input.income.netIncome, lang),
          workingIncome: formatCurrency(input.income.workingIncome, lang),
          claimedIncome: input.income.claimedIncome ? formatCurrency(input.income.claimedIncome, lang) : undefined,
          claimedRepayment: input.income.claimedRepayment ? formatCurrency(input.income.claimedRepayment, lang) : undefined,
          partner:
            input.income.kind === 'married'
              ? {
                  netIncome: formatCurrency(input.income.partner.netIncome, lang),
                  workingIncome: formatCurrency(input.income.partner.workingIncome, lang),
                  claimedIncome: input.income.partner.claimedIncome
                    ? formatCurrency(input.income.partner.claimedIncome, lang)
                    : undefined,
                  claimedRepayment: input.income.partner.claimedRepayment
                    ? formatCurrency(input.income.partner.claimedRepayment, lang)
                    : undefined,
                }
              : undefined,
        } as FormattedMarriedIncome | FormattedSingleIncome,
        results:
          input.income.kind === 'married'
            ? ({
                kind: 'married',
                estimation: formatCurrency(calculateEstimation(input.income).estimation, lang),
                estimationSplitBenefit: formatCurrency(calculateEstimation(input.income).estimationSplitBenefit ?? 0, lang),
              } as FormattedMarriedResults)
            : ({
                kind: 'single',
                estimation: formatCurrency(calculateEstimation(input.income).estimation, lang),
              } as FormattedSingleResults),
      };
    }),
  ) satisfies v.GenericSchema<CDBEstimator, FormattedCDBEstimator>;

  const parsedResults = v.safeParse(formattedResultsSchema, context.session.estimator);
  if (!parsedResults.success) {
    throw data({ errors: v.flatten<typeof formattedResultsSchema>(parsedResults.issues) }, { status: 500 });
  }

  return {
    documentTitle: t('estimator:results.page-title'),
    results: context.session.estimator as CDBEstimator,
    formattedResults: parsedResults.output,
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {}

function formatCurrency(number: number, lang: Language) {
  return number.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
  });
}

export default function Results({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

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
                      values={{ result: loaderData.formattedResults.results.estimation }}
                    />
                  </li>
                </ul>
              </>
            )}

            {loaderData.formattedResults.results.kind === 'married' && (
              <>
                <p className="mb-4">{t('estimator:results.content.your-estimate.married-common-law.intro')}</p>
                <ul className="list-disc space-y-1 pl-7">
                  <li>
                    <Trans
                      ns={handle.i18nNamespace}
                      i18nKey="estimator:results.content.your-estimate.married-common-law.non-cdb-partner-result"
                      values={{ result: loaderData.formattedResults.results.estimation }}
                    />
                  </li>
                  <li>
                    <Trans
                      ns={handle.i18nNamespace}
                      i18nKey="estimator:results.content.your-estimate.married-common-law.cdb-partner-result"
                      values={{ result: loaderData.formattedResults.results.estimationSplitBenefit }}
                    />
                  </li>
                </ul>
              </>
            )}

            <h2 className="font-lato mb-4 text-lg font-bold">{t('estimator:results.content.next-steps.header')}</h2>

            <div className="my-6 space-y-6 rounded border border-[#6F6F6F] px-8 py-6">
              <div>
                <ButtonLink
                  data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Apply button')}
                  to="http://canada.ca"
                  variant="primary"
                  startIcon={faExternalLink}
                  size="xl"
                >
                  {t('estimator:results.content.next-steps.apply-cdb')}
                </ButtonLink>
              </div>

              <div>
                <ButtonLink
                  data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Learn more button')}
                  to={t('estimator:results.content.next-steps.learn-more-href')}
                  variant="alternative"
                  startIcon={faExternalLink}
                  size="xl"
                >
                  {t('estimator:results.content.next-steps.learn-more')}
                </ButtonLink>
              </div>
            </div>
          </section>
          <section className="col-span-1 row-span-2 space-y-4">{DataSummary(loaderData.formattedResults)}</section>
        </div>
      </div>
    </div>
  );
}

function DataSummary(formattedResults: FormattedCDBEstimator) {
  const { t } = useTranslation(handle.i18nNamespace);
  return (
    <div className="my-8 rounded bg-stone-100 p-5 md:mt-0 md:max-w-[360px]">
      <h3 className="font-lato text-xl font-bold">{t('estimator:results.form-data-summary.title')}</h3>
      <div>
        <DataSummaryItem
          title={t('estimator:results.form-data-summary.field-labels.marital-status')}
          editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.marital-status')}
          editRoute={'routes/estimator/step-marital-status.tsx'}
          value={formattedResults.maritalStatus}
          showBorder={false}
          data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit marital status button')}
        />
        <DataSummaryItem
          title={t('estimator:results.form-data-summary.field-labels.net-income')}
          editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.net-income')}
          editRoute={'routes/estimator/step-income.tsx'}
          value={formattedResults.income.netIncome}
          showBorder={true}
          data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit net-income button')}
        />
        <DataSummaryItem
          title={t('estimator:results.form-data-summary.field-labels.working-income')}
          editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.working-income')}
          editRoute={'routes/estimator/step-income.tsx'}
          value={formattedResults.income.workingIncome}
          showBorder={true}
          data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit working-income button')}
        />

        <DataSummaryItem
          title={t('estimator:results.form-data-summary.field-labels.uccb-rdsp-income')}
          editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.uccb-rdsp-income')}
          editRoute={'routes/estimator/step-income.tsx'}
          value={formattedResults.income.claimedIncome ?? '-'}
          showBorder={true}
          data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit claimed-income button')}
        />

        <DataSummaryItem
          title={t('estimator:results.form-data-summary.field-labels.uccb-rdsp-repayment')}
          editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.uccb-rdsp-repayment')}
          editRoute={'routes/estimator/step-income.tsx'}
          value={formattedResults.income.claimedRepayment ?? '-'}
          showBorder={true}
          data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit claimed-repayment button')}
        />

        {formattedResults.income.kind === 'married' && (
          <>
            <DataSummaryItem
              title={t('estimator:results.form-data-summary.field-labels.partner-net-income')}
              editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.partner-net-income')}
              editRoute={'routes/estimator/step-income.tsx'}
              value={formattedResults.income.partner.netIncome}
              showBorder={true}
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit partner-net-income button')}
            />

            <DataSummaryItem
              title={t('estimator:results.form-data-summary.field-labels.partner-working-income')}
              editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.partner-working-income')}
              editRoute={'routes/estimator/step-income.tsx'}
              value={formattedResults.income.partner.workingIncome}
              showBorder={true}
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit partner-working-income button')}
            />

            <DataSummaryItem
              title={t('estimator:results.form-data-summary.field-labels.partner-uccb-rdsp-income')}
              editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.partner-uccb-rdsp-income')}
              editRoute={'routes/estimator/step-income.tsx'}
              value={formattedResults.income.partner.claimedIncome ?? '-'}
              showBorder={true}
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit partner-claimed-income button')}
            />

            <DataSummaryItem
              title={t('estimator:results.form-data-summary.field-labels.partner-uccb-rdsp-repayment')}
              editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.partner-uccb-rdsp-repayment')}
              editRoute={'routes/estimator/step-income.tsx'}
              value={formattedResults.income.partner.claimedRepayment ?? '-'}
              showBorder={true}
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit partner-claimed-repayment button')}
            />
          </>
        )}
      </div>
    </div>
  );
}
interface DataSummaryItemProps {
  title: string;
  editAriaLabel: string;
  editRoute: I18nRouteFile;
  value: string;
  showBorder: boolean;
}
function DataSummaryItem({ title, editAriaLabel, editRoute, value, showBorder, ...rest }: DataSummaryItemProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className={cn('py-4', showBorder ? 'border-t border-stone-600' : '')}>
      <div>{title}</div>
      <div className="grid grid-cols-3 gap-0">
        <div className="col-span-2">
          <strong>{value}</strong>
        </div>
        <div className="self-end justify-self-end">
          <InlineLink {...rest} file={editRoute} aria-label={editAriaLabel}>
            {t('common:edit')}
          </InlineLink>
        </div>
      </div>
    </div>
  );
}
