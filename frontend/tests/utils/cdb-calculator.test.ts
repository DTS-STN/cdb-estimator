import { describe, it, expect, beforeAll } from 'vitest';

import type { MarriedIncome, PersonIncome, SingleIncome } from '~/routes/estimator/@types';
import { calculateEstimation, calculateTotalIncome } from '~/utils/cdb-calculator';

describe('calculateTotalIncome', () => {
  it.each([
    {
      name: 'UCCB|RDSP income > netIncome',
      income: {
        netIncome: 0,
        claimedIncome: 10,
      } as PersonIncome,
      expected: 0,
    },
    {
      name: 'UCCB|RDSP income < netIncome',
      income: {
        netIncome: 100,
        claimedIncome: 10,
      } as PersonIncome,
      expected: 90,
    },
    {
      name: 'UCCB|RDSP repayment AND netIncome',
      income: {
        netIncome: 100,
        claimedRepayment: 10,
      } as PersonIncome,
      expected: 110,
    },
    {
      name: 'UCCB|RDSP income > UCCB|RDSP repayment',
      income: {
        netIncome: 0,
        claimedIncome: 20,
        claimedRepayment: 10,
      } as PersonIncome,
      expected: 0,
    },
    {
      name: 'UCCB|RDSP income < UCCB|RDSP repayment',
      income: {
        netIncome: 0,
        claimedIncome: 10,
        claimedRepayment: 20,
      } as PersonIncome,
      expected: 10,
    },
  ])('$name', ({ income, expected }) => {
    const result = calculateTotalIncome(income);
    expect(result).toBeCloseTo(expected);
  });
});

describe('calculateEstimation', () => {
  // Mock global environment
  beforeAll(() => {
    globalThis.__appEnvironment = {
      ...globalThis.__appEnvironment,
      ESTIMATOR_INFLATION_FACTOR: 1,
      ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION: 10_000,
      ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION: 14_000,
      ESTIMATOR_COUPLE_THRESHOLD: 32_500,
      ESTIMATOR_SINGLE_THRESHOLD: 23_000,
      ESTIMATOR_YEARLY_MAX_BENEFITS: 2400,
      ESTIMATOR_BENEFIT_REDUCTION_RATE: 0.2,
      ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE: 0.1,
    };
  });
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
        individualIncome: { netIncome: 15_339, workingIncome: 1000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_003: Single with working income between $1,000-$9,000',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 31_250, workingIncome: 9000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_004: Single with working income at exactly $10,000',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 31_250, workingIncome: 10_000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_005: Single with working income greater than $10,000',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 31_250, workingIncome: 20_000, claimedIncome: 0, claimedRepayment: 0 },
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
        individualIncome: { netIncome: 13_000, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 17_000,
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
        individualIncome: { netIncome: 15_339, workingIncome: 11_000, claimedIncome: 0, claimedRepayment: 0 },
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
        individualIncome: { netIncome: 31_250, workingIncome: 1000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 11_589.45,
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
        individualIncome: { netIncome: 31_250, workingIncome: 5000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 11_589.45,
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
        individualIncome: { netIncome: 31_250, workingIncome: 7000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 11_589.45,
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
        individualIncome: { netIncome: 23_000.3, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_015: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 10_000.3, workingIncome: 10_000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_016: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 33_000.3, workingIncome: 15_000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_017: Single - reduced payment by 0.01',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 23_000.31, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_018: Single - reduced payment by 0.01',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 23_000.31, workingIncome: 15_000, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_019: Single - reduced payment of $166.67/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 25_000, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_020: Single - reduced payment of $166.67/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 27_550, workingIncome: 2550, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_021: Single - reduced payment equalling $20/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 42_821, workingIncome: 9021, claimedIncome: 0, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 20, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_022: Single - zero payment',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 44_999.71, workingIncome: 22_000, claimedIncome: 0, claimedRepayment: 0 },
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
        individualIncome: { netIncome: 15_000, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 10_000,
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
        individualIncome: { netIncome: 15_000, workingIncome: 10_000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 10_000,
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
        individualIncome: { netIncome: 11_999, workingIncome: 2500, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 19_000,
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
        individualIncome: { netIncome: 32_500.7, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
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
        individualIncome: { netIncome: 16_250.35, workingIncome: 5000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 21_250.35,
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
        individualIncome: { netIncome: 18_250, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 16_250,
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
        individualIncome: { netIncome: 20_250, workingIncome: 2000, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 17_750,
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
        individualIncome: { netIncome: 23_250, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 20_050,
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
          netIncome: 50_000,
          workingIncome: 10_000,
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
        individualIncome: { netIncome: 24_879.48, workingIncome: 0, claimedIncome: 2152.12, claimedRepayment: 142.12 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_034: Single - max monthly payment amount',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 35_000.3, workingIncome: 15_000, claimedIncome: 2000, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 200, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_035: Single - reduced payment by 0.01',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 22_875.06, workingIncome: 0, claimedIncome: 0, claimedRepayment: 125.25 },
      } as SingleIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_036: Single - reduced payment by 0.01',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 34_000.3, workingIncome: 15_000, claimedIncome: 999.99, claimedRepayment: 0 },
      } as SingleIncome,
      expected: { estimation: 199.99, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_037: Single - reduced payment of $166.67/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 25_200.46, workingIncome: 0, claimedIncome: 1600.66, claimedRepayment: 1400.2 },
      } as SingleIncome,
      expected: { estimation: 166.67, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_038: Single - reduced payment equalling $20/month',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 43_791.74, workingIncome: 9021, claimedIncome: 1100.99, claimedRepayment: 130.25 },
      } as SingleIncome,
      expected: { estimation: 20, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_039: Single - zero payment',
      payload: {
        kind: 'single',
        individualIncome: { netIncome: 36_490.51, workingIncome: 0, claimedIncome: 1515.8, claimedRepayment: 25 },
      } as SingleIncome,
      expected: { estimation: 0, estimationSplitBenefit: undefined },
    },
    {
      name: 'TC_040: Married - max monthly payment amount',
      payload: {
        kind: 'married',
        individualIncome: { netIncome: 0, workingIncome: 0, claimedIncome: 0, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 24_897.48,
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
        individualIncome: { netIncome: 25_000.3, workingIncome: 15_000, claimedIncome: 0, claimedRepayment: 0 },
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
        individualIncome: { netIncome: 16_250.35, workingIncome: 5000, claimedIncome: 150, claimedRepayment: 150 },
        partnerIncome: {
          netIncome: 21_250.35,
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
        individualIncome: { netIncome: 32_511, workingIncome: 1010, claimedIncome: 0, claimedRepayment: 0 },
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
        individualIncome: { netIncome: 25_200.46, workingIncome: 0, claimedIncome: 1600.66, claimedRepayment: 1400.2 },
        partnerIncome: {
          netIncome: 21_299.54,
          workingIncome: 11_800,
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
        individualIncome: { netIncome: 43_791, workingIncome: 9011, claimedIncome: 1100.99, claimedRepayment: 130.25 },
        partnerIncome: {
          netIncome: 12_981,
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
        individualIncome: { netIncome: 43_791, workingIncome: 0, claimedIncome: 2154.2, claimedRepayment: 0 },
        partnerIncome: {
          netIncome: 12_981,
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
