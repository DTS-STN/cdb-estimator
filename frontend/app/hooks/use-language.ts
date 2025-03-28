import { useLocation } from 'react-router';

import { getAltLanguage, getLanguageFromResource } from '~/utils/i18n-utils';

type UseLanguageReturnType = { altLanguage?: Language; currentLanguage?: Language };

/**
 * A hook that returns the current language and its alternate language base on current location.
 *
 * @returns An object containing the current location language and the alternate language.
 */
export function useLanguageFromLocation(): UseLanguageReturnType {
  const { pathname } = useLocation();

  const currentLanguage = getLanguageFromResource(pathname);
  const altLanguage = currentLanguage && getAltLanguage(currentLanguage);

  return { altLanguage, currentLanguage };
}
