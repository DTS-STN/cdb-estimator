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
  const { i18n } = useTranslation(handle.i18nNamespace);
  const lang = i18n.language;

  return lang === 'en' ? ContentEn() : ContentFr();
}

function ContentEn() {
  const { t } = useTranslation(handle.i18nNamespace);

  return (
    <>
      <PageTitle>{t('public:index.page-title')}</PageTitle>

      <div className="max-w-prose space-y-6">
        <section className="space-y-6">
          <p>
            <strong>This estimator is a work in progress.</strong>
            <br />
            You can improve it by giving your{' '}
            <a
              className="text-slate-700 underline hover:text-blue-700 focus:text-blue-700"
              href="https://srv217.services.gc.ca/ihst4/Questionnaire.aspx?sid=2729a4fb-be1c-48c1-95ed-b595ade76792&lc=eng&GocTemplateCulture=en-CA&iffsappid=TISMB-DGTGIS&iffssid=334e3618-a1e0-4e57-8d06-62dde193abbd"
            >
              feedback
            </a>
            .<br />
            Use this estimator to find out how much money you could get from the <u>Canada Disability Benefit</u>. This is not
            an application for benefits.{' '}
          </p>
          <h2 className="font-lato text-lg font-bold">Before you begin</h2>
          <p>
            To be eligible for the Canada Disability Benefit, you must meet specific eligibility criteria. To learn more about
            the Canada Disability Benefit and the eligibility criteria, go to{' '}
            <a
              className="text-slate-700 underline hover:text-blue-700 focus:text-blue-700"
              href="https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit.html"
            >
              canada.ca/disability-benefit
            </a>
            .
          </p>
          <p>To receive the benefit, a person must:</p>
          <ol className="list-decimal space-y-1 pl-7">
            <li>
              be a resident of Canada for the purposes of the <em>Income tax Act</em>
            </li>
            <li>have been approved for the disability tax credit</li>
            <li>be between the ages of 18 and 64 </li>
            <li>
              have filed an income tax return with the Canada Revenue Agency for the previous tax year. For example, to receive
              benefits for the July 2025 to June 2026 payment period, the person must have filed a return for the 2024 tax
              year{' '}
            </li>
            <li>
              be one of the following:
              <ul className="list-disc space-y-1 pl-7">
                <li>a Canadian citizen</li>
                <li>a permanent resident</li>
                <li>a protected person</li>
                <li>a temporary resident who has lived in Canada for the past 18 months</li>
                <li>
                  someone who is registered or entitled to be registered under the <em>Indian Act</em>
                </li>
              </ul>
            </li>
          </ol>
          <p>
            If the person is married or in a common-law relationship, their spouse or common-law partner must also file an
            income tax return with the Canada Revenue Agency for the previous tax year. In some cases, the person applying for
            the benefit can ask Service Canada to waive (remove) the requirement that their spouse or common-law partner file an
            income tax return. These cases include:
          </p>
          <ol className="list-decimal space-y-1 pl-7">
            <li>
              if the person&#39;s spouse or common-law partner is not resident in Canada for the purposes of the{' '}
              <em>Income Tax Act</em>
            </li>
            <li>
              if the person does not live with their spouse or common-law partner for reasons they do not control (for example,
              if they live in a long-term care home)
            </li>
            <li>if it would be unsafe for the person to ask their spouse or common-law partner to file a return</li>
          </ol>
          <p>
            If you feel you meet the eligibility criteria, use the benefits estimator to see how much you may receive. The
            estimator will ask you questions about your:
          </p>
          <ol className="list-decimal space-y-1 pl-7">
            <li>age</li>
            <li>marital status</li>
            <li>income</li>
          </ol>
          <p>
            It will take about 5 to 10 minutes to complete.
            <br />
            <strong>This tool gives an estimate only.</strong> It doesn&#39;t guarantee that you&#39;ll be eligible or that
            you&#39;ll receive the amount estimated.
          </p>
        </section>

        <section className="my-10">
          <div>
            <ButtonLink file="routes/estimator/step-age.tsx" variant="primary" size="lg">
              {t('public:index.start')}
            </ButtonLink>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-lato text-lg font-bold">About the results</h2>
          <p>
            This estimator uses amounts for benefits paid between July 2025 and June 2026. Future benefit amounts may be higher.
            The results are not financial advice and are subject to change. For a more accurate assessment of your estimated
            benefits amount, please <a href="#contact">contact us</a>.
          </p>
        </section>
      </div>
    </>
  );
}

function ContentFr() {
  return <p className="text-xl">À venir...</p>;
}
