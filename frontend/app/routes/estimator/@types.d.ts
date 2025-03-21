import 'express-session';

import type { validMaritalStatuses } from './types';

//forms and form fields:

export type AgeForm = {
  month: string;
  year: string;
};

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
  dateOfBirth: DateOfBirth;
  maritalStatus: MaritalStatus;
  income: SingleIncome | MarriedIncome;
};

export type DateOfBirth = {
  month: number;
  year: number;
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

declare module 'express-session' {
  interface SessionData {
    estimator: Partial<CDBEstimator>;
  }
}

export {};
