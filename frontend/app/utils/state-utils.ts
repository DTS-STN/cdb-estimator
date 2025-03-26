import { i18nRedirect } from '~/.server/utils/route-utils';
import type { I18nRouteFile } from '~/i18n-routes';
import type { CDBEstimator } from '~/routes/estimator/@types';

export type StateField = keyof CDBEstimator;

/**
 * defines a mapping of route files to StateField. is used to determine which state fields to check for when attempting to load a given route
 */
const stateMap = new Map<I18nRouteFile, StateField | undefined>([
  ['routes/estimator/step-age.tsx', 'dateOfBirth'],
  ['routes/estimator/step-marital-status.tsx', 'maritalStatus'],
  ['routes/estimator/step-income.tsx', 'income'],
  ['routes/estimator/results.tsx', undefined],
]);

/**
 *
 * @param state CDBEstimator state
 * @param targetRouteFile Route file the application is testing for
 * @returns
 */
export function getStateRoute(state: Partial<CDBEstimator> | undefined, targetRouteFile: I18nRouteFile): I18nRouteFile {
  for (const [route, stateField] of stateMap) {
    // if the state is undefined, return the first route
    if (state === undefined) {
      return route;
    }
    //if a state field is specified and is not defined in the state, return the route
    if (stateField !== undefined && state[stateField] === undefined) {
      return route;
    }
    //if the route matches the target route, stop iterating and return the route
    if (route === targetRouteFile) {
      return route;
    }
  }
  //default (no matches): return the target route
  return targetRouteFile;
}

/**
 * Automatically redirect to the appropriate route for a given state and the target route file
 */
export function estimatorStepGate(state: Partial<CDBEstimator> | undefined, targetRoute: I18nRouteFile, request: Request) {
  const stateRoute = getStateRoute(state, targetRoute);
  if (stateRoute !== targetRoute) {
    throw i18nRedirect(stateRoute, request);
  }
}
