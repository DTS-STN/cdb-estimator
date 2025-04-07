import { describe, it, expect, beforeAll } from 'vitest';

import type { SingleIncome } from '~/routes/estimator/@types';
import { calculateEstimation } from '~/utils/cdb-calculator';

// Mock global environment
beforeAll(() => {
  globalThis.__appEnvironment = {
    ...globalThis.__appEnvironment,
    ESTIMATOR_INFLATION_FACTOR: 1,
    ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION: 10000,
    ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION: 14000,
    ESTIMATOR_COUPLE_THRESHOLD: 32500,
    ESTIMATOR_SINGLE_THRESHOLD: 23000,
    ESTIMATOR_YEARLY_MAX_BENEFITS: 2400,
    ESTIMATOR_BENEFIT_REDUCTION_RATE: 0.2,
    ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE: 0.1,
  };
});

describe('calculateEstimation', () => {
  it('returns full benefit for single income well below threshold', () => {
    const singleIncome: SingleIncome = {
      kind: 'single',
      netIncome: 20000,
      claimedIncome: 2000,
      claimedRepayment: 1000,
      workingIncome: 3000,
    };

    const result = calculateEstimation(singleIncome);

    expect(result.kind).toBe('single');
    expect(result.estimation).toBeCloseTo(200);
  });
});
