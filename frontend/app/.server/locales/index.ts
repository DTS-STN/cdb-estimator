import gcwebEn from '~/.server/locales/gcweb-en.json';
import gcwebFr from '~/.server/locales/gcweb-fr.json';
import publicEn from '~/.server/locales/public-en.json';
import publicFr from '~/.server/locales/public-fr.json';

export const i18nResourcesEn = {
  gcweb: gcwebEn,
  public: publicEn,
} as const;

export const i18nResourcesFr = {
  gcweb: gcwebFr,
  public: publicFr,
} as const;

export const i18nResources = {
  en: i18nResourcesEn,
  fr: i18nResourcesFr,
} as const satisfies Record<Language, typeof i18nResourcesEn>;

export type I18nResources = typeof i18nResources;
