import type { MarriedIncome, PersonIncome, SingleIncome } from './@types';

const INFLATION_FACTOR = 1; // Used to reflect inflation as a part of the calculation
const SINGLE_WORKING_INCOME_EXEMPTION = 10000; // Working income exemption is the amount of working income that is excluded when calculating the benefit amount
const COUPLE_WORKING_INCOME_EXCEPTION = 14000; // Working income exemption is the amount of working income that is excluded when calculating the benefit amount
const COUPLE_THRESHOLD = 32500; // The income threshold is the maximum amount of income before the benefit amount is reduced
const SINGLE_THRESHOLD = 23000; // The income threshold is the maximum amount of income before the benefit amount is reduced
const YEARLY_MAX_BENEFITS = 2400; // The maximum benefit
const BENEFIT_REDUCTION_RATE = 0.2;
const SPLIT_BENEFIT_REDUCTION_RATE = 0.1;

function roundUp(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateEstimation(income: MarriedIncome | SingleIncome) {
  return income.kind === 'married'
    ? {
        kind: 'married',
        estimationSplitBenefit: Math.max(0, roundUp((YEARLY_MAX_BENEFITS * INFLATION_FACTOR - GetB(income, true)) / 12)),
        estimation: Math.max(0, roundUp((YEARLY_MAX_BENEFITS * INFLATION_FACTOR - GetB(income, false)) / 12)),
      }
    : {
        kind: 'single',
        estimation: Math.max(0, roundUp((YEARLY_MAX_BENEFITS * INFLATION_FACTOR - GetB(income, false)) / 12)),
      };
}

/**
 * B : Reduction Based on Income
 * @returns B
 */
function GetB(income: MarriedIncome | SingleIncome, partnerReceivesCDB: boolean) {
  if (income.kind === 'married') {
    return partnerReceivesCDB
      ? Math.max(0, SPLIT_BENEFIT_REDUCTION_RATE * (GetC(income) - GetE(income) - COUPLE_THRESHOLD * INFLATION_FACTOR))
      : Math.max(0, BENEFIT_REDUCTION_RATE * (GetC(income) - GetE(income) - COUPLE_THRESHOLD * INFLATION_FACTOR));
  } else {
    return Math.max(0, BENEFIT_REDUCTION_RATE * (GetC(income) - GetD(income) - SINGLE_THRESHOLD * INFLATION_FACTOR));
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
  const ceiling = SINGLE_WORKING_INCOME_EXEMPTION * INFLATION_FACTOR;

  return Math.min(ceiling, singleIncome.workingIncome);
}

/**
 * E : Lesser of combined working income of client/spouse or $14,000
 * @returns E
 */
function GetE(coupleIncome: MarriedIncome) {
  const ceiling = COUPLE_WORKING_INCOME_EXCEPTION * INFLATION_FACTOR;
  const combinedWorkingIncome = coupleIncome.workingIncome + coupleIncome.partner.workingIncome;

  return Math.min(ceiling, combinedWorkingIncome);
}

function GetAdjustedIncome(personIncome: PersonIncome) {
  return personIncome.netIncome - (personIncome.claimedIncome ?? 0) + (personIncome.claimedRepayment ?? 0);
}
