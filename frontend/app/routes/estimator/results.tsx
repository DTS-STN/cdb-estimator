import type { RouteHandle } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';

import type { Route } from './+types/results';

import { ButtonLink } from '~/components/button-link';
import { ContextualAlert } from '~/components/contextual-alert';
import { InlineLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { getTranslation } from '~/i18n-config.server';
import type { I18nRouteFile } from '~/i18n-routes';
import { handle as parentHandle } from '~/routes/estimator/layout';
import { cn } from '~/utils/tailwind-utils';

export const handle = {
  breadcrumbs: [...parentHandle.breadcrumbs, { labelKey: 'estimator:results.breadcrumb' }],
  i18nNamespace: [...parentHandle.i18nNamespace],
} as const satisfies RouteHandle;

export async function loader({ context, params, request }: Route.LoaderArgs) {
  const { t } = await getTranslation(request, handle.i18nNamespace);

  return {
    documentTitle: t('estimator:results.page-title'),
    results: context.session.estimator,
  };
}

export function meta({ data }: Route.MetaArgs) {
  return [{ title: data.documentTitle }];
}

export async function action({ context, request }: Route.ActionArgs) {}

export default function Results({ actionData, loaderData, matches, params }: Route.ComponentProps) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className="space-y-3">
      <PageTitle subTitle={t('common:application-title')}>{t('estimator:results.page-title')}</PageTitle>

      <ContextualAlert type="info" className="my-6">
        <p>{t('estimator:results.disclaimer-alert')}</p>
      </ContextualAlert>

      <div className="flex flex-col space-y-12">
        <div className="md:grid md:grid-cols-3 md:gap-12">
          <section className="col-span-2 row-span-1 space-y-6">
            <h2 className="font-lato mb-4 text-lg font-bold">{t('estimator:results.content.your-estimate.header')}</h2>

            {/* single, divorced, separated, or widowed, */}
            <p className="mb-4">{t('estimator:results.content.your-estimate.single.intro')}</p>
            <ul className="list-disc space-y-1 pl-7">
              <li>
                <Trans ns={handle.i18nNamespace} i18nKey="estimator:results.content.your-estimate.single.result" />
              </li>
            </ul>

            {/* married or common-law */}
            <p className="mb-4">{t('estimator:results.content.your-estimate.married-common-law.intro')}</p>
            <ul className="list-disc space-y-1 pl-7">
              <li>
                <Trans
                  ns={handle.i18nNamespace}
                  i18nKey="estimator:results.content.your-estimate.married-common-law.non-cdb-partner-result"
                />
              </li>
              <li>
                <Trans
                  ns={handle.i18nNamespace}
                  i18nKey="estimator:results.content.your-estimate.married-common-law.cdb-partner-result"
                />
              </li>
            </ul>

            <pre>{JSON.stringify(loaderData.results, null, 2)}</pre>

            <h2 className="font-lato mb-4 text-lg font-bold">{t('estimator:results.content.next-steps.header')}</h2>

            <div className="my-6 space-y-6 rounded border border-[#6F6F6F] px-8 py-6">
              <div>
                <ButtonLink file="routes/estimator/step-age.tsx" variant="primary" startIcon={'external-link'} size="xl">
                  {t('estimator:results.content.next-steps.apply-cdb')}
                </ButtonLink>
              </div>

              <div>
                <ButtonLink file="routes/estimator/step-age.tsx" variant="alternative" startIcon={'external-link'} size="xl">
                  {t('estimator:results.content.next-steps.learn-more')}
                </ButtonLink>
              </div>
            </div>
          </section>
          <section className="col-span-1 row-span-2 space-y-4">
            <div className="mt-8 mb-8 rounded bg-stone-100 sm:p-8 md:mt-0 md:max-w-[360px]">
              <h3 className="font-lato text-xl font-bold">{t('estimator:results.form-data-summary.title')}</h3>

              {InfoBlock(
                t('estimator:results.form-data-summary.field-labels.age'),
                t('estimator:results.form-data-summary.edit-aria-labels.age'),
                'routes/estimator/step-age.tsx',
                'TODO',
                true,
              )}

              {InfoBlock(
                t('estimator:results.form-data-summary.field-labels.marital-status'),
                t('estimator:results.form-data-summary.edit-aria-labels.marital-status'),
                'routes/estimator/step-marital-status.tsx',
                'TODO',
                false,
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoBlock(title: string, editAriaLabel: string, editRoute: I18nRouteFile, value: string, showBorder: boolean) {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <div className={cn('py-4', showBorder ? 'border-info-border border-b' : '')}>
      <div>{title}</div>
      <div className="grid grid-cols-3 gap-0">
        <div className="col-span-2">
          <strong>{value}</strong>
        </div>
        <div className="self-end justify-self-end">
          <InlineLink file={editRoute} aria-label={editAriaLabel}>
            {t('common:edit')}
          </InlineLink>
        </div>
      </div>
    </div>
  );
}
