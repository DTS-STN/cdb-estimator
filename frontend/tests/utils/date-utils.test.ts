import { describe, expect, it, vi } from 'vitest';

import {
  dateExists,
  getLocalizedMonths,
  getStartOfDayInTimezone,
  isPastInTimezone,
  isTodayInTimezone,
  isValidTimeZone,
  toISODateString,
} from '~/utils/date-utils';

describe('date-utils', () => {
  describe('dateExists', () => {
    it('should return [true] for a valid date', () => {
      expect(dateExists(2000, 2, 1)).toEqual(true); // 2000-02-01
    });

    it('should return [false] for an invalid date', () => {
      expect(dateExists(2000, 2, 30)).toEqual(false); // 2000-02-30
    });

    it('should return [true] for a valid date with year < 100', () => {
      expect(dateExists(99, 2, 1)).toEqual(true); // 0099-02-01
    });
  });

  describe('isValidTimeZone', () => {
    const invalidTimeZones = [
      '', //
      'Canada',
      'Canada/Los_Angeles',
      'MyTimeZone!!',
    ];

    const validTimeZones = [
      'Canada/Atlantic',
      'Canada/Central',
      'Canada/Mountain',
      'Canada/Newfoundland',
      'Canada/Pacific',
      'UTC',
    ];

    it.each(invalidTimeZones)('should return [false] for invalid time zone [%s]', (timeZone) => {
      expect(isValidTimeZone(timeZone)).toEqual(false);
    });

    it.each(validTimeZones)('should return [true] for valid time zone [%s]', (timeZone) => {
      expect(isValidTimeZone(timeZone)).toEqual(true);
    });
  });

  describe('isPastInTimezone', () => {
    it('should return [true] for a date that is in the past', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastInTimezone('UTC', new Date('1900-01-01'))).toEqual(true);
    });

    it('should return [false] for a date that is in the future', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastInTimezone('UTC', new Date('2100-01-01'))).toEqual(false);
    });

    it('should return [false] for a date that is equal to the current date', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isPastInTimezone('UTC', new Date('2000-01-01'))).toEqual(false);
    });
  });

  describe('isTodayInTimezone', () => {
    it('should return [false] for a date that is in the past', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isTodayInTimezone('Canada/Eastern', new Date('1900-01-01'))).toEqual(false);
    });

    it('should return [false] for a date that is in the future', () => {
      vi.setSystemTime(new Date('2000-01-01'));
      expect(isTodayInTimezone('Canada/Eastern', new Date('2100-01-01'))).toEqual(false);
    });

    it('should return [true] for a date that is equal to the current date', () => {
      vi.setSystemTime(new Date('2000-01-01T05:00:00Z'));
      expect(isTodayInTimezone('Canada/Eastern', new Date('2000-01-01'))).toEqual(true);
    });

    it('should return [true] for a date that is within 24 hours of the current date', () => {
      vi.setSystemTime(new Date('2000-01-01T12:34:56Z'));
      expect(isTodayInTimezone('Canada/Eastern', new Date('2000-01-01'))).toEqual(true);
    });
  });

  describe('getLocalizedMonths', () => {
    it('should return the localized months for the specified locale [en]', () => {
      expect(getLocalizedMonths('en')).toEqual([
        { value: 1, text: 'January' },
        { value: 2, text: 'February' },
        { value: 3, text: 'March' },
        { value: 4, text: 'April' },
        { value: 5, text: 'May' },
        { value: 6, text: 'June' },
        { value: 7, text: 'July' },
        { value: 8, text: 'August' },
        { value: 9, text: 'September' },
        { value: 10, text: 'October' },
        { value: 11, text: 'November' },
        { value: 12, text: 'December' },
      ]);
    });

    it('should return the localized months for the specified locale [fr]', () => {
      expect(getLocalizedMonths('fr')).toEqual([
        { value: 1, text: 'janvier' },
        { value: 2, text: 'février' },
        { value: 3, text: 'mars' },
        { value: 4, text: 'avril' },
        { value: 5, text: 'mai' },
        { value: 6, text: 'juin' },
        { value: 7, text: 'juillet' },
        { value: 8, text: 'août' },
        { value: 9, text: 'septembre' },
        { value: 10, text: 'octobre' },
        { value: 11, text: 'novembre' },
        { value: 12, text: 'décembre' },
      ]);
    });
  });

  describe('getStartOfDayInTimezone', () => {
    it('should return the start of the day in the specified timezone', () => {
      expect(getStartOfDayInTimezone('Canada/Eastern', '2000-01-01')) //
        .toEqual(new Date('2000-01-01T05:00:00.000Z'));
    });
  });

  describe('toISODateString', () => {
    it('should format a date correctly from numbers', () => {
      expect(toISODateString(2000, 1, 1)).toEqual('2000-01-01');
    });

    it('should format a date correctly from year < 100', () => {
      expect(toISODateString(19, 1, 1)).toEqual('0019-01-01');
    });
  });
});
