import { useId } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Info, Route } from './+types/step-income';
import type { MarriedIncome, MarriedIncomeForm, SingleIncome, SingleIncomeForm } from './@types';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { Collapsible } from '~/components/collapsible';
import { FetcherErrorSummary } from '~/components/error-summary';
import { InputField } from '~/components/input-field';
import { PageTitle } from '~/components/page-title';
import { useErrorTranslation } from '~/hooks/use-error-translation';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/estimator/layout';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';
import { getPreviousTaxYear } from '~/utils/date-utils';
import { estimatorStepGate } from '~/utils/state-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:income.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  estimatorStepGate(context.session.estimator, 'routes/estimator/step-income.tsx', request);
  const { t } = await getTranslation(request, handle.i18nNamespace);

  return {
    documentTitle: t('estimator:income.page-title'),
    defaultFormValues: context.session.estimator?.income,
    isMarried: context.session.estimator?.maritalStatus === 'married-or-common-law',
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
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

      throw i18nRedirect('routes/estimator/results.tsx', request);
    }
  }
}

function processIncome(formData: FormData, isMarried: boolean) {
  const positiveDecimal = new RegExp(/^\d*(\.\d\d?)?$/);
  // Base schema for PersonIncome fields
  const personIncomeSchema = v.object({
    netIncome: v.pipe(
      v.string('net-income.error.required'),
      v.nonEmpty('net-income.error.required'),
      v.regex(positiveDecimal, 'net-income.error.invalid'),
      v.transform(Number),
      v.number('net-income.error.invalid'),
      v.minValue(0, 'net-income.error.invalid'),
    ),
    workingIncome: v.pipe(
      v.string('working-income.error.required'),
      v.nonEmpty('working-income.error.required'),
      v.regex(positiveDecimal, 'working-income.error.invalid'),
      v.transform(Number),
      v.number('working-income.error.invalid'),
      v.minValue(0, 'working-income.error.invalid'),
    ),
    claimedIncome: v.pipe(
      v.optional(v.string(), '0'),
      v.regex(positiveDecimal, 'claimed-income.error.invalid'),
      v.transform(Number),
      v.number('claimed-income.error.invalid'),
      v.minValue(0, 'claimed-income.error.invalid'),
    ),
    claimedRepayment: v.pipe(
      v.optional(v.string(), '0'),
      v.regex(positiveDecimal, 'claimed-repayment.error.invalid'),
      v.transform(Number),
      v.number('claimed-repayment.error.invalid'),
      v.minValue(0, 'claimed-repayment.error.invalid'),
    ),
  });

  // Combined schema with variants for single and married
  const incomeFormSchema = v.variant('kind', [
    // SingleIncomeForm
    v.object({
      kind: v.literal('single'),
      ...personIncomeSchema.entries,
    }),
    // MarriedIncomeForm
    v.object({
      kind: v.literal('married'),
      ...personIncomeSchema.entries,
      partner: personIncomeSchema,
    }),
  ]) satisfies v.GenericSchema<SingleIncomeForm | MarriedIncomeForm, SingleIncome | MarriedIncome>;

  const input = {
    kind: isMarried ? 'married' : 'single',
    netIncome: formData.get('net-income') as string,
    workingIncome: formData.get('working-income') as string,
    claimedIncome: formData.get('claimed-income') as string,
    claimedRepayment: formData.get('claimed-repayment') as string,
    partner: isMarried
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
  const fetcher = useFetcher<Info['actionData']>({ key: fetcherKey });
  const errors = fetcher.data?.errors;
  const isMarried = loaderData.isMarried;
  const previousIncomeTaxReturnYear = getPreviousTaxYear().toString();

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('common:app.title')}>{t('estimator:income.page-title')}</PageTitle>
      <FetcherErrorSummary fetcherKey={fetcherKey}>
        <fetcher.Form method="post" noValidate>
          <div className="space-y-6">
            <h2>
              {isMarried
                ? t('estimator:income.form-instructions.married', { year: previousIncomeTaxReturnYear })
                : t('estimator:income.form-instructions.single', { year: previousIncomeTaxReturnYear })}
            </h2>
            <InputField
              name="net-income"
              label={t('estimator:income.fields.net-income.label')}
              required
              maxLength={15}
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <div className="my-4 space-y-4">
                  <Collapsible summary={<>{t('estimator:income.fields.net-income.info-label')}</>}>
                    <div className="space-y-4">
                      <p>
                        <Trans i18nKey={'estimator:income.info.net-income'} />
                      </p>
                    </div>
                  </Collapsible>
                </div>
              }
              defaultValue={loaderData.defaultFormValues?.netIncome}
              errorMessage={errT(errors?.nested?.netIncome?.at(0))}
              autoComplete="off"
            />
            {isMarried && (
              <InputField
                name="partner-net-income"
                label={t('estimator:income.fields.partner.net-income.label')}
                required
                maxLength={15}
                helpMessagePrimaryClassName="-max-w-prose text-black"
                helpMessagePrimary={
                  <div className="my-4 space-y-4">
                    <Collapsible summary={<>{t('estimator:income.fields.partner.net-income.info-label')}</>}>
                      <div className="space-y-4">
                        <p>
                          <Trans i18nKey={'estimator:income.info.partner-net-income'} />
                        </p>
                      </div>
                    </Collapsible>
                  </div>
                }
                defaultValue={
                  loaderData.defaultFormValues?.kind === 'married' ? loaderData.defaultFormValues.partner.netIncome : undefined
                }
                errorMessage={errT(`partner.${errors?.nested?.['partner.netIncome']?.at(0)}`)}
                autoComplete="off"
              />
            )}
            <InputField
              name="working-income"
              label={t('estimator:income.fields.working-income.label')}
              required
              maxLength={15}
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <div className="my-4 space-y-4">
                  <Collapsible summary={<>{t('estimator:income.fields.working-income.info-label')}</>}>
                    <div className="space-y-4">
                      <p>
                        <Trans i18nKey={'estimator:income.info.working-income.text1'} />
                      </p>
                      <ul className="list-disc space-y-2 pl-5">
                        {(t('estimator:income.info.working-income.items', { returnObjects: true }) as string[]).map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          ),
                        )}
                      </ul>
                      <p>
                        <Trans i18nKey={'estimator:income.info.working-income.text2'} />
                      </p>
                    </div>
                  </Collapsible>
                </div>
              }
              defaultValue={loaderData.defaultFormValues?.workingIncome}
              errorMessage={errT(errors?.nested?.workingIncome?.at(0))}
              autoComplete="off"
            />
            {isMarried && (
              <InputField
                name="partner-working-income"
                label={t('estimator:income.fields.partner.working-income.label')}
                required
                maxLength={15}
                helpMessagePrimaryClassName="-max-w-prose text-black"
                helpMessagePrimary={
                  <div className="my-4 space-y-4">
                    <Collapsible summary={<>{t('estimator:income.fields.partner.working-income.info-label')}</>}>
                      <div className="space-y-4">
                        <p>
                          <Trans i18nKey={'estimator:income.info.working-income.text1'} />
                          <ul className="list-disc space-y-2 pl-5">
                            {(t('estimator:income.info.working-income.items', { returnObjects: true }) as string[]).map(
                              (item, index) => (
                                <li key={index}>{item}</li>
                              ),
                            )}
                          </ul>
                        </p>
                        <p>
                          <Trans i18nKey={'estimator:income.info.working-income.text2'} />
                        </p>
                      </div>
                    </Collapsible>
                  </div>
                }
                defaultValue={
                  loaderData.defaultFormValues?.kind === 'married'
                    ? loaderData.defaultFormValues.partner.workingIncome
                    : undefined
                }
                errorMessage={errT(`partner.${errors?.nested?.['partner.workingIncome']?.at(0)}`)}
                autoComplete="off"
              />
            )}
            <InputField
              name="claimed-income"
              label={t('estimator:income.fields.claimed-income.label')}
              maxLength={15}
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <div className="my-4 space-y-4">
                  <Collapsible summary={<>{t('estimator:income.fields.claimed-income.info-label')}</>}>
                    <div className="space-y-4">
                      <p>
                        <Trans i18nKey={'estimator:income.info.UCCB'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:income.info.RDSP'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:income.info.CDB'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:income.info.claimed-income'} />
                      </p>
                    </div>
                  </Collapsible>
                </div>
              }
              defaultValue={loaderData.defaultFormValues?.claimedIncome}
              errorMessage={errT(errors?.nested?.claimedIncome?.at(0))}
              autoComplete="off"
            />
            <InputField
              name="claimed-repayment"
              label={t('estimator:income.fields.claimed-repayment.label')}
              maxLength={15}
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <div className="my-4 space-y-4">
                  <Collapsible summary={<>{t('estimator:income.fields.claimed-repayment.info-label')}</>}>
                    <div className="space-y-4">
                      <p>
                        <Trans i18nKey={'estimator:income.info.UCCB'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:income.info.RDSP'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:income.info.CDB'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:income.info.claimed-repayment'} />
                      </p>
                    </div>
                  </Collapsible>
                </div>
              }
              defaultValue={loaderData.defaultFormValues?.claimedRepayment}
              errorMessage={errT(errors?.nested?.claimedRepayment?.at(0))}
              autoComplete="off"
            />
            {isMarried && (
              <InputField
                name="partner-claimed-income"
                label={t('estimator:income.fields.partner.claimed-income.label')}
                maxLength={15}
                helpMessagePrimaryClassName="-max-w-prose text-black"
                helpMessagePrimary={
                  <div className="my-4 space-y-4">
                    <Collapsible summary={<>{t('estimator:income.fields.partner.claimed-income.info-label')}</>}>
                      <div className="space-y-4">
                        <p>
                          <Trans i18nKey={'estimator:income.info.UCCB'} />
                        </p>
                        <p>
                          <Trans i18nKey={'estimator:income.info.RDSP'} />
                        </p>
                        <p>
                          <Trans i18nKey={'estimator:income.info.CDB'} />
                        </p>
                        <p>
                          <Trans i18nKey={'estimator:income.info.partner-claimed-income'} />
                        </p>
                      </div>
                    </Collapsible>
                  </div>
                }
                defaultValue={
                  loaderData.defaultFormValues?.kind === 'married'
                    ? loaderData.defaultFormValues.partner.claimedIncome
                    : undefined
                }
                errorMessage={errT(`partner.${errors?.nested?.['partner.claimedIncome']?.at(0)}`)}
                autoComplete="off"
              />
            )}
            {isMarried && (
              <InputField
                name="partner-claimed-repayment"
                label={t('estimator:income.fields.partner.claimed-repayment.label')}
                maxLength={15}
                helpMessagePrimaryClassName="-max-w-prose text-black"
                helpMessagePrimary={
                  <div className="my-4 space-y-4">
                    <Collapsible summary={<>{t('estimator:income.fields.partner.claimed-repayment.info-label')}</>}>
                      <div className="space-y-4">
                        <p>
                          <Trans i18nKey={'estimator:income.info.UCCB'} />
                        </p>
                        <p>
                          <Trans i18nKey={'estimator:income.info.RDSP'} />
                        </p>
                        <p>
                          <Trans i18nKey={'estimator:income.info.CDB'} />
                        </p>
                        <p>
                          <Trans i18nKey={'estimator:income.info.partner-claimed-repayment'} />
                        </p>
                      </div>
                    </Collapsible>
                  </div>
                }
                defaultValue={
                  loaderData.defaultFormValues?.kind === 'married'
                    ? loaderData.defaultFormValues.partner.claimedRepayment
                    : undefined
                }
                errorMessage={errT(`partner.${errors?.nested?.['partner.claimedRepayment']?.at(0)}`)}
                autoComplete="off"
              />
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
              {t('common:next')}
            </Button>
            <Button
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('StepIncome:Previous button')}
              name="action"
              value="back"
              id="back-button"
              size="lg"
            >
              {t('common:previous')}
            </Button>
          </div>
        </fetcher.Form>
      </FetcherErrorSummary>
    </div>
  );
}
