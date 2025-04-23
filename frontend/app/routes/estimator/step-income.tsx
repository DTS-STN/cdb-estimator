import { useId, useMemo } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Info, Route } from './+types/step-income';
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
import { getPreviousTaxYear } from '~/utils/date-utils';
import { mergeMeta } from '~/utils/meta-utils';
import { getTitleMetaTags } from '~/utils/seo-utils';
import { estimatorStepGate, storeFormFieldValues } from '~/utils/state-utils';
import { removeNumericFormatting } from '~/utils/string-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:income.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export const meta: Route.MetaFunction = mergeMeta(({ data }) => {
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
  const { lang } = await getTranslation(request, handle.i18nNamespace);
  const formData = await request.formData();
  const action = formData.get('action');
  const isMarried = context.session.estimator?.maritalStatus === 'married-or-common-law';

  switch (action) {
    case 'back': {
      throw i18nRedirect('routes/estimator/step-marital-status.tsx', request);
    }
    case 'next': {
      const result = processIncome(formData, isMarried, lang);

      if (result.errors) {
        return data({ errors: result.errors }, { status: 400 });
      }

      (context.session.estimator ??= {}).income = result.output;
      storeFormFieldValues(context.session, 'income', formData);
      throw i18nRedirect('routes/estimator/results.tsx', request);
    }
  }
}

function processIncome(formData: FormData, isMarried: boolean, lang: Language) {
  const positiveDecimal = new RegExp(/^\d*(\.\d\d?)?$/);

  const personIncomeSchema = v.pipe(
    v.object({
      netIncome: v.pipe(
        v.string('net-income.error.required'),
        v.nonEmpty('net-income.error.required'),
        v.transform((input) => removeNumericFormatting(input, lang)),
        v.regex(positiveDecimal, 'net-income.error.invalid'),
        v.transform(Number),
        v.number('net-income.error.invalid'),
        v.minValue(0, 'net-income.error.invalid'),
      ),
      workingIncome: v.pipe(
        v.string('working-income.error.required'),
        v.nonEmpty('working-income.error.required'),
        v.transform((input) => removeNumericFormatting(input, lang)),
        v.regex(positiveDecimal, 'working-income.error.invalid'),
        v.transform(Number),
        v.number('working-income.error.invalid'),
        v.minValue(0, 'working-income.error.invalid'),
      ),
      claimedIncome: v.pipe(
        v.optional(v.string(), '0'),
        v.transform((input) => removeNumericFormatting(input, lang)),
        v.regex(positiveDecimal, 'claimed-income.error.invalid'),
        v.transform(Number),
        v.number('claimed-income.error.invalid'),
        v.minValue(0, 'claimed-income.error.invalid'),
      ),
      claimedRepayment: v.pipe(
        v.optional(v.string(), '0'),
        v.transform((input) => removeNumericFormatting(input, lang)),
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
  const fetcher = useFetcher<Info['actionData']>({ key: fetcherKey });
  const errors = fetcher.data?.errors;
  const isMarried = loaderData.isMarried;
  const previousIncomeTaxReturnYear = getPreviousTaxYear().toString();

  //convert previous form values array to map
  const previousFormValues = useMemo(
    () => new Map<string, string | undefined>(loaderData.previousFormValues),
    [loaderData.previousFormValues],
  );

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
            <CurrencyField
              name="individual-net-income"
              label={t('estimator:income.fields.net-income.label')}
              required
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
              defaultValue={
                loaderData.formValues?.individualIncome.netIncome ?? previousFormValues.get('income:individual-net-income')
              }
              errorMessage={errT(errors?.nested?.['individualIncome.netIncome']?.at(0))}
              autoComplete="off"
            />
            {isMarried && (
              <CurrencyField
                name="partner-net-income"
                label={t('estimator:income.fields.partner.net-income.label')}
                required
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
                  (loaderData.formValues?.kind === 'married' ? loaderData.formValues.partnerIncome.netIncome : undefined) ??
                  previousFormValues.get('income:partner-net-income')
                }
                errorMessage={errT(`partner.${errors?.nested?.['partnerIncome.netIncome']?.at(0)}`)}
                autoComplete="off"
              />
            )}
            <CurrencyField
              name="individual-working-income"
              label={t('estimator:income.fields.working-income.label')}
              required
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
              defaultValue={
                loaderData.formValues?.individualIncome.workingIncome ??
                previousFormValues.get('income:individual-working-income')
              }
              errorMessage={errT(errors?.nested?.['individualIncome.workingIncome']?.at(0))}
              autoComplete="off"
            />
            {isMarried && (
              <CurrencyField
                name="partner-working-income"
                label={t('estimator:income.fields.partner.working-income.label')}
                required
                helpMessagePrimaryClassName="-max-w-prose text-black"
                helpMessagePrimary={
                  <div className="my-4 space-y-4">
                    <Collapsible summary={<>{t('estimator:income.fields.partner.working-income.info-label')}</>}>
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
                defaultValue={
                  (loaderData.formValues?.kind === 'married' ? loaderData.formValues.partnerIncome.workingIncome : undefined) ??
                  previousFormValues.get('income:partner-working-income')
                }
                errorMessage={errT(`partner.${errors?.nested?.['partnerIncome.workingIncome']?.at(0)}`)}
                autoComplete="off"
              />
            )}
            <CurrencyField
              name="individual-claimed-income"
              label={t('estimator:income.fields.claimed-income.label')}
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <div className="my-4 space-y-4">
                  <Collapsible summary={<>{t('estimator:income.fields.claimed-income.info-label')}</>}>
                    <div className="space-y-4">
                      <DefinitionList />

                      <p>
                        <Trans i18nKey={'estimator:income.info.claimed-income'} />
                      </p>
                    </div>
                  </Collapsible>
                </div>
              }
              defaultValue={
                loaderData.formValues?.individualIncome.claimedIncome ??
                previousFormValues.get('income:individual-claimed-income')
              }
              errorMessage={errT(errors?.nested?.['individualIncome.claimedIncome']?.at(0))}
              autoComplete="off"
            />
            <CurrencyField
              name="individual-claimed-repayment"
              label={t('estimator:income.fields.claimed-repayment.label')}
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <div className="my-4 space-y-4">
                  <Collapsible summary={<>{t('estimator:income.fields.claimed-repayment.info-label')}</>}>
                    <div className="space-y-4">
                      <DefinitionList />
                      <p>
                        <Trans i18nKey={'estimator:income.info.claimed-repayment'} />
                      </p>
                    </div>
                  </Collapsible>
                </div>
              }
              defaultValue={
                loaderData.formValues?.individualIncome.claimedRepayment ??
                previousFormValues.get('income:individual-claimed-repayment')
              }
              errorMessage={errT(errors?.nested?.['individualIncome.claimedRepayment']?.at(0))}
              autoComplete="off"
            />
            {isMarried && (
              <CurrencyField
                name="partner-claimed-income"
                label={t('estimator:income.fields.partner.claimed-income.label')}
                helpMessagePrimaryClassName="-max-w-prose text-black"
                helpMessagePrimary={
                  <div className="my-4 space-y-4">
                    <Collapsible summary={<>{t('estimator:income.fields.partner.claimed-income.info-label')}</>}>
                      <div className="space-y-4">
                        <DefinitionList />
                        <p>
                          <Trans i18nKey={'estimator:income.info.partner-claimed-income'} />
                        </p>
                      </div>
                    </Collapsible>
                  </div>
                }
                defaultValue={
                  (loaderData.formValues?.kind === 'married' ? loaderData.formValues.partnerIncome.claimedIncome : undefined) ??
                  previousFormValues.get('income:partner-claimed-income')
                }
                errorMessage={errT(`partner.${errors?.nested?.['partnerIncome.claimedIncome']?.at(0)}`)}
                autoComplete="off"
              />
            )}
            {isMarried && (
              <CurrencyField
                name="partner-claimed-repayment"
                label={t('estimator:income.fields.partner.claimed-repayment.label')}
                helpMessagePrimaryClassName="-max-w-prose text-black"
                helpMessagePrimary={
                  <div className="my-4 space-y-4">
                    <Collapsible summary={<>{t('estimator:income.fields.partner.claimed-repayment.info-label')}</>}>
                      <div className="space-y-4">
                        <DefinitionList />
                        <p>
                          <Trans i18nKey={'estimator:income.info.partner-claimed-repayment'} />
                        </p>
                      </div>
                    </Collapsible>
                  </div>
                }
                defaultValue={
                  (loaderData.formValues?.kind === 'married'
                    ? loaderData.formValues.partnerIncome.claimedRepayment
                    : undefined) ?? previousFormValues.get('income:partner-claimed-repayment')
                }
                errorMessage={errT(`partner.${errors?.nested?.['partnerIncome.claimedRepayment']?.at(0)}`)}
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

  function DefinitionList() {
    return (
      <dl className="mt-2 space-y-2 [&>div>dd]:ml-2 [&>div>dd]:inline [&>div>dt]:inline [&>div>dt]:font-bold">
        <div>
          <Trans i18nKey={'estimator:income.info.UCCB'} />
        </div>
        <div>
          <Trans i18nKey={'estimator:income.info.RDSP'} />
        </div>
        <div>
          <Trans i18nKey={'estimator:income.info.CDB'} />
        </div>
      </dl>
    );
  }
}
