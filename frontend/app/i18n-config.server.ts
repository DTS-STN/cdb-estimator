import type { i18n, KeyPrefix, Namespace, TFunction } from 'i18next';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { serverEnvironment } from '~/.server/environment';
import type { I18nResources } from '~/.server/locales';
import { i18nResources } from '~/.server/locales';
import { AppError } from '~/errors/app-error';
import { ErrorCodes } from '~/errors/error-codes';
import { DEFAULT_LANGUAGE, getLanguageFromResource, SUPPORTED_LANGUAGES } from '~/utils/i18n-utils';

/**
 * Gets a fixed translation function for a given language and namespace.
 *
 * @param languageOrRequest - The language code or Request object to get the language from.
 * @param namespace - The namespace to get the translation function for.
 * @param keyPrefix - The key prefix to use for the translation function.
 * @returns A translation function for the given language and namespace.
 */
export async function getFixedT<NS extends Namespace, TKPrefix extends KeyPrefix<NS> = undefined>(
  languageOrRequest: Language | Request,
  namespace: NS,
  keyPrefix?: TKPrefix,
): Promise<TFunction<NS, TKPrefix>> {
  const isRequest = languageOrRequest instanceof Request;

  const lang =
    (isRequest //
      ? getLanguageFromResource(new URL(languageOrRequest.url))
      : languageOrRequest) ?? DEFAULT_LANGUAGE;

  const i18n = await initI18next(lang);
  return i18n.getFixedT(lang, namespace, keyPrefix);
}

/**
 * Similar to react-i18next's `useTranslation()` hook, this function will return a `t`
 * function and a `lang` value that represents the current language.
 *
 * @param languageOrRequest - The language code or Request object to get the language from.
 * @param namespace - The namespace to get the translation function for.
 * @param keyPrefix - The key prefix to use for the translation function.
 * @returns A Promise resolving to an object containing the language code (`lang`) and a translation function (`t`) for the given namespace.
 */
export async function getTranslation<NS extends Namespace, TKPrefix extends KeyPrefix<NS> = undefined>(
  languageOrRequest: Language | Request,
  namespace: NS,
  keyPrefix?: TKPrefix,
): Promise<{ lang: Language; t: TFunction<NS, TKPrefix> }> {
  const isRequest = languageOrRequest instanceof Request;

  const lang =
    (isRequest //
      ? getLanguageFromResource(new URL(languageOrRequest.url))
      : languageOrRequest) ?? DEFAULT_LANGUAGE;

  return { lang, t: await getFixedT(lang, namespace, keyPrefix) };
}

/**
 * Creates and initializes an i18next instance for server-side rendering.
 */
export async function initI18next(language?: Language): Promise<i18n> {
  const { I18NEXT_DEBUG: debug } = serverEnvironment;

  const i18n = createInstance() //
    .use(initReactI18next);

  const namespaces = getNamespaces(i18nResources);

  await i18n.init({
    debug: debug,
    defaultNS: 'common',
    fallbackLng: DEFAULT_LANGUAGE,
    lng: language,
    preload: [...SUPPORTED_LANGUAGES],
    supportedLngs: [...SUPPORTED_LANGUAGES],
    ns: namespaces,
    resources: i18nResources,
    interpolation: { escapeValue: false },
    appendNamespaceToMissingKey: true,
    parseMissingKeyHandler: (key) => {
      throw new AppError(`Missing translation key: ${key}`, ErrorCodes.MISSING_TRANSLATION_KEY);
    },
    react: {
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'b', 'em', 'dl', 'dt', 'dd'],
    },
  });

  return i18n as i18n;
}

function getNamespaces<T extends I18nResources, U extends keyof T['en']>(resources: T): U[] {
  return Object.keys(resources.en) as U[];
}
