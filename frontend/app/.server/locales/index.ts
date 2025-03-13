import commonEn from '~/.server/locales/common-en.json';
import commonFr from '~/.server/locales/common-fr.json';
import estimatorEn from '~/.server/locales/estimator-en.json';
import estimatorFr from '~/.server/locales/estimator-fr.json';

export const i18nResourcesEn = {
  common: commonEn,
  estimator: estimatorEn,
} as const;

export const i18nResourcesFr = {
  common: commonFr,
  estimator: estimatorFr,
} as const;

export const i18nResources = {
  en: i18nResourcesEn,
  fr: i18nResourcesFr,
} as const satisfies Record<Language, typeof i18nResourcesEn>;

export type I18nResources = typeof i18nResources;
