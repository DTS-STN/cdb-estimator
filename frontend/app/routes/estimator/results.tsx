import { data } from 'react-router';
import type { RouteHandle } from 'react-router';

import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import { calculateEstimation, calculateTotalIncome } from '../../utils/cdb-calculator';
import type { Route } from './+types/results';
import type {
  CDBEstimator,
  FormattedCDBEstimator,
  FormattedMarriedIncome,
  FormattedMarriedResults,
  FormattedSingleIncome,
  FormattedSingleResults,
} from './@types';
import { validMaritalStatuses } from './types';

import { ButtonLink } from '~/components/button-link';
import { ContextualAlert } from '~/components/contextual-alert';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import type { I18nRouteFile } from '~/i18n-routes';
import { handle as parentHandle } from '~/routes/estimator/layout';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';
import { formatCurrency } from '~/utils/currency-utils';
import { mergeMeta } from '~/utils/meta-utils';
import { getTitleMetaTags } from '~/utils/seo-utils';
import { estimatorStepGate } from '~/utils/state-utils';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:results.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export const meta: Route.MetaFunction = mergeMeta(({ data }) => {
  return getTitleMetaTags(data.meta.title);
});

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
          individualIncome: formattedPersonIncomeSchema,
        }),
        v.object({
          kind: v.literal('married'),
          individualIncome: formattedPersonIncomeSchema,
          partnerIncome: formattedPersonIncomeSchema,
        }),
      ]),
    }),
    v.transform((input) => {
      return {
        maritalStatus: t(`estimator:results.form-data-summary.enum-display.marital-status.${input.maritalStatus}`),
        income: {
          kind: input.income.kind,
          individualIncome: { totalIncome: formatCurrency(calculateTotalIncome(input.income.individualIncome), lang) },
          partnerIncome:
            input.income.kind === 'married'
              ? {
                  totalIncome: formatCurrency(calculateTotalIncome(input.income.partnerIncome), lang),
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

  const meta = { title: t('common:meta.title.template', { title: t('estimator:results.page-title') }) };

  return {
    meta,
    results: context.session.estimator as CDBEstimator,
    formattedResults: parsedResults.output,
  };
}

export async function action({ context, request }: Route.ActionArgs) {}

export default function Results({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t, i18n } = useTranslation(handle.i18nNamespace);
  const {
    ESTIMATOR_CDB_CONTACT_URL_EN,
    ESTIMATOR_CDB_CONTACT_URL_FR,
    ESTIMATOR_CDB_APPLY_URL_EN,
    ESTIMATOR_CDB_APPLY_URL_FR,
    ESTIMATOR_CDB_URL_EN,
    ESTIMATOR_CDB_URL_FR,
  } = globalThis.__appEnvironment;

  const cdbContactLink = (
    <InlineLink
      to={i18n.language === 'fr' ? (ESTIMATOR_CDB_CONTACT_URL_FR ?? '') : (ESTIMATOR_CDB_CONTACT_URL_EN ?? '')}
      className="external-link"
      target="_blank"
    />
  );

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('common:app.title')}>{t('estimator:results.page-title')}</PageTitle>

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

            <p>
              <Trans ns={handle.i18nNamespace} i18nKey="estimator:results.content.your-estimate.note" />

              {i18n.language === 'fr' && ESTIMATOR_CDB_CONTACT_URL_FR && (
                <Trans
                  ns={handle.i18nNamespace}
                  i18nKey="estimator:results.content.your-estimate.contact"
                  components={{ cdbContactLink }}
                />
              )}

              {i18n.language === 'en' && ESTIMATOR_CDB_CONTACT_URL_EN && (
                <Trans
                  ns={handle.i18nNamespace}
                  i18nKey="estimator:results.content.your-estimate.contact"
                  components={{ cdbContactLink }}
                />
              )}
            </p>

            <h2 className="font-lato mb-4 text-lg font-bold">{t('estimator:results.content.next-steps.header')}</h2>

            <div className="my-6 space-y-6 rounded border border-[#6F6F6F] px-8 py-6">
              <div>
                <ButtonLink
                  target="_blank"
                  data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Apply button')}
                  to={i18n.language === 'fr' ? ESTIMATOR_CDB_APPLY_URL_FR : ESTIMATOR_CDB_APPLY_URL_EN}
                  variant="primary"
                  startIcon={faExternalLink}
                  size="xl"
                >
                  {t('estimator:results.content.next-steps.apply-cdb')}
                </ButtonLink>
              </div>

              <div>
                <ButtonLink
                  target="_blank"
                  data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Learn more button')}
                  to={i18n.language === 'fr' ? ESTIMATOR_CDB_URL_FR : ESTIMATOR_CDB_URL_EN}
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
          className=""
          title={t('estimator:results.form-data-summary.field-labels.marital-status')}
          editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.marital-status')}
          editRoute={'routes/estimator/step-marital-status.tsx'}
          value={formattedResults.maritalStatus}
          showBorder={false}
          showEditButton={true}
          data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit marital status button')}
        />
        <DataSummaryItem
          className="pb-2"
          title={t('estimator:results.form-data-summary.field-labels.total-income')}
          editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.income')}
          editRoute={'routes/estimator/step-income.tsx'}
          value={formattedResults.income.individualIncome.totalIncome}
          showBorder={true}
          showEditButton={formattedResults.income.kind !== 'married'}
          data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit income button')}
        />

        {formattedResults.income.kind === 'married' && (
          <DataSummaryItem
            className="pt-0"
            title={t('estimator:results.form-data-summary.field-labels.partner-total-income')}
            editAriaLabel={t('estimator:results.form-data-summary.edit-aria-labels.income')}
            editRoute={'routes/estimator/step-income.tsx'}
            value={formattedResults.income.partnerIncome.totalIncome}
            showBorder={false}
            showEditButton={true}
            data-gc-analytics-customclick={adobeAnalytics.getCustomClick('Results:Edit income button')}
          />
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
  showEditButton: boolean;
  showBorder: boolean;
  className: string;
}
function DataSummaryItem({
  title,
  editAriaLabel,
  editRoute,
  value,
  showBorder,
  showEditButton,
  className,
  ...rest
}: DataSummaryItemProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className={cn('py-4', className, showBorder ? 'border-t border-stone-600' : '')}>
      <div>{title}</div>
      <div className="grid grid-cols-3 gap-0">
        <div className="col-span-2">
          <strong>{value}</strong>
        </div>

        {showEditButton && (
          <div className="self-end justify-self-end">
            <InlineLink {...rest} file={editRoute} aria-label={editAriaLabel}>
              {t('common:edit')}
            </InlineLink>
          </div>
        )}
      </div>
    </div>
  );
}
