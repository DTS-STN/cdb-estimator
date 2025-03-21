import { differenceInMonths, differenceInYears } from 'date-fns';

/**
 * Calculates a person's age in years on the current date.
 * @param month The person's birth month as number between 1 and 12.
 * @param year The person's birth year.
 
 * @returns The person's age (years) on the current day.
 */
export function calculateAge(month: number, year: number): number {
  const date = new Date(year, month - 1, 1); // Explicity set to first day of the month
  date.setFullYear(year); // Ensure the year is set correctly for years < 100

  const now = new Date();

  return differenceInYears(now, date);
}

/**
 * Calculates a person's age in months on the current date.
 * @param month The person's birth month as number between 1 and 12.
 * @param year The person's birth year.
 
 * @returns The person's age (months) on the current day.
 */
export function calculateAgeInMonths(month: number, year: number): number {
  const date = new Date(year, month - 1, 1); // Explicity set to first day of the month
  date.setFullYear(year); // Ensure the year is set correctly for years < 100

  const now = new Date();

  return differenceInMonths(now, date);
}
