import { useId } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import type { SessionData } from 'express-session';
import { useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Info, Route } from './+types/step-age';
import type { DateOfBirth } from './@types';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { AgePickerField } from '~/components/age-picker-field';
import { Button } from '~/components/button';
import { FetcherErrorSummary } from '~/components/error-summary';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/estimator/layout';
import { calculateAge } from '~/utils/age-utils';

type AgeInformationSessionData = NonNullable<SessionData['estimator']['ageForm']>;

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:age.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);

  return {
    documentTitle: t('estimator:age.page-title'),
    defaultFormValues: context.session.estimator?.ageForm,
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);

  const formData = await request.formData();
  const action = formData.get('action');

  switch (action) {
    case 'back': {
      throw i18nRedirect('routes/index.tsx', request);
    }
    case 'next': {
      const dobSchema = v.pipe(
        v.object({
          month: v.pipe(
            v.number(t('estimator:age.date-of-birth.required-month')),
            v.integer(t('estimator:age.date-of-birth.invalid-month')),
            v.minValue(1, t('estimator:age.date-of-birth.invalid-month')),
            v.maxValue(12, t('estimator:age.date-of-birth.invalid-month')),
          ),
          year: v.pipe(
            v.number(t('estimator:age.date-of-birth.required-year')),
            v.integer(t('estimator:age.date-of-birth.invalid-year')),
          ),
        }),
        v.transform(({ month, year }) => {
          const age = calculateAge(month, year);

          return { month, year, age };
        }),
        v.check(({ age }) => age >= 18 && age <= 65, t('estimator:age.date-of-birth.invalid-age')),
        v.transform(({ month, year }) => ({ month, year })),
      ) satisfies v.GenericSchema<DateOfBirth>;

      const schema = v.object({
        dateOfBirth: dobSchema,
      }) satisfies v.GenericSchema<AgeInformationSessionData>;

      const input = {
        dateOfBirth: {
          month: Number(formData.get('dateOfBirthMonth')),
          year: Number(formData.get('dateOfBirthYear')),
        },
      } satisfies Partial<AgeInformationSessionData>;

      const parseResult = v.safeParse(schema, input, { lang });

      if (!parseResult.success) {
        return data({ errors: v.flatten<typeof schema>(parseResult.issues).nested }, { status: 400 });
      }

      (context.session.estimator ??= {}).ageForm = parseResult.output;

      throw i18nRedirect('routes/estimator/step-residency.tsx', request);
    }
  }
}

export default function StepAge({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  const fetcherKey = useId();
  const fetcher = useFetcher<Info['actionData']>({ key: fetcherKey });
  const errors = fetcher.data?.errors;

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('public:application-title')}>{t('estimator:age.page-title')}</PageTitle>
      <FetcherErrorSummary fetcherKey={fetcherKey}>
        <fetcher.Form method="post" noValidate>
          <div className="space-y-6">
            {/* TODO : KAB : Change Implementation of AgePickerField to accept default value of month and year */}
            <AgePickerField
              defaultValues={{
                month: loaderData.defaultFormValues?.dateOfBirth.month,
                year: loaderData.defaultFormValues?.dateOfBirth.year,
              }}
              displayAge={true}
              errorMessages={{
                all: errors?.dateOfBirth?.at(0),
                month: errors?.['dateOfBirth.month']?.at(0),
                year: errors?.['dateOfBirth.year']?.at(0),
              }}
              id="date-of-birth-id"
              legend={t('estimator:age.date-of-birth.label')}
              names={{
                month: 'dateOfBirthMonth',
                year: 'dateOfBirthYear',
              }}
              required
            />
          </div>
          <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Button name="action" value="next" variant="primary" id="continue-button">
              Next
            </Button>
            <Button name="action" value="back" id="back-button">
              Previous
            </Button>
          </div>
        </fetcher.Form>
      </FetcherErrorSummary>
    </div>
  );
}
