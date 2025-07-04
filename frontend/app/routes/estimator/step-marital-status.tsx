import { useId } from 'react';

import { data, useFetcher } from 'react-router';
import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';
import * as v from 'valibot';

import type { Route } from './+types/step-marital-status';
import type { MaritalStatus, MaritalStatusForm } from './@types';
import { validMaritalStatuses } from './types';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { Collapsible } from '~/components/collapsible';
import { FetcherErrorSummary } from '~/components/error-summary';
import { InputRadios } from '~/components/input-radios';
import { PageTitle } from '~/components/page-title';
import { useErrorTranslation } from '~/hooks/use-error-translation';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/estimator/layout';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';
import { mergeMeta } from '~/utils/meta-utils';
import { getTitleMetaTags } from '~/utils/seo-utils';
import { estimatorStepGate } from '~/utils/state-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:marital-status.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export const meta: Route.MetaFunction = mergeMeta(({ data }) => {
  if (!data) {
    return [];
  }
  return getTitleMetaTags(data.meta.title);
});

export async function loader({ context, params, request }: Route.LoaderArgs) {
  estimatorStepGate(context.session.estimator, 'routes/estimator/step-marital-status.tsx', request);
  const { t } = await getTranslation(request, handle.i18nNamespace);

  const meta = { title: t('common:meta.title.template', { title: t('estimator:marital-status.page-title') }) };

  return {
    meta,
    defaultFormValues: context.session.estimator?.maritalStatus,
  };
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
      const martialSatusSchema = v.pipe(
        v.object({
          maritalStatus: v.pipe(v.string('status.error.required'), v.picklist(validMaritalStatuses, 'status.error.required')),
        }),
        v.transform((input) => {
          return input.maritalStatus as MaritalStatus;
        }),
      ) satisfies v.GenericSchema<MaritalStatusForm, MaritalStatus>;

      const input = {
        maritalStatus: formData.get('maritalStatus') as string,
      } satisfies Partial<MaritalStatusForm>;

      const parseResult = v.safeParse(martialSatusSchema, input, { lang });

      if (!parseResult.success) {
        return data({ errors: v.flatten<typeof martialSatusSchema>(parseResult.issues), ts: new Date() }, { status: 400 });
      }

      if ((context.session.estimator ??= {}).maritalStatus !== parseResult.output) {
        (context.session.estimator ??= {}).maritalStatus = parseResult.output;
        //clear income data because marital status has changed (there is a dependency betwen the maritalStatus choice and the income schema)
        (context.session.estimator ??= {}).income = undefined;
      }

      throw i18nRedirect('routes/estimator/step-income.tsx', request);
    }
  }
}

export default function StepMaritalStatus({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);
  const errT = useErrorTranslation('estimator', 'marital-status.fields');
  const fetcherKey = useId();
  const fetcher = useFetcher<typeof action>({ key: fetcherKey });
  const errors = fetcher.data?.errors;

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('common:app.title')}>{t('estimator:marital-status.page-title')}</PageTitle>
      <FetcherErrorSummary fetcherKey={fetcherKey}>
        <fetcher.Form method="post" noValidate>
          <div className="space-y-6">
            <p>{t('common:form-instructions.all-required')}</p>
            <InputRadios
              helpMessagePrimaryClassName="-max-w-prose text-black"
              helpMessagePrimary={
                <div className="my-4 space-y-4">
                  <Collapsible
                    summary={<>{t('estimator:marital-status.additional-info.label')}</>}
                    data-gc-analytics-expand={`Expand-collapse marital status definitions`}
                  >
                    <div className="space-y-4">
                      <dl className="mt-2 space-y-2">
                        <div>
                          <dt className="inline font-bold">{t('estimator:marital-status.additional-info.single.term')}</dt>
                          <dd className="ml-2 inline">{t('estimator:marital-status.additional-info.single.text')}</dd>
                        </div>
                        <div>
                          <dt className="inline font-bold">{t('estimator:marital-status.additional-info.divorced.term')}</dt>
                          <dd className="ml-2 inline">{t('estimator:marital-status.additional-info.divorced.text')}</dd>
                        </div>
                        <div>
                          <dt className="inline font-bold">{t('estimator:marital-status.additional-info.separated.term')}</dt>
                          <dd className="ml-2 inline [&>p]:mt-2">
                            {t('estimator:marital-status.additional-info.separated.text')}
                            <p>{t('estimator:marital-status.additional-info.separated.p1')}</p>
                            <p>{t('estimator:marital-status.additional-info.separated.p2')}</p>
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-bold">{t('estimator:marital-status.additional-info.widowed.term')}</dt>
                          <dd className="ml-2 inline">{t('estimator:marital-status.additional-info.widowed.text')}</dd>
                        </div>
                        <div>
                          <dt className="inline font-bold">{t('estimator:marital-status.additional-info.married.term')}</dt>
                          <dd className="ml-2 inline">{t('estimator:marital-status.additional-info.married.text')}</dd>
                        </div>
                        <div>
                          <dt className="inline font-bold">{t('estimator:marital-status.additional-info.common-law.term')}</dt>
                          <dd className="ml-2 inline">
                            {t('estimator:marital-status.additional-info.common-law.text')}{' '}
                            <ul className="mt-2 list-disc space-y-2 pl-5">
                              <li>{t('estimator:marital-status.additional-info.common-law.item1')}</li>
                              <li>{t('estimator:marital-status.additional-info.common-law.item2')}</li>
                              <li>{t('estimator:marital-status.additional-info.common-law.item3')}</li>
                            </ul>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </Collapsible>
                </div>
              }
              id="marital-status"
              name="maritalStatus"
              legend={t('estimator:marital-status.fields.status.label')}
              options={[
                {
                  value: validMaritalStatuses[0],
                  children: <Trans ns={handle.i18nNamespace} i18nKey="estimator:marital-status.fields.status.options.single" />,
                  defaultChecked: loaderData.defaultFormValues === validMaritalStatuses[0],
                },
                {
                  value: validMaritalStatuses[1],
                  children: (
                    <Trans ns={handle.i18nNamespace} i18nKey="estimator:marital-status.fields.status.options.married" />
                  ),
                  defaultChecked: loaderData.defaultFormValues === validMaritalStatuses[1],
                },
              ]}
              required
              errorMessage={errT(errors?.nested?.maritalStatus?.at(0) ?? errors?.root?.at(0))}
            />
          </div>
          <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
            <Button
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('StepMaritalStatus:Next button')}
              name="action"
              value="next"
              variant="primary"
              id="continue-button"
              size="lg"
            >
              {t('common:continue')}
            </Button>
            <Button
              data-gc-analytics-customclick={adobeAnalytics.getCustomClick('StepMaritalStatus:Previous button')}
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
