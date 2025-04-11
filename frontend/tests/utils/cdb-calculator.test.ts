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
  it('TC_001: Single with working income at zero', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 3000,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_002: Single with working income between $1,000-$9,000', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 15339,
      workingIncome: 1000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_003: Single with working income between $1,000-$9,000', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 31250,
      workingIncome: 9000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_004: Single with working income at exactly $10,000', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 31250,
      workingIncome: 10000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_005: Single with working income greater than $10,000', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 31250,
      workingIncome: 20000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_006: Single where working income is negative (farming incom was negative and applicant did not enter 0 as instructed)', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 0,
      workingIncome: -5000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_007: Married with working income at zero', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 13000,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 17000,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_008: Married with working income between $1,000-$13,000', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 15339,
      workingIncome: 11000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 9895.62,
        workingIncome: 5298,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_009: Married with working income between $1,000-$13,000', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 31250,
      workingIncome: 1000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 11589.45,
        workingIncome: 2500,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(86.01);
    expect(result.estimationSplitBenefit).toBeCloseTo(143);
  });

  it('TC_010: Married with working income at exactly $14,000', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 31250,
      workingIncome: 5000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 11589.45,
        workingIncome: 9000,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_011: Married with working income greater than $14,000', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 31250,
      workingIncome: 7000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 11589.45,
        workingIncome: 9000,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_013: Single - max monthly payment amount', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 0,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_014: Single - max monthly payment amount', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 23000.3,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_015: Single - max monthly payment amount', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 10000.3,
      workingIncome: 10000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_016: Single - max monthly payment amount', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 33000.3,
      workingIncome: 15000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200, 1);
  });

  it('TC_017: Single - reduced payment by 0.01', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 23000.31,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(199.99);
  });

  it('TC_018: Single - reduced payment by 0.01', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 23000.31,
      workingIncome: 15000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_019: Single - reduced payment of $166.67/month', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 25000,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(166.67);
  });

  it('TC_020: Single - reduced payment of $166.67/month', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 27550,
      workingIncome: 2550,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(166.67);
  });

  it('TC_021: Single - reduced payment equalling $20/month', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 42821,
      workingIncome: 9021,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(20);
  });

  it('TC_022: Single - zero payment', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 44999.71,
      workingIncome: 22000,
      claimedIncome: 0,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(0);
  });

  it('TC_023: Married - max monthly payment amount', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 0,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 0,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_024: Married - max monthly payment amount', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 15000,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 10000,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_025: Married - max monthly payment amount', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 15000,
      workingIncome: 10000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 10000,
        workingIncome: 2000,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_026: Married - max monthly payment amount', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 11999,
      workingIncome: 2500,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 19000,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_027: Married - reduced payment by 0.01', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 32500.7,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 0,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(199.99);
    expect(result.estimationSplitBenefit).toBeCloseTo(199.99);
  });

  it('TC_028: Married - reduced payment by 0.01', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 16250.35,
      workingIncome: 5000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 21250.35,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(199.99);
    expect(result.estimationSplitBenefit).toBeCloseTo(199.99);
  });

  it('TC_029: Married - reduced payment of $166.67/month for one of the estimate', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 18250,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 16250,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(166.67);
    expect(result.estimationSplitBenefit).toBeCloseTo(183.33);
  });

  it('TC_030: Married - reduced payment of $166.67/month for one of the estimate', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 20250,
      workingIncome: 2000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 17750,
        workingIncome: 1500,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(166.67);
    expect(result.estimationSplitBenefit).toBeCloseTo(183.33);
  });

  it('TC_031: Married - reduced payment equalling $20/month for one of the estimate', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 23250,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 20050,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(20);
    expect(result.estimationSplitBenefit).toBeCloseTo(110);
  });

  it('TC_032: Married - zero payment for one of the estimate', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 8500,
      workingIncome: 4000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 50000,
        workingIncome: 10000,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(0);
    expect(result.estimationSplitBenefit).toBeCloseTo(100);
  });

  it('TC_033: Single - max monthly payment amount', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 24879.48,
      workingIncome: 0,
      claimedIncome: 2152.12,
      claimedRepayment: 142.12,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_034: Single - max monthly payment amount', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 35000.3,
      workingIncome: 15000,
      claimedIncome: 2000,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
  });

  it('TC_035: Single - reduced payment by 0.01', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 22875.06,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 125.25,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(199.99);
  });

  it('TC_036: Single - reduced payment by 0.01', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 34000.3,
      workingIncome: 15000,
      claimedIncome: 999.99,
      claimedRepayment: 0,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(199.99);
  });

  it('TC_037: Single - reduced payment of $166.67/month', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 25200.46,
      workingIncome: 0,
      claimedIncome: 1600.66,
      claimedRepayment: 1400.2,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(166.67);
  });

  it('TC_038: Single - reduced payment equalling $20/month', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 43791.74,
      workingIncome: 9021,
      claimedIncome: 1100.99,
      claimedRepayment: 130.25,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(20);
  });

  it('TC_039: Single - zero payment', () => {
    const income: SingleIncome = {
      kind: 'single',
      netIncome: 36490.51,
      workingIncome: 0,
      claimedIncome: 1515.8,
      claimedRepayment: 25,
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(0);
  });

  it('TC_040: Married - max monthly payment amount', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 0,
      workingIncome: 0,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 24897.48,
        workingIncome: 0,
        claimedIncome: 2152.12,
        claimedRepayment: 142.12,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_041: Married - max monthly payment amount', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 25000.3,
      workingIncome: 15000,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 4500,
        workingIncome: 2500,
        claimedIncome: 2000,
        claimedRepayment: 142.12,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(200);
    expect(result.estimationSplitBenefit).toBeCloseTo(200);
  });

  it('TC_042: Married - reduced payment by 0.01', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 16250.35,
      workingIncome: 5000,
      claimedIncome: 150,
      claimedRepayment: 150,
      partner: {
        netIncome: 21250.35,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(199.99);
    expect(result.estimationSplitBenefit).toBeCloseTo(199.99);
  });

  it('TC_043: Married - reduced payment by 0.01', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 32511,
      workingIncome: 1010,
      claimedIncome: 0,
      claimedRepayment: 0,
      partner: {
        netIncome: 0,
        workingIncome: 0,
        claimedIncome: 0,
        claimedRepayment: 999.7,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(199.99);
    expect(result.estimationSplitBenefit).toBeCloseTo(199.99);
  });

  it('TC_044: Married - reduced payment of $166.67/month for one of the estimate', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 25200.46,
      workingIncome: 0,
      claimedIncome: 1600.66,
      claimedRepayment: 1400.2,
      partner: {
        netIncome: 21299.54,
        workingIncome: 11800,
        claimedIncome: 0,
        claimedRepayment: 0,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(166.67);
    expect(result.estimationSplitBenefit).toBeCloseTo(183.34);
  });

  it('TC_045: Married - reduced payment equalling $20/month for one of the estimate', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 43791,
      workingIncome: 9011,
      claimedIncome: 1100.99,
      claimedRepayment: 130.25,
      partner: {
        netIncome: 12981,
        workingIncome: 4590.7,
        claimedIncome: 0,
        claimedRepayment: 1100.3,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(20);
    expect(result.estimationSplitBenefit).toBeCloseTo(110);
  });

  it('TC_046: Married - zero payment for one of the estimates', () => {
    const income: MarriedIncome = {
      kind: 'married',
      netIncome: 43791,
      workingIncome: 0,
      claimedIncome: 2154.2,
      claimedRepayment: 0,
      partner: {
        netIncome: 12981,
        workingIncome: 4590.7,
        claimedIncome: 1515.8,
        claimedRepayment: 1100.3,
      },
    };
    const result = calculateEstimation(income);
    expect(result.estimation).toBeCloseTo(0);
    expect(result.estimationSplitBenefit).toBeCloseTo(57.4);
  });
});
