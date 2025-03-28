import type { ReactNode } from 'react';

import type { Params, Path, To } from 'react-router';

import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { ResourceKey, TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { InlineLink } from './links';

import { useLanguage } from '~/hooks/use-language';
import type { I18nRouteFile } from '~/i18n-routes';
import * as adobeAnalytics from '~/utils/adobe-analytics-utils';

export interface BreadcrumbRouteLink {
  file: I18nRouteFile;
  hash?: Path['hash'];
  lang?: Language;
  params?: Params;
  search?: Path['search'];
}

export interface BreadcrumbItem {
  labelKey?: ResourceKey;
  label?: { fr: string; en: string };
  destinationRoute?: BreadcrumbRouteLink;
  destination?: { en: To; fr: To };
}

export interface BreadcrumbsProps {
  className?: string;
  items: BreadcrumbItem[];
}

function getLabel(item: BreadcrumbItem, t: TFunction<['common'], undefined>, currentLanguage?: Language) {
  if (item.labelKey !== undefined) {
    return t(item.labelKey);
  }
  return currentLanguage === 'fr' ? item.label?.fr : item.label?.en;
}

function getDestination(item: BreadcrumbItem, currentLanguage?: Language) {
  if (item.destinationRoute !== undefined) {
    return item.destinationRoute;
  }
  return currentLanguage === 'fr' ? item.destination?.fr : item.destination?.en;
}

export function Breadcrumbs({ className, items }: BreadcrumbsProps) {
  const { t } = useTranslation(['common']);
  const { currentLanguage } = useLanguage();

  return (
    <nav id="wb-bc" className={className} property="breadcrumb" aria-labelledby="breadcrumbs">
      <h2 id="breadcrumbs" className="sr-only">
        {t('common:breadcrumbs.you-are-here')}
      </h2>
      <div className="container">
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-1" typeof="BreadcrumbList">
          {items.map((item, idx) => {
            const label = getLabel(item, t, currentLanguage);
            const destination = getDestination(item, currentLanguage);
            return (
              <li key={label} property="itemListElement" typeof="ListItem" className="flex items-center">
                {idx !== 0 && <FontAwesomeIcon icon={faChevronRight} className="mr-2 size-3 text-slate-700" />}
                <Breadcrumb
                  destination={destination}
                  data-gc-analytics-customclick={adobeAnalytics.getCustomClick(`Breadcrumb:${idx} link`)}
                >
                  {label}
                </Breadcrumb>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

function isBreadcrumbRouteLink(destination: To | BreadcrumbRouteLink): destination is BreadcrumbRouteLink {
  return typeof destination === 'object' && 'file' in destination;
}

function Breadcrumb({ children, destination, ...rest }: { children: ReactNode; destination?: To | BreadcrumbRouteLink }) {
  if (!destination) {
    return <span property="name">{children}</span>;
  }

  return isBreadcrumbRouteLink(destination) ? (
    <InlineLink
      file={destination.file}
      hash={destination.hash}
      params={destination.params}
      search={destination.search}
      property="item"
      typeof="WebPage"
      {...rest}
    >
      <span property="name">{children}</span>
    </InlineLink>
  ) : (
    <InlineLink to={destination} property="item" typeof="WebPage" {...rest}>
      <span property="name">{children}</span>
    </InlineLink>
  );
}
