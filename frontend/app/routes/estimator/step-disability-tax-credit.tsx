import { Form } from 'react-router';
import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/step-disability-tax-credit';

import { i18nRedirect } from '~/.server/utils/route-utils';
import { Button } from '~/components/button';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/estimator/layout';

export const handle = {
  breadcrumbs: [
    ...parentHandle.breadcrumbs,
    {
      labelKey: 'estimator:disability-tax-credit.breadcrumb',
      destinationRoute: { file: 'routes/estimator/step-disability-tax-credit.tsx' },
    },
  ],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);

  return {
    documentTitle: t('estimator:disability-tax-credit.page-title'),
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const action = formData.get('action');

  switch (action) {
    case 'back': {
      throw i18nRedirect('routes/estimator/step-marital-status.tsx', request);
    }
    case 'next': {
      throw i18nRedirect('routes/estimator/step-income-tax-return.tsx', request);
    }
  }
}

export default function StepDisabilityTaxCredit({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="space-y-3">
      <PageTitle>{t('estimator:disability-tax-credit.page-title')}</PageTitle>
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
