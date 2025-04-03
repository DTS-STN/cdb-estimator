import type { ComponentProps } from 'react';

import { useLocation, useParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import { InlineLink } from '~/components/links';
import { useRoute } from '~/hooks/use-route';
import type { I18nRouteFile } from '~/i18n-routes';
import { getAltLanguage } from '~/utils/i18n-utils';

type LanguageSwitcherProps = OmitStrict<
  ComponentProps<typeof InlineLink>,
  'file' | 'lang' | 'params' | 'reloadDocument' | 'search' | 'to'
>;

export function LanguageSwitcher({ className, children, ...props }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const altLanguage = getAltLanguage(i18n.language);
  const { search } = useLocation();
  const { file } = useRoute();
  const params = useParams();

  return (
    <InlineLink
      className={className}
      file={file as I18nRouteFile}
      lang={altLanguage}
      onClick={async () => {
        // Match the i18n language to the route change
        await i18n.changeLanguage(altLanguage);
      }}
      params={params}
      reloadDocument={false}
      search={search}
      {...props}
    >
      {children}
    </InlineLink>
  );
}
