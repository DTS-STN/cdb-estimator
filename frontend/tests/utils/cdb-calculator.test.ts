import { describe, it, expect, beforeAll } from 'vitest';

import type { MarriedIncome, SingleIncome } from '~/routes/estimator/@types';
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
  it.each([
    {
      name: 'TC_001: Single with working income at zero',
      payload: {
        kind: 'single',
        individualIncome: {
          netIncome: 3000,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_002: Single with working income between $1,000-$9,000',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 15339, workingIncome: 1000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_003: Single with working income between $1,000-$9,000',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 31250, workingIncome: 9000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_004: Single with working income at exactly $10,000',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 31250, workingIncome: 10000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_005: Single with working income greater than $10,000',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 31250, workingIncome: 20000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_006: Single where working income is negative (farming incom was negative and applicant did not enter 0 as instructed)',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 0, workingIncome: -5000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_007: Married with working income at zero',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 13000, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 17000,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_008: Married with working income between $1,000-$13,000',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 15339, workingIncome: 11000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 9895.62,
          workingIncome: 5298,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_009: Married with working income between $1,000-$13,000',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 31250, workingIncome: 1000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 11589.45,
          workingIncome: 2500,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 86.01, estimationSplitBenefit: 143 },
    },
    {
      name: 'TC_010: Married with working income at exactly $14,000',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 31250, workingIncome: 5000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 11589.45,
          workingIncome: 9000,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_011: Married with working income greater than $14,000',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 31250, workingIncome: 7000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 11589.45,
          workingIncome: 9000,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_013: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 0, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_014: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 23000.3, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_015: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 10000.3, workingIncome: 10000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_016: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 33000.3, workingIncome: 15000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_017: Single - reduced payment by 0.01',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 23000.31, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_018: Single - reduced payment by 0.01',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 23000.31, workingIncome: 15000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_019: Single - reduced payment of $166.67/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 25000, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_020: Single - reduced payment of $166.67/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 27550, workingIncome: 2550, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_021: Single - reduced payment equalling $20/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 42821, workingIncome: 9021, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 20, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_022: Single - zero payment',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 44999.71, workingIncome: 22000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 0, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_023: Married - max monthly payment amount',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 0, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 0,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_024: Married - max monthly payment amount',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 15000, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 10000,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_025: Married - max monthly payment amount',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 15000, workingIncome: 10000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 10000,
          workingIncome: 2000,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_026: Married - max monthly payment amount',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 11999, workingIncome: 2500, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 19000,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_027: Married - reduced payment by 0.01',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 32500.7, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 0,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: 199.99 },
    },
    {
      name: 'TC_028: Married - reduced payment by 0.01',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 16250.35, workingIncome: 5000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 21250.35,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: 199.99 },
    },
    {
      name: 'TC_029: Married - reduced payment of $166.67/month for one of the estimate',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 18250, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 16250,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: 183.33 },
    },
    {
      name: 'TC_030: Married - reduced payment of $166.67/month for one of the estimate',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 20250, workingIncome: 2000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 17750,
          workingIncome: 1500,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: 183.33 },
    },
    {
      name: 'TC_031: Married - reduced payment equalling $20/month for one of the estimate',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 23250, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 20050,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 20, estimationSplitBenefit: 110 },
    },
    {
      name: 'TC_032: Married - zero payment for one of the estimate',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 8500, workingIncome: 4000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 50000,
          workingIncome: 10000,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 0, estimationSplitBenefit: 100 },
    },
    {
      name: 'TC_033: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 24879.48, workingIncome: 0, claimedIncome: 2152.12, claimedRepayment: 142.12 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_034: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 35000.3, workingIncome: 15000, claimedIncome: 2000, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_035: Single - reduced payment by 0.01',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 22875.06, workingIncome: 0, claimedIncome: 0, claimedRepayment: 125.25 },
      } as SingleIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_036: Single - reduced payment by 0.01',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 34000.3, workingIncome: 15000, claimedIncome: 999.99, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_037: Single - reduced payment of $166.67/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 25200.46, workingIncome: 0, claimedIncome: 1600.66, claimedRepayment: 1400.2 },
      } as SingleIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_038: Single - reduced payment equalling $20/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 43791.74, workingIncome: 9021, claimedIncome: 1100.99, claimedRepayment: 130.25 },
      } as SingleIncome,
      expected: { estimation: 20, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_039: Single - zero payment',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 36490.51, workingIncome: 0, claimedIncome: 1515.8, claimedRepayment: 25 },
      } as SingleIncome,
      expected: { estimation: 0, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_040: Married - max monthly payment amount',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 0, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 24897.48,
          workingIncome: 0,
          claimedIncome: 2152.12,
          claimedRepayment: 142.12,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_041: Married - max monthly payment amount',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 25000.3, workingIncome: 15000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 4500,
          workingIncome: 2500,
          claimedIncome: 2000,
          claimedRepayment: 142.12,
        },
      } as MarriedIncome,
      expected: { estimation: 200, estimationSplitBenefit: 200 },
    },
    {
      name: 'TC_042: Married - reduced payment by 0.01',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 16250.35, workingIncome: 5000, claimedIncome: 150, claimedRepayment: 150 },
        partnerIncome: {
          netIncome: 21250.35,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: 199.99 },
    },
    {
      name: 'TC_043: Married - reduced payment by 0.01',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 32511, workingIncome: 1010, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 0,
          workingIncome: 0,
          claimedIncome: 0,
          claimedRepayment: 999.7,
        },
      } as MarriedIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: 199.99 },
    },
    {
      name: 'TC_044: Married - reduced payment of $166.67/month for one of the estimate',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 25200.46, workingIncome: 0, claimedIncome: 1600.66, claimedRepayment: 1400.2 },
        partnerIncome: {
          netIncome: 21299.54,
          workingIncome: 11800,
          claimedIncome: 0,
          claimedRepayment: 0,
        },
      } as MarriedIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: 183.34 },
    },
    {
      name: 'TC_045: Married - reduced payment equalling $20/month for one of the estimate',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 43791, workingIncome: 9011, claimedIncome: 1100.99, claimedRepayment: 130.25 },
        partnerIncome: {
          netIncome: 12981,
          workingIncome: 4590.7,
          claimedIncome: 0,
          claimedRepayment: 1100.3,
        },
      } as MarriedIncome,
      expected: { estimation: 20, estimationSplitBenefit: 110 },
    },
    {
      name: 'TC_046: Married - zero payment for one of the estimates',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 43791, workingIncome: 0, claimedIncome: 2154.2, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 12981,
          workingIncome: 4590.7,
          claimedIncome: 1515.8,
          claimedRepayment: 1100.3,
        },
      } as MarriedIncome,
      expected: { estimation: 0, estimationSplitBenefit: 57.4 },
    },
  ])('$name', ({ payload, expected }) => {
    const result = calculateEstimation(payload);
    expect(result.estimation).toBeCloseTo(expected.estimation);
    if (expected.estimationSplitBenefit !== undefined) {
      expect(result.estimationSplitBenefit).toBeCloseTo(expected.estimationSplitBenefit);
    }
  });
});
