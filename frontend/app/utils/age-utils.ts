import { differenceInYears } from 'date-fns';

/**
 * Calculates a person's age on the current date.
 * @param birthMonth The person's birth month as a number or number string.
 * @param birthYear The person's birth year as a number or number string.
 
 * @returns The person's age (years) on the current day. Returns undefined if parsing fails.
 */
export function calculateAge(birthMonth?: string | number, birthYear?: string | number): number | undefined {
  if (birthMonth === undefined || birthYear === undefined) {
    return undefined;
  }

  const birthYearNum = typeof birthYear === 'number' ? birthYear : parseInt(birthYear, 10);
  const birthMonthNum = typeof birthMonth === 'number' ? birthMonth : parseInt(birthMonth, 10);

  if (isNaN(birthYearNum) || isNaN(birthMonthNum) || birthMonthNum < 1 || birthMonthNum > 12) {
    return undefined;
  }

  const birthDate = new Date(birthYearNum, birthMonthNum - 1, 1);
  const age = differenceInYears(new Date(), birthDate);
  return age;
}
