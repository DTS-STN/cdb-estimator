import type { CDBEstimator, PersonIncome } from './@types';

const INFLATION_FACTOR = 1; // Used to reflect inflation as a part of the calculation
const SINGLE_WORKING_INCOME_EXEMPTION = 10000; // Working income exemption is the amount of working income that is excluded when calculating the benefit amount
const COUPLE_WORKING_INCOME_EXCEPTION = 14000; // Working income exemption is the amount of working income that is excluded when calculating the benefit amount
const COUPLE_THRESHOLD = 32500; // The income threshold is the maximum amount of income before the benefit amount is reduced
const SINGLE_THRESHOLD = 23000; // The income threshold is the maximum amount of income before the benefit amount is reduced
const YEARLY_MAX_BENEFITS = 2400; // The maximum benefit
const BENEFIT_REDUCTION_RATE = 0.2;
const SPLIT_BENEFIT_REDUCTION_RATE = 0.1;

export function calculateEstimation(data: CDBEstimator, partnerReceivesCDB: boolean) {
  const estimation = (YEARLY_MAX_BENEFITS * INFLATION_FACTOR - GetB(data, partnerReceivesCDB)) / 12;

  // Round to the nearest cent (or higher cent if equidistant)
  return Math.round(estimation * 100) / 100;
}

/**
 * B : Reduction Based on Income
 * @returns B
 */
function GetB(data: CDBEstimator, partnerReceivesCDB: boolean) {
  if (data.income.kind === 'married') {
    return partnerReceivesCDB
      ? SPLIT_BENEFIT_REDUCTION_RATE * (GetC(data) - GetE(data) - COUPLE_THRESHOLD * INFLATION_FACTOR)
      : BENEFIT_REDUCTION_RATE * (GetC(data) - GetE(data) - COUPLE_THRESHOLD * INFLATION_FACTOR);
  } else {
    return BENEFIT_REDUCTION_RATE * (GetC(data) - GetD(data) - SINGLE_THRESHOLD * INFLATION_FACTOR);
  }
}

/**
 * C : Adjusted income
 * @returns C
 */
function GetC(data: CDBEstimator) {
  const { income } = data;
  return income.kind === 'married' ? GetAdjustedIncome(income) + GetAdjustedIncome(income.partner) : GetAdjustedIncome(income);
}

/**
 * D : The lesser of client’s working income or $10,000
 * @returns D
 */
function GetD(data: CDBEstimator) {
  const ceiling = SINGLE_WORKING_INCOME_EXEMPTION * INFLATION_FACTOR;

  return Math.min(ceiling, data.income.workingIncome);
}

/**
 * E : Lesser of combined working income of client/spouse or $14,000
 * @returns E
 */
function GetE(data: CDBEstimator) {
  const ceiling = COUPLE_WORKING_INCOME_EXCEPTION * INFLATION_FACTOR;
  const combinedWorkingIncome =
    data.income.kind === 'married' ? data.income.workingIncome + data.income.partner.workingIncome : data.income.workingIncome;

  return Math.min(ceiling, combinedWorkingIncome);
}

function GetAdjustedIncome(personIncome: PersonIncome) {
  return personIncome.netIncome - (personIncome.claimedIncome ?? 0) + (personIncome.claimedRepayment ?? 0);
}
