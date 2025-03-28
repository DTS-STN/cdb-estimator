import { useEffect } from 'react';

import type { RouteHandle } from 'react-router';
import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';

import { config as fontAwesomeConfig } from '@fortawesome/fontawesome-svg-core';

import type { Route } from './+types/root';
import {
  BilingualErrorBoundary,
  BilingualNotFound,
  UnilingualErrorBoundary,
  UnilingualNotFound,
} from './components/error-boundaries';

import { clientEnvironmentRevision } from '~/.server/environment';
import { useLanguage } from '~/hooks/use-language';
import indexStyleSheet from '~/index.css?url';
import tailwindStyleSheet from '~/tailwind.css?url';
import * as adobeAnalytics from '~/utils/adobe-analytics';

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

export function loader({ context }: Route.LoaderArgs) {
  return {
    nonce: context.nonce,
    clientEnvRevision: clientEnvironmentRevision,
  };
}

export default function App({ loaderData, matches, params }: Route.ComponentProps) {
  const { currentLanguage } = useLanguage();
  const { ADOBE_ANALYTICS_JQUERY_SRC, ADOBE_ANALYTICS_SRC } = globalThis.__appEnvironment;

  useEffect(() => {
    if (adobeAnalytics.isEnabled()) {
      const locationUrl = new URL(matches[matches.length - 1]?.pathname ?? '/', origin);
      adobeAnalytics.pushPageviewEvent(locationUrl, params);
    }
  }, [matches, params]);

  return (
    <html lang={currentLanguage}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {adobeAnalytics.isEnabled() && (
          <>
            <script src={ADOBE_ANALYTICS_JQUERY_SRC} />
            <script src={ADOBE_ANALYTICS_SRC} />
          </>
        )}
      </head>
      <body vocab="http://schema.org/" typeof="WebPage">
        <Outlet />
        <ScrollRestoration nonce={loaderData.nonce} />
        <Scripts nonce={loaderData.nonce} />
        <script src={`/api/client-env?v=${loaderData.clientEnvRevision}`} />
        {adobeAnalytics.isEnabled() && adobeAnalytics.isDebug() && (
          <script id="gc-analytics-bottom-debug-script">_satellite.setDebug(true);</script>
        )}

        {adobeAnalytics.isEnabled() && <script id="gc-analytics-bottom-script">_satellite.pageBottom();</script>}
      </body>
    </html>
  );
}

export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
  const { currentLanguage } = useLanguage();

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
