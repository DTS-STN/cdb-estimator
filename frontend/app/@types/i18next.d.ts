import 'i18next';

import type { I18nResources } from '~/.server/locales';

/**
 * Augment the `i18next` namespace with our custom resource type definitions.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: I18nResources['en'];
  }
  interface i18n {
    // Override the 'language' property type with our custom type
    language: Language;
  }
}

export {};
