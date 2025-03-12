import { differenceInYears } from 'date-fns';

/**
 * Calculates a person's age on the current date.
 * @param birthMonth The person's birth month.
 * @param birthYear The person's birth year.
 
 * @returns The person's age (years) on the current day. Returns undefined if parsing fails.
 */
export function calculateAge(birthMonth: number, birthYear: number): number | undefined {
  const birthDate = new Date(0, birthMonth - 1, 1);
  birthDate.setFullYear(birthYear);

  const age = differenceInYears(new Date(), birthDate);
  return age;
}
