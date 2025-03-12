import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/index';

import { ButtonLink } from '~/components/button-link';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import { handle as parentHandle } from '~/routes/layout';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'public:index.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace, 'public'],
} as const satisfies RouteHandle;

export async function loader({ request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);
  return { documentTitle: t('public:index.page-title') };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export default function Home() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <PageTitle>{t('public:index.page-title')}</PageTitle>
      <p className="mt-8">{t('public:index.about')}</p>

      <ButtonLink file="routes/estimator/step-age.tsx" variant="primary">
        {t('public:index.start')}
      </ButtonLink>
    </>
  );
}
