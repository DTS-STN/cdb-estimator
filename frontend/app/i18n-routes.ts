/*
 *
 * This file defines the structure and types for internationalized (i18n) routes.
 * It provides a way to represent routes with different paths for different languages.
 *
 * The `i18nRoutes` constant holds the configuration for these routes, which are then
 * transformed into react-router `RouteConfigEntry` objects in `routes.ts`. This
 * separation allows the i18n route definitions to be imported and used in client-side
 * code when generating links.
 *
 */

/**
 * Represents a record of paths for different languages.
 * Key: Language code (e.g., 'en', 'fr').
 * Value: A path for that language (ex: /en/about or /fr/a-propos).
 */
type I18nPaths = Record<Language, string>;

/**
 * A utility typpe that extracts the file path from an I18nPageRoute type.
 * @template T - The type to extract the file from.
 */
type ExtractI18nRouteFile<T> = T extends I18nPageRoute ? T['file'] : never;

/**
 * A utility type that recursively extracts all file paths from an array of I18nRoute objects.
 * @template T - The type of the I18nRoute array.
 */
type ExtractI18nRouteFiles<T> = T extends I18nLayoutRoute
  ? ExtractI18nRouteFiles<T['children'][number]>
  : ExtractI18nRouteFile<T>;

/**
 * Represents a route that can be either a layout route or a page route.
 */
export type I18nRoute = I18nLayoutRoute | I18nPageRoute;

/**
 * Represents a layout route, which contains other routes as children.
 * @property file - The file path for the layout component.
 * @property children - An array of child I18nRoute objects.
 */
export type I18nLayoutRoute = { file: string; children: I18nRoute[] };

/**
 * Represents a page route, which has specific paths for different languages.
 * @property id - A unique identifier for the route.
 * @property file - The file path for the page component.
 * @property paths - An I18nPaths object containing paths for different languages.
 */
export type I18nPageRoute = { id: string; file: string; paths: I18nPaths };

/**
 * Represents all file paths used in the i18n routes.
 */
export type I18nRouteFile = ExtractI18nRouteFiles<(typeof i18nRoutes)[number]>;

/**
 * Type guard to determine if a route is an I18nLayoutRoute.
 * @param obj - The object to check.
 * @returns `true` if the object is an I18nLayoutRoute, `false` otherwise.
 */
export function isI18nLayoutRoute(obj: unknown): obj is I18nLayoutRoute {
  return obj !== null && typeof obj === 'object' && 'file' in obj && 'children' in obj;
}

/**
 * Type guard to determine if a route is an I18nPageRoute.
 * @param obj - The object to check.
 * @returns `true` if the object is an I18nPageRoute, `false` otherwise.
 */
export function isI18nPageRoute(obj: unknown): obj is I18nPageRoute {
  return obj !== null && typeof obj === 'object' && 'file' in obj && 'paths' in obj;
}

/**
 * Bilingual routes are declared in an I18nRoute[] object so the
 * filenames can be extracted and strongly typed as I18nPageRouteId
 *
 * These routes exist in a separate module from routes.ts so they can
 * be imported into clientside code without triggering side effects.
 */
export const i18nRoutes = [
  //
  // Publicly accessable routes
  //
  {
    file: 'routes/layout.tsx',
    children: [
      {
        id: 'PUBL-0001',
        file: 'routes/index.tsx',
        paths: { en: '/en', fr: '/fr' },
      },
      {
        file: 'routes/estimator/layout.tsx',
        children: [
          {
            id: 'EST-0001',
            file: 'routes/estimator/step-age.tsx',
            paths: { en: '/en/age', fr: '/fr/age' },
          },
          {
            id: 'EST-0002',
            file: 'routes/estimator/step-residency.tsx',
            paths: { en: '/en/residency', fr: '/fr/residence' },
          },
          {
            id: 'EST-0003',
            file: 'routes/estimator/step-status-in-canada.tsx',
            paths: { en: '/en/status-in-canada', fr: '/fr/statut-au-canada' },
          },
          {
            id: 'EST-0004',
            file: 'routes/estimator/step-incarceration.tsx',
            paths: { en: '/en/incarceration', fr: '/fr/incarceration' },
          },
          {
            id: 'EST-0005',
            file: 'routes/estimator/step-marital-status.tsx',
            paths: { en: '/en/marital-status', fr: '/fr/etat-civil' },
          },
          {
            id: 'EST-0006',
            file: 'routes/estimator/step-disability-tax-credit.tsx',
            paths: { en: '/en/disability-tax-credit', fr: '/fr/credit-impot-personnes-handicapees' },
          },
          {
            id: 'EST-0007',
            file: 'routes/estimator/step-income-tax-return.tsx',
            paths: { en: '/en/income-tax-return', fr: '/fr/declaration-de-revenus' },
          },
          {
            id: 'EST-0008',
            file: 'routes/estimator/step-income.tsx',
            paths: { en: '/en/income', fr: '/fr/revenus' },
          },
          {
            id: 'EST-0009',
            file: 'routes/estimator/results.tsx',
            paths: { en: '/en/results', fr: '/fr/resultats' },
          },
        ],
      },
    ],
  },
] as const satisfies I18nRoute[];
