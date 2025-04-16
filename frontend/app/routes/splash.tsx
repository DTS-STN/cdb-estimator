import type { RouteHandle } from 'react-router';

import { useTranslation } from 'react-i18next';

import type { Route } from './+types/splash';

import { serverEnvironment } from '~/.server/environment';
import { ButtonLink } from '~/components/button-link';
import { AppLink } from '~/components/links';
import { getFixedT } from '~/i18n-config.server';
import { mergeMeta } from '~/utils/meta-utils';
import { getDescriptionMetaTags, getTitleMetaTags } from '~/utils/seo-utils';

export const handle = {
  breadcrumbs: [],
  i18nNamespace: ['common'],
} as const satisfies RouteHandle;

export const meta: Route.MetaFunction = mergeMeta(({ data }) => {
  return [
    ...getTitleMetaTags(data.meta.title),
    ...getDescriptionMetaTags(data.meta.description),
    { name: 'author', content: data.meta.eng.author },
    { name: 'author', lang: 'fr', content: data.meta.fra.author },
    { name: 'dcterms.accessRights', content: '2' },
    { name: 'dcterms.creator', content: data.meta.eng.author },
    { name: 'dcterms.creator', lang: 'fr', content: data.meta.fra.author },
    { name: 'dcterms.language', content: 'eng' },
    { name: 'dcterms.language', lang: 'fr', content: 'fra' },
    { name: 'dcterms.service', content: data.meta.service },
    { name: 'dcterms.spatial', content: 'Canada' },
    { name: 'dcterms.subject', content: data.meta.eng.subject },
    { name: 'dcterms.subject', lang: 'fr', content: data.meta.fra.subject },
    { property: 'og:locale', content: 'en_CA' },
    { property: 'og:site_name', content: data.meta.siteName },
    { property: 'og:type', content: 'website' },
  ];
});

export async function loader() {
  const en = await getFixedT('en', handle.i18nNamespace);
  const fr = await getFixedT('fr', handle.i18nNamespace);

  const meta = {
    title: `${en('common:app.title')} | ${fr('common:app.title')} - Canada.ca`,
    siteName: `${en('common:app.title')} | ${fr('common:app.title')} - Canada.ca`,
    description: `${en('common:meta.description')} | ${fr('common:meta.description')} - Canada.ca`,
    service: serverEnvironment.ADOBE_ANALYTICS_SERVICE_NAME,
    eng: { author: en('common:meta.author'), subject: en('common:meta.subject') },
    fra: { author: fr('common:meta.author'), subject: fr('common:meta.subject') },
  };

  return { meta };
}

export default function Splash() {
  const { i18n } = useTranslation(handle.i18nNamespace);
  const en = i18n.getFixedT('en');
  const fr = i18n.getFixedT('fr');

  return (
    <main role="main" className="bg-splash-page flex h-svh bg-cover bg-center">
      <div className="m-auto w-[300px] bg-white md:w-[400px] lg:w-[500px]">
        <div className="p-8">
          <h1 className="sr-only">
            <span lang="en">{en('common:header.language-selection')}</span>
            <span lang="fr">{fr('common:header.language-selection')}</span>
          </h1>
          <div className="w-11/12 lg:w-8/12">
            <AppLink to="https://www.canada.ca/en.html">
              <img
                className="h-8 w-auto"
                src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-en.svg"
                alt={`${en('common:footer.gc-symbol')} / ${fr('common:footer.gc-symbol')}`}
                width="300"
                height="28"
                decoding="async"
              />
            </AppLink>
          </div>
          <div className="mt-9 mb-2 grid grid-cols-2 gap-8 md:mx-4 lg:mx-8">
            <section lang="en" className="text-center">
              <h2 className="sr-only">{en('common:header.govt-of-canada.text')}</h2>
              <ButtonLink file="routes/index.tsx" lang="en" variant="primary" size="lg" className="w-full">
                {en('common:language')}
              </ButtonLink>
            </section>
            <section lang="fr" className="text-center">
              <h2 className="sr-only">{fr('common:header.govt-of-canada.text')}</h2>
              <ButtonLink file="routes/index.tsx" lang="fr" variant="primary" size="lg" className="w-full">
                {fr('common:language')}
              </ButtonLink>
            </section>
          </div>
        </div>
        <div className="flex items-center justify-between gap-6 bg-gray-200 p-8">
          <div className="w-7/12 md:w-8/12">
            <AppLink
              className="text-slate-700 hover:text-blue-700 hover:underline focus:text-blue-700"
              to={en('common:footer.terms-and-conditions.href')}
              lang="en"
            >
              {en('common:footer.terms-and-conditions.text')}
            </AppLink>
            <span className="text-gray-400"> • </span>
            <AppLink
              className="text-slate-700 hover:text-blue-700 hover:underline focus:text-blue-700"
              to={fr('common:footer.terms-and-conditions.href')}
              lang="fr"
            >
              {fr('common:footer.terms-and-conditions.text')}
            </AppLink>
          </div>
          <div className="w-5/12 md:w-4/12">
            <img
              src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/wmms-blk.svg"
              alt={`${en('common:footer.gc-symbol')} / ${fr('common:footer.gc-symbol')}`}
              width={300}
              height={71}
              className="h-10 w-auto"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
