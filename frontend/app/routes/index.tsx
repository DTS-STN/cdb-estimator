import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { ButtonLink } from '~/components/button-link';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'common:index.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace, 'common'],
} as const satisfies RouteHandle;

export async function loader({ request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('common:index.page-title') };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export default function Home() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <PageTitle>{t('common:index.page-title')}</PageTitle>
      <p>{t('common:index.about')}</p>
      <div className="mt-8">
        <ButtonLink file="routes/estimator/step-age.tsx" variant="primary">
          {t('common:index.start')}
        </ButtonLink>
      </div>
    </>
  );
}
