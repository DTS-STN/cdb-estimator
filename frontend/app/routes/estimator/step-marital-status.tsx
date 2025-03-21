import { useId } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import type { SessionData } from 'express-session';
import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Info, Route } from './+types/step-marital-status';
import { isMaritalStatus, validMaritalStatuses } from './types';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { Collapsible } from '~/components/collapsible';
import { FetcherErrorSummary } from '~/components/error-summary';
import { InputRadios } from '~/components/input-radios';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/estimator/layout';

type MaritalStatusSessionData = NonNullable<SessionData['estimator']['maritalStatusForm']>;

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:marital-status.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);
  //TODO: validate current overall state, redirect accordingly
  return {
    documentTitle: t('estimator:marital-status.page-title'),
    defaultFormValues: context.session.estimator?.maritalStatusForm,
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const { lang, t } = await getTranslation(request, handle.i18nNamespace);
  const formData = await request.formData();
  const action = formData.get('action');

  switch (action) {
    case 'back': {
      throw i18nRedirect('routes/estimator/step-age.tsx', request);
    }
    case 'next': {
      const martialSatusSchema = v.object({
        maritalStatus: v.picklist(validMaritalStatuses, t('estimator:marital-status.error-message.marital-status-required')),
      }) satisfies v.GenericSchema<MaritalStatusSessionData>;

      const maritalStatus = formData.get('maritalStatus')?.toString();

      const input = {
        maritalStatus: maritalStatus !== undefined ? (isMaritalStatus(maritalStatus) ? maritalStatus : undefined) : undefined,
      } satisfies Partial<MaritalStatusSessionData>;

      const parseResult = v.safeParse(martialSatusSchema, input, { lang });

      if (!parseResult.success) {
        return data({ errors: v.flatten<typeof martialSatusSchema>(parseResult.issues).nested }, { status: 400 });
      }

      (context.session.estimator ??= {}).maritalStatusForm = parseResult.output;

      throw i18nRedirect('routes/estimator/step-income.tsx', request);
    }
  }
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export default function StepMaritalStatus({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const fetcherKey = useId();
  const fetcher = useFetcher<Info['actionData']>({ key: fetcherKey });
  const errors = fetcher.data?.errors;

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('common:application-title')}>{t('estimator:marital-status.page-title')}</PageTitle>
      <FetcherErrorSummary fetcherKey={fetcherKey}>
        <fetcher.Form method="post" noValidate>
          <div className="space-y-6">
            <InputRadios
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <div className="my-4 space-y-4">
                  <Collapsible summary={<>{t('common:additional-information-label')}</>}>
                    <div className="space-y-4">
                      <p>
                        <Trans i18nKey={'estimator:marital-status.additional-info.single'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:marital-status.additional-info.divorced'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:marital-status.additional-info.separated.p1'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:marital-status.additional-info.separated.p2'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:marital-status.additional-info.separated.p3'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:marital-status.additional-info.widowed'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:marital-status.additional-info.married'} />
                      </p>
                      <p>
                        <Trans i18nKey={'estimator:marital-status.additional-info.common-law.text'} />
                        <ul className="list-disc space-y-2 pl-5">
                          <li>
                            <Trans i18nKey={'estimator:marital-status.additional-info.common-law.item1'} />
                          </li>
                          <li>
                            <Trans i18nKey={'estimator:marital-status.additional-info.common-law.item2'} />
                          </li>
                          <li>
                            <Trans i18nKey={'estimator:marital-status.additional-info.common-law.item3'} />
                          </li>
                        </ul>
                      </p>
                    </div>
                  </Collapsible>
                </div>
              }
              id="marital-status"
              name="maritalStatus"
              legend={t('estimator:marital-status.form-instructions')}
              options={[
                {
                  value: validMaritalStatuses[0],
                  children: <Trans ns={handle.i18nNamespace} i18nKey="estimator:marital-status.radio-options.single" />,
                  defaultChecked: loaderData.defaultFormValues?.maritalStatus === validMaritalStatuses[0],
                },
                {
                  value: validMaritalStatuses[1],
                  children: <Trans ns={handle.i18nNamespace} i18nKey="estimator:marital-status.radio-options.married" />,
                  defaultChecked: loaderData.defaultFormValues?.maritalStatus === validMaritalStatuses[1],
                },
              ]}
              required
              errorMessage={errors?.maritalStatus?.at(0)}
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
