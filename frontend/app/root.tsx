import type { RouteHandle } from 'react-router';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router';

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';
import { useTranslation } from 'react-i18next';

import type { Route } from './+types/root';
import { AdobeAnalyticsHeadScript, AdobeAnalyticsBottomScript } from './components/adobe-analytics-script';
import {
  BilingualErrorBoundary,
  BilingualNotFound,
  UnilingualErrorBoundary,
  UnilingualNotFound,
} from './components/error-boundaries';
import { usePushPageviewEvent } from './hooks/use-push-pageview-event';
import { getTranslation } from './i18n-config.server';
import { getLanguageFromResource } from './utils/i18n-utils';
import { getDescriptionMetaTags, getTitleMetaTags } from './utils/seo-utils';

import { clientEnvironmentRevision, serverEnvironment } from '~/.server/environment';
import indexStyleSheet from '~/index.css?url';
import tailwindStyleSheet from '~/tailwind.css?url';

// see: https://docs.fontawesome.com/web/dig-deeper/security#content-security-policy
fontAwesomeConfig.autoAddCss = false;

export const handle = {
  breadcrumbs: [],
  i18nNamespace: ['common'],
} as const satisfies RouteHandle;

export function links(): Route.LinkDescriptors {
  return [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap',
      crossOrigin: 'anonymous',
    },
    { rel: 'stylesheet', href: indexStyleSheet, crossOrigin: 'anonymous' },
    { rel: 'stylesheet', href: tailwindStyleSheet, crossOrigin: 'anonymous' },
  ];
}

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) {
    return [];
  }
  return [
    ...getTitleMetaTags(data.meta.title),
    ...getDescriptionMetaTags(data.meta.description),
    { name: 'author', content: data.meta.author },
    { name: 'dcterms.accessRights', content: '2' },
    { name: 'dcterms.creator', content: data.meta.author },
    { name: 'dcterms.language', content: data.meta.language },
    { name: 'dcterms.service', content: data.meta.service },
    { name: 'dcterms.spatial', content: 'Canada' },
    { name: 'dcterms.subject', content: data.meta.subject },
    { property: 'og:locale', content: data.meta.locale },
    { property: 'og:site_name', content: data.meta.siteName },
    { property: 'og:type', content: 'website' },
  ];
};

export const headers: Route.HeadersFunction = () => {
  return {
    'Cache-Control': `private, no-cache, no-store, must-revalidate, max-age=0`,
  };
};

export async function loader({ context, request }: Route.LoaderArgs) {
  const { t, lang } = await getTranslation(request, handle.i18nNamespace);

  const meta = {
    author: t('common:meta.author'),
    description: t('common:meta.description'),
    language: lang === 'fr' ? 'fra' : 'eng',
    locale: `${lang}_CA`,
    siteName: t('common:meta.site-name'),
    subject: t('common:meta.subject'),
    title: t('common:app.title'), // default title
    service: serverEnvironment.ADOBE_ANALYTICS_SERVICE_NAME,
  };

  return {
    nonce: context.nonce,
    clientEnvRevision: clientEnvironmentRevision,
    meta,
  };
}

export default function App({ loaderData, matches, params }: Route.ComponentProps) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  usePushPageviewEvent(matches.at(-1)?.pathname ?? '/', params);

  return (
    <html lang={currentLanguage}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <AdobeAnalyticsHeadScript />
      </head>
      <body vocab="http://schema.org/" typeof="WebPage">
        <Outlet />
        <ScrollRestoration nonce={loaderData.nonce} />
        <Scripts nonce={loaderData.nonce} />
        <script src={`/api/client-env?v=${loaderData.clientEnvRevision}`} />
        <AdobeAnalyticsBottomScript />
      </body>
    </html>
  );
}

export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
  // Show bilingual components when not on a unilingual route
  const { pathname } = useLocation();
  const currentLanguage = getLanguageFromResource(pathname);

  if (is404Error(props.error)) {
    // prettier-ignore
    return currentLanguage
      ? <UnilingualNotFound {...props} />
      : <BilingualNotFound {...props} />;
  }

  // prettier-ignore
  return currentLanguage
    ? <UnilingualErrorBoundary {...props} />
    : <BilingualErrorBoundary {...props} />;
}

function is404Error(error: Route.ErrorBoundaryProps['error']) {
  return isRouteErrorResponse(error) && error.status === 404;
}
