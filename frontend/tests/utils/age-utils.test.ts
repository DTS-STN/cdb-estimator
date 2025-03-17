import { describe, expect, it, vi } from 'vitest';

import { calculateAge, calculateAgeInMonths } from '~/utils/age-utils';

describe('age-utils', () => {
  describe('calculateAge', () => {
    it('should return the correct age: 0', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAge(5, 1999)).toEqual(0);
    });

    it('should return the correct age: 1', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAge(4, 1999)).toEqual(1);
    });

    it('should return the correct age: 10', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAge(4, 1990)).toEqual(10);
    });

    it('should return the correct age for year < 100', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAge(4, 10)).toEqual(1990);
    });

    it('should return the correct age for negative year', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAge(4, -10)).toEqual(2010);
    });
  });

  describe('calculateAgeInMonths', () => {
    it('should return the correct age in months: 0', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAgeInMonths(4, 2000)).toEqual(0);
    });

    it('should return the correct age in months: 1', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAgeInMonths(3, 2000)).toEqual(1);
    });

    it('should return the correct age in months: 18', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAgeInMonths(10, 1998)).toEqual(18);
    });

    it('should return the correct age in months: 120', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      expect(calculateAgeInMonths(4, 1990)).toEqual(120);
    });

    it('should return the correct age in months for year < 100', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      // 1990 * 12 = 23880
      expect(calculateAgeInMonths(4, 10)).toEqual(23880);
    });

    it('should return the correct age in months for negative year', () => {
      vi.setSystemTime(new Date('2000-04-01'));
      // 2010 * 12 = 24120
      expect(calculateAgeInMonths(4, -10)).toEqual(24120);
    });
  });
});
