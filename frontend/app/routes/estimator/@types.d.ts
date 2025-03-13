import 'express-session';

export type DateOfBirth = {
  month: number;
  year: number;
};

export type AgeForm = {
  dateOfBirth: DateOfBirth;
};

export type CDBEstimator = {
  ageForm: AgeForm;
};

declare module 'express-session' {
  interface SessionData {
    estimator: Partial<CDBEstimator>;
  }
}

export {};
