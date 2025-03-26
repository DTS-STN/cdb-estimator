import type { ComponentProps } from 'react';

import { useLocation, useParams } from 'react-router';

import { useTranslation } from 'react-i18next';

import { InlineLink } from '~/components/links';
import { useLanguage } from '~/hooks/use-language';
import { useRoute } from '~/hooks/use-route';
import type { I18nRouteFile } from '~/i18n-routes';

type LanguageSwitcherProps = OmitStrict<
  ComponentProps<typeof InlineLink>,
  'file' | 'lang' | 'params' | 'reloadDocument' | 'search' | 'to'
>;

export function LanguageSwitcher({ className, children, ...props }: LanguageSwitcherProps) {
  const { altLanguage } = useLanguage();
  const { i18n } = useTranslation();
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
