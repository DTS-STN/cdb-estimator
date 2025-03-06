import { Form } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/step-marital-status';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/estimator/layout';

export const handle = {
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);

  return {
    documentTitle: t('estimator:marital-status.page-title'),
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');

  switch (action) {
    case 'back': {
      throw i18nRedirect('routes/estimator/step-incarceration.tsx', request);
    }
    case 'next': {
      throw i18nRedirect('routes/estimator/step-disability-tax-credit.tsx', request);
    }
  }
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export default function StepMaritalStatus({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('public:application-title')}>{t('estimator:marital-status.page-title')}</PageTitle>
      <Form method="post">
        <div className="mt-8 flex flex-row-reverse flex-wrap items-center justify-end gap-3">
          <Button name="action" value="next" variant="primary" id="continue-button">
            Next
          </Button>
          <Button name="action" value="back" id="back-button">
            Previous
          </Button>
        </div>
      </Form>
    </div>
  );
}
