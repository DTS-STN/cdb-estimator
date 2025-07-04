import { useId, useMemo } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/step-income';
import type { MarriedIncome, MarriedIncomeForm, SingleIncome, SingleIncomeForm } from './@types';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { Collapsible } from '~/components/collapsible';
import { CurrencyField } from '~/components/currency-field';
import { FetcherErrorSummary } from '~/components/error-summary';
import { PageTitle } from '~/components/page-title';
import { useErrorTranslation } from '~/hooks/use-error-translation';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/estimator/layout';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';
import { mergeMeta } from '~/utils/meta-utils';
import { getTitleMetaTags } from '~/utils/seo-utils';
import { estimatorStepGate, storeFormFieldValues } from '~/utils/state-utils';
import { removeNumericFormatting } from '~/utils/string-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:income.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export const meta: Route.MetaFunction = mergeMeta(({ data }) => {
  if (!data) {
    return [];
  }
  return getTitleMetaTags(data.meta.title);
});

export async function loader({ context, params, request }: Route.LoaderArgs) {
  estimatorStepGate(context.session.estimator, 'routes/estimator/step-income.tsx', request);
  const { t } = await getTranslation(request, handle.i18nNamespace);

  const meta = { title: t('common:meta.title.template', { title: t('estimator:income.page-title') }) };

  return {
    meta,
    formValues: context.session.estimator?.income,
    previousFormValues: context.session.formFieldValues ?? [],
    isMarried: context.session.estimator?.maritalStatus === 'married-or-common-law',
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');
  const isMarried = context.session.estimator?.maritalStatus === 'married-or-common-law';

  switch (action) {
    case 'back': {
      throw i18nRedirect('routes/estimator/step-marital-status.tsx', request);
    }
    case 'next': {
      const result = processIncome(formData, isMarried);

      if (result.errors) {
        return data({ errors: result.errors }, { status: 400 });
      }

      (context.session.estimator ??= {}).income = result.output;
      storeFormFieldValues(context.session, 'income', formData);
      throw i18nRedirect('routes/estimator/results.tsx', request);
    }
  }
}

function processIncome(formData: FormData, isMarried: boolean) {
  const positiveDecimal = new RegExp(/^\d*(\.\d\d?)?$/);

  const personIncomeSchema = v.pipe(
    v.object({
      netIncome: v.pipe(
        v.string('net-income.error.required'),
        v.nonEmpty('net-income.error.required'),
        v.transform((input) => removeNumericFormatting(input) ?? ''),
        v.regex(positiveDecimal, 'net-income.error.invalid'),
        v.transform(Number),
        v.number('net-income.error.invalid'),
        v.minValue(0, 'net-income.error.invalid'),
      ),
      workingIncome: v.pipe(
        v.string('working-income.error.required'),
        v.nonEmpty('working-income.error.required'),
        v.transform((input) => removeNumericFormatting(input) ?? ''),
        v.regex(positiveDecimal, 'working-income.error.invalid'),
        v.transform(Number),
        v.number('working-income.error.invalid'),
        v.minValue(0, 'working-income.error.invalid'),
      ),
      claimedIncome: v.pipe(
        v.string('claimed-income.error.required'),
        v.nonEmpty('claimed-income.error.required'),
        v.transform((input) => removeNumericFormatting(input) ?? ''),
        v.regex(positiveDecimal, 'claimed-income.error.invalid'),
        v.transform(Number),
        v.number('claimed-income.error.invalid'),
        v.minValue(0, 'claimed-income.error.invalid'),
      ),
      claimedRepayment: v.pipe(
        v.string('claimed-repayment.error.required'),
        v.nonEmpty('claimed-repayment.error.required'),
        v.transform((input) => removeNumericFormatting(input) ?? ''),
        v.regex(positiveDecimal, 'claimed-repayment.error.invalid'),
        v.transform(Number),
        v.number('claimed-repayment.error.invalid'),
        v.minValue(0, 'claimed-repayment.error.invalid'),
      ),
    }),
  );

  // Combined schema with variants for single and married
  const incomeFormSchema = v.variant('kind', [
    // SingleIncomeForm
    v.object({
      kind: v.literal('single'),
      individualIncome: personIncomeSchema,
    }),

    // MarriedIncomeForm
    v.object({
      kind: v.literal('married'),
      individualIncome: personIncomeSchema,
      partnerIncome: personIncomeSchema,
    }),
  ]) satisfies v.GenericSchema<SingleIncomeForm | MarriedIncomeForm, SingleIncome | MarriedIncome>;

  const input = {
    kind: isMarried ? 'married' : 'single',
    individualIncome: {
      netIncome: formData.get('individual-net-income') as string,
      workingIncome: formData.get('individual-working-income') as string,
      claimedIncome: formData.get('individual-claimed-income') as string,
      claimedRepayment: formData.get('individual-claimed-repayment') as string,
    },
    partnerIncome: isMarried
      ? {
          netIncome: formData.get('partner-net-income') as string,
          workingIncome: formData.get('partner-working-income') as string,
          claimedIncome: formData.get('partner-claimed-income') as string,
          claimedRepayment: formData.get('partner-claimed-repayment') as string,
        }
      : undefined,
  } satisfies Partial<MarriedIncomeForm | SingleIncomeForm>;

  const parseResult = v.safeParse(incomeFormSchema, input);
  if (!parseResult.success) {
    return { errors: v.flatten<typeof incomeFormSchema>(parseResult.issues) };
  }
  return { output: parseResult.output };
}

export default function StepIncome({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errT = useErrorTranslation('estimator', 'income.fields');
  const fetcherKey = useId();
  const fetcher = useFetcher<typeof action>({ key: fetcherKey });
  const errors = fetcher.data?.errors;
  const isMarried = loaderData.isMarried;

  //convert previous form values array to map
  const previousFormValues = useMemo(
    () => new Map<string, string | undefined>(loaderData.previousFormValues),
    [loaderData.previousFormValues],
  );

  const { ESTIMATOR_INCOME_TAX_SLIP_YEAR } = globalThis.__appEnvironment;

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('common:app.title')}>{t('estimator:income.page-title')}</PageTitle>
      <FetcherErrorSummary fetcherKey={fetcherKey}>
        <fetcher.Form method="post" noValidate>
          <div className="space-y-6">
            <p>
              {isMarried ? (
                <Trans
                  i18nKey={'estimator:income.form-instructions.married'}
                  values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }}
                />
              ) : (
                <Trans
                  i18nKey={'estimator:income.form-instructions.single'}
                  values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }}
                />
              )}
            </p>
            <p>{t('estimator:income.form-instructions.note')}</p>
            <p>{t('common:form-instructions.all-required')}</p>
            {loaderData.isMarried && (
              <h2 className="font-lato mb-4 text-2xl font-bold">{t('estimator:income.heading.your-info')}</h2>
            )}
            <CurrencyField
              name="individual-net-income"
              label={t('estimator:income.fields.net-income.label')}
              required
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <p>
                  <Trans i18nKey={'estimator:income.info.net-income'} values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }} />
                </p>
              }
              defaultValue={
                loaderData.formValues?.individualIncome.netIncome ?? previousFormValues.get('income:individual-net-income')
              }
              errorMessage={
                errors?.nested?.['individualIncome.netIncome']?.at(0) ? (
                  <Trans>{errT(errors.nested['individualIncome.netIncome'].at(0))}</Trans>
                ) : undefined
              }
              autoComplete="off"
            />

            <CurrencyField
              name="individual-working-income"
              label={t('estimator:income.fields.working-income.label')}
              required
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <>
                  <p>
                    <Trans i18nKey={'estimator:income.info.working-income.description'} />
                  </p>
                  <div className="my-4 space-y-4">
                    <Collapsible
                      summary={<>{t('estimator:income.fields.working-income.info-label')}</>}
                      data-gc-analytics-expand={`Expand-collapse working income`}
                    >
                      <div className="space-y-4">
                        <p>
                          <Trans
                            i18nKey={'estimator:income.info.working-income.text1'}
                            values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }}
                          />
                        </p>
                        <ul className="list-disc space-y-2 pl-5">
                          {(t('estimator:income.info.working-income.items', { returnObjects: true }) as string[]).map(
                            (item, index) => (
                              <li key={index}>{item}</li>
                            ),
                          )}
                        </ul>
                      </div>
                    </Collapsible>
                  </div>
                </>
              }
              defaultValue={
                loaderData.formValues?.individualIncome.workingIncome ??
                previousFormValues.get('income:individual-working-income')
              }
              errorMessage={
                errors?.nested?.['individualIncome.workingIncome']?.at(0) ? (
                  <Trans>{errT(errors.nested['individualIncome.workingIncome'].at(0))}</Trans>
                ) : undefined
              }
              autoComplete="off"
            />

            <CurrencyField
              name="individual-claimed-income"
              label={<Trans i18nKey={'estimator:income.fields.claimed-income.label'} />}
              required
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <p>
                  <Trans i18nKey={'estimator:income.info.claimed-income'} values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }} />
                </p>
              }
              defaultValue={
                loaderData.formValues?.individualIncome.claimedIncome ??
                previousFormValues.get('income:individual-claimed-income')
              }
              errorMessage={
                errors?.nested?.['individualIncome.claimedIncome']?.at(0) ? (
                  <Trans>{errT(errors.nested['individualIncome.claimedIncome'].at(0))}</Trans>
                ) : undefined
              }
              autoComplete="off"
            />
            <CurrencyField
              name="individual-claimed-repayment"
              label={<Trans i18nKey={'estimator:income.fields.claimed-repayment.label'} />}
              required
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <p>
                  <Trans
                    i18nKey={'estimator:income.info.claimed-repayment'}
                    values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }}
                  />
                </p>
              }
              defaultValue={
                loaderData.formValues?.individualIncome.claimedRepayment ??
                previousFormValues.get('income:individual-claimed-repayment')
              }
              errorMessage={
                errors?.nested?.['individualIncome.claimedRepayment']?.at(0) ? (
                  <Trans>{errT(errors.nested['individualIncome.claimedRepayment'].at(0))}</Trans>
                ) : undefined
              }
              autoComplete="off"
            />

            {isMarried && (
              <>
                <h2 className="font-lato mb-4 text-2xl font-bold">{t('estimator:income.heading.partner-info')}</h2>
                <CurrencyField
                  name="partner-net-income"
                  label={t('estimator:income.fields.partner.net-income.label')}
                  required
                  helpMessagePrimaryClassName="-max-w-prose text-black"
                  helpMessagePrimary={
                    <p>
                      <Trans
                        i18nKey={'estimator:income.info.partner-net-income'}
                        values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }}
                      />
                    </p>
                  }
                  defaultValue={
                    (loaderData.formValues?.kind === 'married' ? loaderData.formValues.partnerIncome.netIncome : undefined) ??
                    previousFormValues.get('income:partner-net-income')
                  }
                  errorMessage={
                    errors?.nested?.['partnerIncome.netIncome']?.at(0) ? (
                      <Trans>{errT(`partner.${errors.nested['partnerIncome.netIncome'].at(0)}`)}</Trans>
                    ) : undefined
                  }
                  autoComplete="off"
                />

                <CurrencyField
                  name="partner-working-income"
                  label={t('estimator:income.fields.partner.working-income.label')}
                  required
                  helpMessagePrimaryClassName="-max-w-prose text-black"
                  helpMessagePrimary={
                    <>
                      <p>
                        <Trans i18nKey={'estimator:income.info.partner-working-income.description'} />
                      </p>
                      <div className="my-4 space-y-4">
                        <Collapsible
                          summary={<>{t('estimator:income.fields.partner.working-income.info-label')}</>}
                          data-gc-analytics-expand={`Expand-collapse partner working income`}
                        >
                          <div className="space-y-4">
                            <p>
                              <Trans
                                i18nKey={'estimator:income.info.partner-working-income.text1'}
                                values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }}
                              />
                            </p>
                            <ul className="list-disc space-y-2 pl-5">
                              {(t('estimator:income.info.working-income.items', { returnObjects: true }) as string[]).map(
                                (item, index) => (
                                  <li key={index}>{item}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        </Collapsible>
                      </div>
                    </>
                  }
                  defaultValue={
                    (loaderData.formValues?.kind === 'married'
                      ? loaderData.formValues.partnerIncome.workingIncome
                      : undefined) ?? previousFormValues.get('income:partner-working-income')
                  }
                  errorMessage={
                    errors?.nested?.['partnerIncome.workingIncome']?.at(0) ? (
                      <Trans>{errT(`partner.${errors.nested['partnerIncome.workingIncome'].at(0)}`)}</Trans>
                    ) : undefined
                  }
                  autoComplete="off"
                />

                <CurrencyField
                  name="partner-claimed-income"
                  label={<Trans i18nKey={'estimator:income.fields.partner.claimed-income.label'} />}
                  required
                  helpMessagePrimaryClassName="-max-w-prose text-black"
                  helpMessagePrimary={
                    <p>
                      <Trans
                        i18nKey={'estimator:income.info.partner-claimed-income'}
                        values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }}
                      />
                    </p>
                  }
                  defaultValue={
                    (loaderData.formValues?.kind === 'married'
                      ? loaderData.formValues.partnerIncome.claimedIncome
                      : undefined) ?? previousFormValues.get('income:partner-claimed-income')
                  }
                  errorMessage={
                    errors?.nested?.['partnerIncome.claimedIncome']?.at(0) ? (
                      <Trans>{errT(`partner.${errors.nested['partnerIncome.claimedIncome'].at(0)}`)}</Trans>
                    ) : undefined
                  }
                  autoComplete="off"
                />

                <CurrencyField
                  name="partner-claimed-repayment"
                  label={<Trans i18nKey={'estimator:income.fields.partner.claimed-repayment.label'} />}
                  required
                  helpMessagePrimaryClassName="-max-w-prose text-black"
                  helpMessagePrimary={
                    <p>
                      <Trans
                        i18nKey={'estimator:income.info.partner-claimed-repayment'}
                        values={{ year: ESTIMATOR_INCOME_TAX_SLIP_YEAR }}
                      />
                    </p>
                  }
                  defaultValue={
                    (loaderData.formValues?.kind === 'married'
                      ? loaderData.formValues.partnerIncome.claimedRepayment
                      : undefined) ?? previousFormValues.get('income:partner-claimed-repayment')
                  }
                  errorMessage={
                    errors?.nested?.['partnerIncome.claimedRepayment']?.at(0) ? (
                      <Trans>{errT(`partner.${errors.nested['partnerIncome.claimedRepayment'].at(0)}`)}</Trans>
                    ) : undefined
                  }
                  autoComplete="off"
                />
              </>
            )}
          </div>
          <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Button
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('StepIncome:Next button')}
              name="action"
              value="next"
              variant="primary"
              id="continue-button"
              size="lg"
            >
              {t('estimator:income.estimate-benefit')}
            </Button>
            <Button
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('StepIncome:Previous button')}
              name="action"
              value="back"
              id="back-button"
              size="lg"
            >
              {t('common:back')}
            </Button>
          </div>
        </fetcher.Form>
      </FetcherErrorSummary>
    </div>
  );
}
