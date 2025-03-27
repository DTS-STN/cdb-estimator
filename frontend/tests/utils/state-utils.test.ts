import { describe, expect, it } from 'vitest';

import type { I18nRouteFile } from '~/i18n-routes';
import type { CDBEstimator } from '~/routes/estimator/@types';
import { estimatorStepGate } from '~/utils/state-utils';

describe('state-utils', () => {
  describe('estimatorStepGate', () => {
    it.each(
      new Array<{ state: Partial<CDBEstimator>; url: string; route: I18nRouteFile }>(
        {
          state: {},
          url: '/en/age',
          route: 'routes/estimator/step-age.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
          },
          url: '/en/age',
          route: 'routes/estimator/step-age.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
            maritalStatus: 'single-divorced-separated-or-widowed',
          },
          url: '/en/age',
          route: 'routes/estimator/step-age.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
            maritalStatus: 'single-divorced-separated-or-widowed',
            income: { kind: 'single', netIncome: 0, workingIncome: 0 },
          },
          url: '/en/age',
          route: 'routes/estimator/step-age.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
          },
          url: '/en/marital-status',
          route: 'routes/estimator/step-marital-status.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
            maritalStatus: 'single-divorced-separated-or-widowed',
          },
          url: '/en/marital-status',
          route: 'routes/estimator/step-marital-status.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
            maritalStatus: 'single-divorced-separated-or-widowed',
            income: { kind: 'single', netIncome: 0, workingIncome: 0 },
          },
          url: '/en/marital-status',
          route: 'routes/estimator/step-marital-status.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
            maritalStatus: 'single-divorced-separated-or-widowed',
          },
          url: '/en/income',
          route: 'routes/estimator/step-income.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
            maritalStatus: 'single-divorced-separated-or-widowed',
            income: { kind: 'single', netIncome: 0, workingIncome: 0 },
          },
          url: '/en/income',
          route: 'routes/estimator/step-income.tsx',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
            maritalStatus: 'single-divorced-separated-or-widowed',
            income: { kind: 'single', netIncome: 0, workingIncome: 0 },
          },
          url: '/en/results',
          route: 'routes/estimator/results.tsx',
        },
      ),
    )('should not throw for a valid state and valid route combo', ({ state, url, route }) => {
      const request = new Request(`http://localhost:3000${url}`);
      expect(() => estimatorStepGate(state, route, request)).does.not.Throw();
    });

    it.each(
      new Array<{ state: Partial<CDBEstimator>; url: string; route: I18nRouteFile; expectedRedirect: string }>(
        {
          state: {},
          url: '/en/marital-status',
          route: 'routes/estimator/step-marital-status.tsx',
          expectedRedirect: '/en/age',
        },
        {
          state: {},
          url: '/en/income',
          route: 'routes/estimator/step-income.tsx',
          expectedRedirect: '/en/age',
        },
        {
          state: {},
          url: '/en/results',
          route: 'routes/estimator/results.tsx',
          expectedRedirect: '/en/age',
        },
        {
          state: { dateOfBirth: { month: 5, year: 1999 } },
          url: '/en/results',
          route: 'routes/estimator/results.tsx',
          expectedRedirect: '/en/marital-status',
        },
        {
          state: {
            dateOfBirth: { month: 5, year: 1999 },
            maritalStatus: 'married-or-common-law',
          },
          url: '/en/results',
          route: 'routes/estimator/results.tsx',
          expectedRedirect: '/en/income',
        },
      ),
    )(
      'should throw the correct route file for a given state, target url, target route file',
      ({ state, url, route, expectedRedirect }) => {
        const request = new Request(`http://localhost:3000${url}`);
        expect(() => estimatorStepGate(state, route, request)).toThrow(
          expect.objectContaining({
            [Symbol('state')]: {
              headersList: {
                [Symbol('headers map')]: new Map<string, { name: string; value: string }>([
                  ['location', { name: 'Location', value: expectedRedirect }],
                ]),
              },
            },
          }),
        );
      },
    );
  });
});
