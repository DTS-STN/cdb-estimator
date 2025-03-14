import { differenceInYears } from 'date-fns';

/**
 * Calculates a person's age on the current date.
 * @param birthMonth The person's birth month.
 * @param birthYear The person's birth year.
 
 * @returns The person's age (years) on the current day.
 */
export function calculateAge(birthMonth: number, birthYear: number): number {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#interpretation_of_two-digit_years
  const birthDate = new Date();
  birthDate.setFullYear(birthYear);
  birthDate.setMonth(birthMonth - 1);
  birthDate.setDate(1);

  const age = differenceInYears(new Date(), birthDate);
  return age;
}
