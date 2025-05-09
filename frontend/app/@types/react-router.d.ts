import 'react-router';

import type { Namespace } from 'i18next';

import type { BreadcrumbItem } from '~/components/breadcrumbs';

declare module 'react-router' {
  interface AppLoadContext {
    nonce: string;
    session: AppSession;
  }

  /**
   * Route handles should export an i18n namespace, if necessary.
   */
  interface RouteHandle {
    breadcrumbs: BreadcrumbItem[];
    i18nNamespace?: Namespace;
  }

  /**
   * A route module exports an optional RouteHandle.
   */
  interface RouteModule {
    handle?: RouteHandle;
  }

  /**
   * Override the default React Router RouteModules
   * to include the new RouteModule type.
   */
  interface RouteModules extends Record<string, RouteModule | undefined> {}
}

export {};
