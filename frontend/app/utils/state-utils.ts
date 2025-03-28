import { i18nRedirect } from '~/.server/utils/route-utils';
import type { I18nRouteFile } from '~/i18n-routes';
import type { CDBEstimator } from '~/routes/estimator/@types';

export type StateField = keyof CDBEstimator;

/**
 * defines a mapping of route files to StateField. is used to determine which state fields to check for when attempting to load a given route
 */
const stateMap = new Map<I18nRouteFile, StateField[]>([
  ['routes/estimator/step-marital-status.tsx', []],
  ['routes/estimator/step-income.tsx', ['maritalStatus']],
  ['routes/estimator/results.tsx', ['maritalStatus', 'income']],
]);

/**
 *
 * @param state CDBEstimator state
 * @param targetRouteFile Route file the application is testing for
 * @returns
 */
function getStateRoute(state: Partial<CDBEstimator> | undefined, targetRouteFile: I18nRouteFile): I18nRouteFile {
  let routeCandidate = targetRouteFile;

  if (stateMap.has(targetRouteFile)) {
    for (const [route, stateFields] of stateMap) {
      // if the state is undefined, return the first route
      if (state === undefined) {
        return route;
      }
      // if stateFields is empty, the route is a result candidate
      if (stateFields.length === 0) {
        routeCandidate = route;
      }
      // if stateFields is not empty
      else {
        // check presence of all specified stateFields
        for (const stateField of stateFields) {
          if (state[stateField] === undefined) {
            // stop and return the last route candidate
            return routeCandidate;
          }
        }
        // assign a new route candidate
        routeCandidate = route;
      }
      //if the route candidate matches the target route, stop iterating
      if (routeCandidate === targetRouteFile) {
        break;
      }
    }
  }
  //default (no matches): return the target route
  return routeCandidate;
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
