import 'express-session';

import type { validMaritalStatuses } from './types';

//forms and form fields:

export type MaritalStatusForm = {
  maritalStatus: string;
};

export interface PersonIncomeForm {
  netIncome: string;
  workingIncome: string;
  claimedIncome?: string;
  claimedRepayment?: string;
}

export interface SingleIncomeForm extends PersonIncomeForm {
  kind: 'single';
}
export interface MarriedIncomeForm extends PersonIncomeForm {
  kind: 'married';
  partner: PersonIncomeForm;
}

// business objects
export type CDBEstimator = {
  maritalStatus: MaritalStatus;
  income: SingleIncome | MarriedIncome;
};

export type MaritalStatus = (typeof validMaritalStatuses)[number];

export interface SingleIncome extends PersonIncome {
  kind: 'single';
}

export interface MarriedIncome extends PersonIncome {
  kind: 'married';
  partner: PersonIncome;
}

export interface PersonIncome {
  netIncome: number;
  workingIncome: number;
  claimedIncome?: number;
  claimedRepayment?: number;
}

export type FormattedMarriedResults = {
  kind: 'married';
  estimation: string;
  estimationSplitBenefit: string;
};

export type FormattedSingleResults = {
  kind: 'single';
  estimation: string;
};

export type FormattedCDBEstimator = {
  maritalStatus: string;
  income: FormattedSingleIncome | FormattedMarriedIncome;
  results: FormattedSingleResults | FormattedMarriedResults;
};
export interface FormattedPersonIncome {
  totalIncome: string;
}

export interface FormattedSingleIncome extends FormattedPersonIncome {
  kind: 'single';
}
export interface FormattedMarriedIncome extends FormattedPersonIncome {
  kind: 'married';
  partner: FormattedPersonIncome;
}

declare module 'express-session' {
  interface SessionData {
    estimator: Partial<CDBEstimator>;
  }
}

export {};
