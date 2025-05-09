import { Links, Meta, Scripts } from 'react-router';

import { Trans, useTranslation } from 'react-i18next';

import type { Route } from '../+types/root';

import { AppLink } from '~/components/links';
import { PageTitle } from '~/components/page-title';
import { isAppError } from '~/errors/app-error';

/**
 * A bilingual error boundary that renders appropriate error messages in both languages.
 *
 * **Important Note:**
 *
 * React Router error boundaries should be designed to be as robust as possible.
 * If an error boundary itself throws an error, there's no subsequent error
 * boundary to catch and render it, potentially leading to infinite error loops.
 */
export function BilingualErrorBoundary({ actionData, error, loaderData, params }: Route.ErrorBoundaryProps) {
  const { i18n } = useTranslation(['common']);
  const en = i18n.getFixedT('en');
  const fr = i18n.getFixedT('fr');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="border-b-[3px] border-slate-700 print:hidden">
          <div id="wb-bnr">
            <div className="container flex items-center justify-between gap-6 py-2.5 sm:py-3.5">
              <AppLink to="https://canada.ca/">
                <img
                  className="h-8 w-auto"
                  src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-en.svg"
                  alt={`${en('common:header.govt-of-canada.text')} / ${fr('common:header.govt-of-canada.text')}`}
                  width="300"
                  height="28"
                  decoding="async"
                />
              </AppLink>
            </div>
          </div>
        </header>
        <main className="container">
          <div className="mb-4 grid grid-cols-1 gap-6 py-2.5 sm:grid-cols-2 sm:py-3.5">
            <div id="english" lang="en">
              <PageTitle className="my-8">
                <span>{en('common:server-error.page-title')}</span>
                <small className="block text-2xl font-normal text-neutral-500">
                  {en('common:server-error.page-subtitle', {
                    statusCode: isAppError(error) ? error.httpStatusCode : 500,
                  })}
                </small>
              </PageTitle>
              <p className="mb-8 text-lg text-gray-500">{en('common:server-error.page-message')}</p>
              {isAppError(error) && (
                <ul className="mb-4 list-disc pl-10 text-gray-800">
                  <li>
                    <Trans
                      t={en}
                      i18nKey="common:server-error.error-code"
                      components={{ span: <span className="font-mono" />, strong: <strong className="font-semibold" /> }}
                      values={{ errorCode: error.errorCode }}
                    />
                  </li>
                  <li>
                    <Trans
                      t={en}
                      i18nKey="common:server-error.correlation-id"
                      components={{ span: <span className="font-mono" />, strong: <strong className="font-semibold" /> }}
                      values={{ correlationId: error.correlationId }}
                    />
                  </li>
                </ul>
              )}
              <AppLink
                className="text-slate-700 underline hover:text-blue-700 focus:text-blue-700"
                file="routes/index.tsx"
                lang="en"
              >
                {en('common:return-to-dashboard')}
              </AppLink>
            </div>
            <div id="french" lang="fr">
              <PageTitle className="my-8">
                <span>{fr('common:server-error.page-title')}</span>
                <small className="block text-2xl font-normal text-neutral-500">
                  {fr('common:server-error.page-subtitle', {
                    statusCode: isAppError(error) ? error.httpStatusCode : 500,
                  })}
                </small>
              </PageTitle>
              <p className="mb-8 text-lg text-gray-500">{fr('common:server-error.page-message')}</p>
              {isAppError(error) && (
                <ul className="mb-4 list-disc pl-10 text-gray-800">
                  <li>
                    <Trans
                      t={fr}
                      i18nKey="common:server-error.error-code"
                      components={{ span: <span className="font-mono" />, strong: <strong className="font-semibold" /> }}
                      values={{ errorCode: error.errorCode }}
                    />
                  </li>
                  <li>
                    <Trans
                      t={fr}
                      i18nKey="common:server-error.correlation-id"
                      components={{ span: <span className="font-mono" />, strong: <strong className="font-semibold" /> }}
                      values={{ correlationId: error.correlationId }}
                    />
                  </li>
                </ul>
              )}
              <AppLink
                className="text-slate-700 underline hover:text-blue-700 focus:text-blue-700"
                file="routes/index.tsx"
                lang="fr"
              >
                {fr('common:return-to-dashboard')}
              </AppLink>
            </div>
          </div>
        </main>
        <footer id="wb-info" tabIndex={-1} className="mt-8 bg-stone-50 print:hidden">
          <div className="container flex items-center justify-end gap-6 py-2.5 sm:py-3.5">
            <div>
              <h2 className="sr-only">
                <span lang="en">{en('common:footer.about-site')}</span>
                {' / '}
                <span lang="fr">{fr('common:footer.about-site')}</span>
              </h2>
              <div>
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
        </footer>
        <Scripts nonce={loaderData?.nonce} />
        <script //
          nonce={loaderData?.nonce}
          src={`/api/client-env?v=${loaderData?.clientEnvRevision}`}
          suppressHydrationWarning={true}
        />
      </body>
    </html>
  );
}

/**
 * A bilingual 404 page that renders appropriate error messages in both languages.
 */
export function BilingualNotFound({ actionData, error, loaderData, params }: Route.ErrorBoundaryProps) {
  const { i18n } = useTranslation(['common']);
  const en = i18n.getFixedT('en');
  const fr = i18n.getFixedT('fr');

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="border-b-[3px] border-slate-700 print:hidden">
          <div id="wb-bnr">
            <div className="container flex items-center justify-between gap-6 py-2.5 sm:py-3.5">
              <AppLink to="https://canada.ca/">
                <img
                  className="h-8 w-auto"
                  src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-en.svg"
                  alt={en('common:header.govt-of-canada.text')}
                  width="300"
                  height="28"
                  decoding="async"
                />
                <span className="sr-only">
                  / <span lang="fr">{fr('common:header.govt-of-canada.text')}</span>
                </span>
              </AppLink>
            </div>
          </div>
        </header>
        <main className="container">
          <div className="mb-4 grid grid-cols-1 gap-6 py-2.5 sm:grid-cols-2 sm:py-3.5">
            <div id="english" lang="en">
              <PageTitle className="my-8">
                <span>{en('common:not-found.page-title')}</span>
                <small className="block text-2xl font-normal text-neutral-500">{en('common:not-found.page-subtitle')}</small>
              </PageTitle>
              <p className="mb-8 text-lg text-gray-500">{en('common:not-found.page-message')}</p>
              <AppLink
                className="text-slate-700 underline hover:text-blue-700 focus:text-blue-700"
                file="routes/index.tsx"
                lang="en"
              >
                {en('common:return-to-dashboard')}
              </AppLink>
            </div>
            <div id="french" lang="fr">
              <PageTitle className="my-8">
                <span>{fr('common:not-found.page-title')}</span>
                <small className="block text-2xl font-normal text-neutral-500">{fr('common:not-found.page-subtitle')}</small>
              </PageTitle>
              <p className="mb-8 text-lg text-gray-500">{fr('common:not-found.page-message')}</p>
              <AppLink
                className="text-slate-700 underline hover:text-blue-700 focus:text-blue-700"
                file="routes/index.tsx"
                lang="fr"
              >
                {fr('common:return-to-dashboard')}
              </AppLink>
            </div>
          </div>
        </main>
        <footer id="wb-info" tabIndex={-1} className="bg-stone-50 print:hidden">
          <div className="container flex items-center justify-end gap-6 py-2.5 sm:py-3.5">
            <div>
              <h2 className="sr-only">
                <span lang="en">{en('common:footer.about-site')}</span>
                {' / '}
                <span lang="fr">{fr('common:footer.about-site')}</span>
              </h2>
              <div>
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
        </footer>
        <Scripts nonce={loaderData?.nonce} />
        <script //
          nonce={loaderData?.nonce}
          src={`/api/client-env?v=${loaderData?.clientEnvRevision}`}
          suppressHydrationWarning={true}
        />
      </body>
    </html>
  );
}

/**
 * A unilingual error boundary that renders appropriate error messages in the current language.
 *
 * **Important Note:**
 *
 * React Router error boundaries should be designed to be as robust as possible.
 * If an error boundary itself throws an error, there's no subsequent error
 * boundary to catch and render it, potentially leading to infinite error loops.
 */
export function UnilingualErrorBoundary({ actionData, error, loaderData, params }: Route.ErrorBoundaryProps) {
  const { t, i18n } = useTranslation(['common']);
  const currentLanguage = i18n.language;

  return (
    <html lang={currentLanguage}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="border-b-[3px] border-slate-700 print:hidden">
          <div id="wb-bnr">
            <div className="container mb-4 flex items-center justify-between gap-6 py-2.5 sm:py-3.5">
              <AppLink to="https://canada.ca/">
                <img
                  className="h-8 w-auto"
                  src={`https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-${currentLanguage}.svg`}
                  alt={t('common:header.govt-of-canada.text')}
                  width="300"
                  height="28"
                  decoding="async"
                />
              </AppLink>
            </div>
          </div>
        </header>
        <main className="container">
          <PageTitle className="my-8">
            <span>{t('common:server-error.page-title')}</span>
            <small className="block text-2xl font-normal text-neutral-500">
              {t('common:server-error.page-subtitle', { statusCode: isAppError(error) ? error.httpStatusCode : 500 })}
            </small>
          </PageTitle>
          <p className="mb-8 text-lg text-gray-500">{t('common:server-error.page-message')}</p>
          {isAppError(error) && (
            <ul className="mb-4 list-disc pl-10 text-gray-800">
              <li>
                <Trans
                  i18nKey="common:server-error.error-code"
                  components={{ span: <span className="font-mono" />, strong: <strong className="font-semibold" /> }}
                  values={{ errorCode: error.errorCode }}
                />
              </li>
              <li>
                <Trans
                  i18nKey="common:server-error.correlation-id"
                  components={{ span: <span className="font-mono" />, strong: <strong className="font-semibold" /> }}
                  values={{ correlationId: error.correlationId }}
                />
              </li>
            </ul>
          )}
          <AppLink className="text-slate-700 underline hover:text-blue-700 focus:text-blue-700" file="routes/index.tsx">
            {t('common:return-to-dashboard')}
          </AppLink>
        </main>
        <footer id="wb-info" tabIndex={-1} className="mt-8 bg-stone-50 print:hidden">
          <div className="container flex items-center justify-end gap-6 py-2.5 sm:py-3.5">
            <div>
              <h2 className="sr-only">{t('common:footer.about-site')}</h2>
              <div>
                <img
                  src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/wmms-blk.svg"
                  alt={t('common:footer.gc-symbol')}
                  width={300}
                  height={71}
                  className="h-10 w-auto"
                />
              </div>
            </div>
          </div>
        </footer>
        <Scripts nonce={loaderData?.nonce} />
        <script //
          nonce={loaderData?.nonce}
          src={`/api/client-env?v=${loaderData?.clientEnvRevision}`}
          suppressHydrationWarning={true}
        />
      </body>
    </html>
  );
}

/**
 * A unilingual 404 page that renders appropriate error messages in the current language.
 */
export function UnilingualNotFound({ actionData, error, loaderData, params }: Route.ErrorBoundaryProps) {
  const { t, i18n } = useTranslation(['common']);
  const currentLanguage = i18n.language;

  return (
    <html lang={currentLanguage}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="border-b-[3px] border-slate-700 print:hidden">
          <div id="wb-bnr">
            <div className="container flex items-center justify-between gap-6 py-2.5 sm:py-3.5">
              <AppLink to="https://canada.ca/">
                <img
                  className="h-8 w-auto"
                  src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-en.svg"
                  alt={t('common:header.govt-of-canada.text')}
                  width="300"
                  height="28"
                  decoding="async"
                />
              </AppLink>
            </div>
          </div>
        </header>
        <main className="container mb-4">
          <PageTitle className="my-8">
            <span>{t('common:not-found.page-title')}</span>
            <small className="block text-2xl font-normal text-neutral-500">{t('common:not-found.page-subtitle')}</small>
          </PageTitle>
          <p className="mb-8 text-lg text-gray-500">{t('common:not-found.page-message')}</p>
          <AppLink className="text-slate-700 underline hover:text-blue-700 focus:text-blue-700" file="routes/index.tsx">
            {t('common:return-to-dashboard')}
          </AppLink>
        </main>
        <footer id="wb-info" tabIndex={-1} className="bg-stone-50 print:hidden">
          <div className="container flex items-center justify-end gap-6 py-2.5 sm:py-3.5">
            <div>
              <h2 className="sr-only">{t('common:footer.about-site')}</h2>
              <div>
                <img
                  src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/wmms-blk.svg"
                  alt={t('common:footer.gc-symbol')}
                  width={300}
                  height={71}
                  className="h-10 w-auto"
                />
              </div>
            </div>
          </div>
        </footer>
        <Scripts nonce={loaderData?.nonce} />
        <script //
          nonce={loaderData?.nonce}
          src={`/api/client-env?v=${loaderData?.clientEnvRevision}`}
          suppressHydrationWarning={true}
        />
      </body>
    </html>
  );
}
