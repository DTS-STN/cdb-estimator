import { CDBEstimator, PersonIncome } from './@types';

export function calculateEstimation(data: CDBEstimator, partnerReceivesCDB: boolean) {
  const INDEXING_FACTOR = 1; // A : Indexing factor
  const CLIENT_WORKING_INCOME_CEIL = 10000;
  const COMBINED_WORKING_INCOME_CEIL = 14000;
  const MARRIED_THRESHOLD = 32500;
  const SINGLE_THRESHOLD = 23000;

  const estimation = (2400 * INDEXING_FACTOR - GetB(data, partnerReceivesCDB)) / 12;

  // Round to the nearest cent (or higher cent if equidistant)
  return Math.round(estimation * 100) / 100;

  /**
   * B : Reduction Based on Income
   * @returns B
   */
  function GetB(data: CDBEstimator, partnerReceivesCDB: boolean) {
    if (data.income.kind === 'married') {
      return partnerReceivesCDB
        ? 0.1 * (GetC(data) - GetE(data) - MARRIED_THRESHOLD * INDEXING_FACTOR)
        : 0.2 * (GetC(data) - GetE(data) - MARRIED_THRESHOLD * INDEXING_FACTOR);
    } else {
      return 0.2 * (GetC(data) - GetD(data) - SINGLE_THRESHOLD * INDEXING_FACTOR);
    }
  }

  /**
   * C : Adjusted income
   * @returns C
   */
  function GetC(data: CDBEstimator) {
    const { income } = data;
    return income.kind === 'married'
      ? GetAdjustedIncome(income) + GetAdjustedIncome(income.partner)
      : GetAdjustedIncome(income);
  }

  /**
   * D : The lesser of client’s working income or $10,000
   * @returns D
   */
  function GetD(data: CDBEstimator) {
    const ceiling = CLIENT_WORKING_INCOME_CEIL * INDEXING_FACTOR;

    return Math.min(ceiling, data.income.workingIncome);
  }

  /**
   * E : Lesser of combined working income of client/spouse or $14,000
   * @returns E
   */
  function GetE(data: CDBEstimator) {
    const ceiling = COMBINED_WORKING_INCOME_CEIL * INDEXING_FACTOR;
    const combinedWorkingIncome =
      data.income.kind === 'married'
        ? data.income.workingIncome + data.income.partner.workingIncome
        : data.income.workingIncome;

    return Math.min(ceiling, combinedWorkingIncome);
  }

  function GetAdjustedIncome(personIncome: PersonIncome) {
    return personIncome.netIncome - (personIncome.claimedIncome ?? 0) + (personIncome.claimedRepayment ?? 0);
  }
}
