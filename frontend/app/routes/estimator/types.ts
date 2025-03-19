import type { MaritalStatus } from './@types';

export const validMaritalStatuses = ['single-divorced-separated-or-widowed', 'married-or-common-law'] as const;

export function isMaritalStatus(key: string): key is MaritalStatus {
  return validMaritalStatuses.includes(key as MaritalStatus);
}
