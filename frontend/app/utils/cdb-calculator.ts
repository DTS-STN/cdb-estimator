import type { MarriedIncome, PersonIncome, SingleIncome } from '../routes/estimator/@types';

function roundUp(value: number) {
  return Math.round(value * 10000) / 10000;
}

export function calculateEstimation(income: MarriedIncome | SingleIncome) {
  const { ESTIMATOR_INFLATION_FACTOR, ESTIMATOR_YEARLY_MAX_BENEFITS } = globalThis.__appEnvironment;

  return income.kind === 'married'
    ? {
        kind: 'married',
        estimationSplitBenefit: Math.max(
          0,
          roundUp((ESTIMATOR_YEARLY_MAX_BENEFITS * ESTIMATOR_INFLATION_FACTOR - GetB(income, true)) / 12),
        ),
        estimation: Math.max(
          0,
          roundUp((ESTIMATOR_YEARLY_MAX_BENEFITS * ESTIMATOR_INFLATION_FACTOR - GetB(income, false)) / 12),
        ),
      }
    : {
        kind: 'single',
        estimation: Math.max(
          0,
          roundUp((ESTIMATOR_YEARLY_MAX_BENEFITS * ESTIMATOR_INFLATION_FACTOR - GetB(income, false)) / 12),
        ),
      };
}

/**
 * B : Reduction Based on Income
 * @returns B
 */
function GetB(income: MarriedIncome | SingleIncome, partnerReceivesCDB: boolean) {
  const {
    ESTIMATOR_INFLATION_FACTOR,
    ESTIMATOR_COUPLE_THRESHOLD,
    ESTIMATOR_SINGLE_THRESHOLD,
    ESTIMATOR_BENEFIT_REDUCTION_RATE,
    ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE,
  } = globalThis.__appEnvironment;

  const reductionRate =
    income.kind === 'married' && partnerReceivesCDB ? ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE : ESTIMATOR_BENEFIT_REDUCTION_RATE;
  const threshold = income.kind === 'married' ? ESTIMATOR_COUPLE_THRESHOLD : ESTIMATOR_SINGLE_THRESHOLD;

  if (income.kind === 'married') {
    return partnerReceivesCDB
      ? Math.max(
          0,
          ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE *
            (GetC(income) - GetE(income) - ESTIMATOR_COUPLE_THRESHOLD * ESTIMATOR_INFLATION_FACTOR),
        )
      : Math.max(
          0,
          ESTIMATOR_BENEFIT_REDUCTION_RATE *
            (GetC(income) - GetE(income) - ESTIMATOR_COUPLE_THRESHOLD * ESTIMATOR_INFLATION_FACTOR),
        );
  } else {
    return Math.max(
      0,
      ESTIMATOR_BENEFIT_REDUCTION_RATE *
        (GetC(income) - GetD(income) - ESTIMATOR_SINGLE_THRESHOLD * ESTIMATOR_INFLATION_FACTOR),
    );
  }
}

/**
 * C : Adjusted income
 * @returns C
 */
function GetC(income: SingleIncome | MarriedIncome) {
  return income.kind === 'married' ? GetAdjustedIncome(income) + GetAdjustedIncome(income.partner) : GetAdjustedIncome(income);
}

/**
 * D : The lesser of client’s working income or $10,000
 * @returns D
 */
function GetD(singleIncome: SingleIncome) {
  const { ESTIMATOR_INFLATION_FACTOR, ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION } = globalThis.__appEnvironment;

  const ceiling = ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION * ESTIMATOR_INFLATION_FACTOR;

  return Math.min(ceiling, singleIncome.workingIncome);
}

/**
 * E : Lesser of combined working income of client/spouse or $14,000
 * @returns E
 */
function GetE(coupleIncome: MarriedIncome) {
  const { ESTIMATOR_INFLATION_FACTOR, ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION } = globalThis.__appEnvironment;

  const ceiling = ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION * ESTIMATOR_INFLATION_FACTOR;
  const combinedWorkingIncome = coupleIncome.workingIncome + coupleIncome.partner.workingIncome;

  return Math.min(ceiling, combinedWorkingIncome);
}

function GetAdjustedIncome(personIncome: PersonIncome) {
  return personIncome.netIncome - (personIncome.claimedIncome ?? 0) + (personIncome.claimedRepayment ?? 0);
}
