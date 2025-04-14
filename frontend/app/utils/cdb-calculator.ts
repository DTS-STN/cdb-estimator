import type { MarriedIncome, PersonIncome, SingleIncome } from '../routes/estimator/@types';

function roundUp(value: number) {
  //const result = Number(value.toFixed(2));
  const result = Math.round((value + Number.EPSILON) * 100) / 100;
  console.log({ roundUp_Before: value, roundUp_After: result });
  return result;
}

function roundUp3(value: number) {
  //const result = Number(value.toFixed(2));
  const result = Math.round((value + Number.EPSILON) * 1000) / 1000;
  console.log({ roundUp3_Before: value, roundUp3_After: result });
  return result;
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
  let result = 0;
  if (income.kind === 'married') {
    if (partnerReceivesCDB) {
      result = Math.max(
        0,
        ESTIMATOR_SPLIT_BENEFIT_REDUCTION_RATE *
          (GetC(income) - GetE(income) - ESTIMATOR_COUPLE_THRESHOLD * ESTIMATOR_INFLATION_FACTOR),
      );
      result = roundUp3(result); //Number(result.toFixed(3));
      console.log({ B_split: result });
    } else {
      result = Math.max(
        0,
        ESTIMATOR_BENEFIT_REDUCTION_RATE *
          (GetC(income) - GetE(income) - ESTIMATOR_COUPLE_THRESHOLD * ESTIMATOR_INFLATION_FACTOR),
      );
      result = roundUp3(result); //Number(result.toFixed(3));
      console.log({ B_married: result });
    }
  } else {
    result = Math.max(
      0,
      ESTIMATOR_BENEFIT_REDUCTION_RATE *
        (GetC(income) - GetD(income) - ESTIMATOR_SINGLE_THRESHOLD * ESTIMATOR_INFLATION_FACTOR),
    );
    result = roundUp3(result); //Number(result.toFixed(3));
    console.log({ B_single: result });
  }
  return result;
}

/**
 * C : Adjusted income
 * @returns C
 */
function GetC(income: SingleIncome | MarriedIncome) {
  let result =
    income.kind === 'married'
      ? GetAdjustedIncome(income, false) + GetAdjustedIncome(income.partner, true)
      : GetAdjustedIncome(income, false);
  result = roundUp3(result); //Number(result.toFixed(3));
  console.log({ C: result });
  return result;
}

/**
 * D : The lesser of client’s working income or $10,000
 * @returns D
 */
function GetD(singleIncome: SingleIncome) {
  const { ESTIMATOR_INFLATION_FACTOR, ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION } = globalThis.__appEnvironment;

  const ceiling = ESTIMATOR_SINGLE_WORKING_INCOME_EXEMPTION * ESTIMATOR_INFLATION_FACTOR;

  let result = Math.min(ceiling, singleIncome.workingIncome);
  result = roundUp3(result); //Number(result.toFixed(3));
  console.log({ D: result });
  return result;
}

/**
 * E : Lesser of combined working income of client/spouse or $14,000
 * @returns E
 */
function GetE(coupleIncome: MarriedIncome) {
  const { ESTIMATOR_INFLATION_FACTOR, ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION } = globalThis.__appEnvironment;

  const ceiling = ESTIMATOR_COUPLE_WORKING_INCOME_EXCEPTION * ESTIMATOR_INFLATION_FACTOR;
  const combinedWorkingIncome = coupleIncome.workingIncome + coupleIncome.partner.workingIncome;

  let result = Math.min(ceiling, combinedWorkingIncome);
  result = roundUp3(result); //Number(result.toFixed(3));
  console.log({ E: result });
  return result;
}

function GetAdjustedIncome(personIncome: PersonIncome, isPartner: boolean) {
  let result = personIncome.netIncome - (personIncome.claimedIncome ?? 0) + (personIncome.claimedRepayment ?? 0);
  result = roundUp3(result); //Number(result.toFixed(3));
  if (isPartner) {
    console.log({ AdjustedIncome_Partner: result });
  } else {
    console.log({ AdjustedIncome_Person: result });
  }
  return result;
}
