import type { RouteModule } from 'react-router';

import type { Namespace } from 'i18next';

/**
 * Define the supported language codes as a constant tuple.
 */
export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;

/**
 * Define the default language (must be one of the supported languages).
 */
export const DEFAULT_LANGUAGE: Language = 'en';

/**
 * Returns the i18n namespace required by the given routes by examining the route's i18nNamespace handle property.
 * @see https://reactrouter.com/start/framework/route-module#handle
 */
export function getI18nNamespace(routes?: RouteModule[]): Namespace {
  const i18nNamespace = routes?.flatMap((route) => route.handle?.i18nNamespace ?? []);
  return [...new Set(i18nNamespace)];
}

/**
 * Returns the language from the given request, URL, or path.
 *
 * @param resource - The request, URL, or path to extract the language from.
 * @returns The language code (`en` or `fr`), or `undefined` if the language cannot be determined.
 */
export function getLanguageFromResource(resource: Request | URL | string): Language | undefined {
  switch (true) {
    case resource instanceof Request: {
      return getLanguageFromPath(new URL(resource.url).pathname);
    }

    case resource instanceof URL: {
      return getLanguageFromPath(resource.pathname);
    }

    default: {
      return getLanguageFromPath(resource);
    }
  }
}

/**
 * Returns the alternate language for the given input language.
 * (ie: 'en' → 'fr'; 'fr' → 'en')
 */
export function getAltLanguage(language: Language): Language {
  return language === 'fr' ? 'en' : 'fr';
}

function getLanguageFromPath(pathname: string): Language | undefined {
  switch (true) {
    case pathname === '/en' || pathname.startsWith('/en/'): {
      return 'en';
    }

    case pathname === '/fr' || pathname.startsWith('/fr/'): {
      return 'fr';
    }

    default: {
      return undefined;
    }
  }
}
