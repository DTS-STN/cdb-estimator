import type { RouteConfigEntry } from '@react-router/dev/routes';
import { index, layout, route } from '@react-router/dev/routes';

// important: we cannot use aliased imports (~/) here 🤷
import type { I18nPageRoute, I18nRoute } from './i18n-routes';
import { i18nRoutes, isI18nPageRoute } from './i18n-routes';

/**
 * Generates an array of route config entries for different languages
 * based on a given file and i18n paths.
 *
 * @param i18nPageRoute - The i18n route to generate the route config entry from.
 * @returns An array of route config entries.
 */
function i18nPageRoutes(i18nPageRoute: I18nPageRoute): RouteConfigEntry[] {
  return Object.entries(i18nPageRoute.paths).map(([language, path]) => {
    const id = `${i18nPageRoute.id}-${language.toUpperCase()}`;
    return route(path, i18nPageRoute.file, { id: id });
  });
}

/**
 * Recursive function that converts an I18nRoute[] to a RouteConfigEntry[]
 * that can be used by React Router.
 *
 * @param routes - The array of i18n route definitions.
 * @returns An array of React Router route configuration entries.
 */
export function toRouteConfigEntries(routes: I18nRoute[]): RouteConfigEntry[] {
  return routes.flatMap((route) => {
    return isI18nPageRoute(route)
      ? i18nPageRoutes(route) //
      : layout(route.file, toRouteConfigEntries(route.children));
  });
}

export default [
  index('routes/splash.tsx'), // Language selection page
  route('*', 'routes/not-found.tsx'),

  // API routes
  route('/api/readyz', 'routes/api/readyz.ts'),
  route('/api/buildinfo', 'routes/api/buildinfo.ts'),
  route('/api/client-env', 'routes/api/client-env.ts'),
  route('/api/health', 'routes/api/health.ts'),
  route('/api/translations', 'routes/api/translations.ts'),

  // i18n routes
  ...toRouteConfigEntries(i18nRoutes),

  // dev/test-only routes
  route('/debug-session', 'routes/dev/debug-session.tsx', { id: 'DEV-0001' }),
  route('/error', 'routes/dev/error.tsx', { id: 'ERR-0001' }),
  route('/en/error', 'routes/dev/error.tsx', { id: 'ERR-0001-EN' }),
  route('/fr/erreur', 'routes/dev/error.tsx', { id: 'ERR-0001-FR' }),
  route('/stage-session', 'routes/dev/stage-session.tsx', { id: 'DEV-0002' }),
] satisfies RouteConfigEntry[];
