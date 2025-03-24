import type { KeyPrefix, Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';

import { useLanguage } from './use-language';

export function useErrorTranslation<NS extends Namespace, TKPrefix extends KeyPrefix<NS> = undefined>(
  ns: Namespace,
  keyPrefix: TKPrefix,
) {
  const { i18n } = useTranslation(ns);
  const { currentLanguage } = useLanguage();

  return (keySuffix?: string) => {
    if (keySuffix === undefined) return undefined;

    if (i18n.exists(`${ns}:${keyPrefix ? keyPrefix.toString() + '.' : ''}${keySuffix}`)) {
      return i18n.getResource(
        currentLanguage?.toString() ?? 'en',
        ns.toString(),
        `${keyPrefix ? keyPrefix.toString() + '.' : ''}${keySuffix}`,
      );
    }
    return undefined;
  };
}
