import { useId } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

//import type { SessionData } from 'express-session';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Info, Route } from './+types/step-age';
import type { AgeForm, DateOfBirth } from './@types';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { AgePickerField } from '~/components/age-picker-field';
import { Button } from '~/components/button';
import { FetcherErrorSummary } from '~/components/error-summary';
import { PageTitle } from '~/components/page-title';
import { useErrorTranslation } from '~/hooks/use-error-translation';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/estimator/layout';
import { calculateAge } from '~/utils/age-utils';
import { estimatorStepGate } from '~/utils/state-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:age.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  estimatorStepGate(context.session.estimator, 'routes/estimator/step-age.tsx', request);
  const { t } = await getTranslation(request, handle.i18nNamespace);

  return {
    documentTitle: t('estimator:age.page-title'),
    defaultFormValues: context.session.estimator?.dateOfBirth,
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  const { lang } = await getTranslation(request, handle.i18nNamespace);

  const formData = await request.formData();
  const action = formData.get('action');

  switch (action) {
    case 'back': {
      throw i18nRedirect('routes/index.tsx', request);
    }
    case 'next': {
      const ageFormSchema = v.pipe(
        v.object({
          month: v.pipe(
            v.string('date-of-birth.error.required-month'),
            v.nonEmpty('date-of-birth.error.required-month'),
            v.regex(/^\d+$/, 'date-of-birth.error.invalid-month'),
            v.transform(Number),
            v.number('date-of-birth.error.invalid-month'),
            v.integer('date-of-birth.error.invalid-month'),
            v.minValue(1, 'date-of-birth.error.invalid-month'),
            v.maxValue(12, 'date-of-birth.error.invalid-month'),
          ),
          year: v.pipe(
            v.string('date-of-birth.error.required-year'),
            v.regex(/^\d+$/, 'date-of-birth.error.invalid-year'),
            v.transform(Number),
            v.number('date-of-birth.error.invalid-year'),
            v.integer('date-of-birth.error.invalid-year'),
          ),
        }),
        v.transform(({ month, year }) => {
          const age = calculateAge(month, year);

          return { month, year, age };
        }),
        v.check(({ age }) => age >= 18 && age <= 65, 'date-of-birth.error.invalid-age'),
        v.transform(({ month, year }) => ({ month, year })),
      ) satisfies v.GenericSchema<AgeForm, DateOfBirth>;

      const input = {
        month: formData.get('dateOfBirthMonth') as string,
        year: formData.get('dateOfBirthYear') as string,
      } satisfies Partial<AgeForm>;

      const parseResult = v.safeParse(ageFormSchema, input, { lang });

      if (!parseResult.success) {
        return data({ errors: v.flatten<typeof ageFormSchema>(parseResult.issues) }, { status: 400 });
      }

      (context.session.estimator ??= {}).dateOfBirth = parseResult.output;

      throw i18nRedirect('routes/estimator/step-marital-status.tsx', request);
    }
  }
}

export default function StepAge({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errT = useErrorTranslation('estimator', 'age.fields');
  const fetcherKey = useId();
  const fetcher = useFetcher<Info['actionData']>({ key: fetcherKey });
  const errors = fetcher.data?.errors;

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('common:application-title')}>{t('estimator:age.page-title')}</PageTitle>
      <FetcherErrorSummary fetcherKey={fetcherKey}>
        <fetcher.Form method="post" noValidate>
          <div className="space-y-6">
            {/* TODO : KAB : Change Implementation of AgePickerField to accept default value of month and year */}
            <AgePickerField
              defaultValues={{
                month: loaderData.defaultFormValues?.month,
                year: loaderData.defaultFormValues?.year,
              }}
              displayAge={true}
              errorMessages={{
                all: errT(errors?.root?.at(0)),
                month: errT(errors?.nested?.month?.at(0)),
                year: errT(errors?.nested?.year?.at(0)),
              }}
              id="date-of-birth-id"
              legend={t('estimator:age.fields.date-of-birth.label')}
              names={{
                month: 'dateOfBirthMonth',
                year: 'dateOfBirthYear',
              }}
              required
            />
          </div>
          <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Button name="action" value="next" variant="primary" id="continue-button">
              {t('common:next')}
            </Button>
            <Button name="action" value="back" id="back-button">
              {t('common:previous')}
            </Button>
          </div>
        </fetcher.Form>
      </FetcherErrorSummary>
    </div>
  );
}
