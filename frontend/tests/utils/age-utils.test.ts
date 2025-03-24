import { describe, expect, it, vi } from 'vitest';

import { calculateAge, calculateAgeInMonths } from '~/utils/age-utils';

describe('age-utils', () => {
  describe('calculateAge', () => {
    it('should return the correct age [0] when day/second before', () => {
      vi.setSystemTime(new Date('2000-03-31T23:59:59.000'));
      expect(calculateAge(4, 1999)).toEqual(0);
    });

    it('should return the correct age [1] when exactly year before', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      expect(calculateAge(4, 1999)).toEqual(1);
    });

    it('should return the correct age [1] when 18 months before', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      expect(calculateAge(10, 1998)).toEqual(1);
    });

    it('should return the correct age [-1] when year after', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      expect(calculateAge(4, 2001)).toEqual(-1);
    });

    it('should return the correct age [10]', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      expect(calculateAge(4, 1990)).toEqual(10);
    });

    it('should return the correct age [10] when at start of year', () => {
      vi.setSystemTime(new Date('2000-01-01T00:00:00.000'));
      expect(calculateAge(1, 1990)).toEqual(10);
    });

    it('should return the correct age [1990] for year < 100', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      expect(calculateAge(4, 10)).toEqual(1990);
    });

    it('should return the correct age [2010] for negative year', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      expect(calculateAge(4, -10)).toEqual(2010);
    });
  });

  describe('calculateAgeInMonths', () => {
    it('should return the correct age in months [0] when day/second before', () => {
      vi.setSystemTime(new Date('2000-04-30T23:59:59.000'));
      expect(calculateAgeInMonths(4, 2000)).toEqual(0);
    });

    it('should return the correct age in months [1] when exactly month before', () => {
      vi.setSystemTime(new Date('2000-05-01T00:00:00.000'));
      expect(calculateAgeInMonths(4, 2000)).toEqual(1);
    });

    it('should return the correct age in months [1] when 40 days', () => {
      vi.setSystemTime(new Date('2000-05-11T00:00:00.000'));
      expect(calculateAgeInMonths(4, 2000)).toEqual(1);
    });

    it('should return the correct age in months [-1] when month after', () => {
      vi.setSystemTime(new Date('2000-05-01T00:00:00.000'));
      expect(calculateAgeInMonths(6, 2000)).toEqual(-1);
    });

    it('should return the correct age in months [18]', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      expect(calculateAgeInMonths(10, 1998)).toEqual(18);
    });

    it('should return the correct age in months [120]', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      expect(calculateAgeInMonths(4, 1990)).toEqual(120);
    });

    it('should return the correct age in months [120] when at start of year', () => {
      vi.setSystemTime(new Date('2000-01-01T00:00:00.000'));
      expect(calculateAgeInMonths(1, 1990)).toEqual(120);
    });

    it('should return the correct age in months [23880] for year < 100', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      // 1990 * 12 = 23880
      expect(calculateAgeInMonths(4, 10)).toEqual(23880);
    });

    it('should return the correct age in months [24120] for negative year', () => {
      vi.setSystemTime(new Date('2000-04-01T00:00:00.000'));
      // 2010 * 12 = 24120
      expect(calculateAgeInMonths(4, -10)).toEqual(24120);
    });
  });
});
