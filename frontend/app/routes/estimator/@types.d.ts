import 'express-session';

import type { validMaritalStatuses } from './types';

export type DateOfBirth = {
  month: number;
  year: number;
};

export type AgeForm = {
  dateOfBirth: DateOfBirth;
};

export type MaritalStatus = (typeof validMaritalStatuses)[number];

export type MaritalStatusForm = {
  maritalStatus: MaritalStatus;
};

export type CDBEstimator = {
  ageForm: AgeForm;
  maritalStatusForm: MaritalStatusForm;
};

declare module 'express-session' {
  interface SessionData {
    estimator: Partial<CDBEstimator>;
  }
}

export {};
