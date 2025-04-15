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

export interface SingleIncomeForm {
  kind: 'single';
  individualIncome: PersonIncomeForm;
}
export interface MarriedIncomeForm {
  kind: 'married';
  individualIncome: PersonIncomeForm;
  partnerIncome: PersonIncomeForm;
}

// business objects
export type CDBEstimator = {
  maritalStatus: MaritalStatus;
  income: SingleIncome | MarriedIncome;
};

export type MaritalStatus = (typeof validMaritalStatuses)[number];

export interface SingleIncome {
  kind: 'single';
  individualIncome: PersonIncome;
}

export interface MarriedIncome {
  kind: 'married';
  individualIncome: PersonIncome;
  partnerIncome: PersonIncome;
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

export interface FormattedSingleIncome {
  kind: 'single';
  individualIncome: FormattedPersonIncome;
}
export interface FormattedMarriedIncome {
  kind: 'married';
  individualIncome: FormattedPersonIncome;
  partnerIncome: FormattedPersonIncome;
}

export type FormValue = [string, string | undefined];

export type FormValues = FormValue[];

declare module 'express-session' {
  interface SessionData {
    estimator: Partial<CDBEstimator>; //tracks business objects
    formFieldValues: FormValues; //tracks form field values on successful form posts
  }
}

export {};
