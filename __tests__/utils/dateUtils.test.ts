import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatDate,
  formatDateShort,
  formatDateLong,
  getToday,
  getDaysAgo,
  isToday,
  getRelativeTimeString
} from '../../utils/dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    // Mock Date to 2024-03-15 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    it('should format Date object', () => {
      const date = new Date('2024-03-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('2024');
    });

    it('should format date string', () => {
      const formatted = formatDate('2024-03-15');
      expect(formatted).toContain('2024');
    });
  });

  describe('getToday', () => {
    it('should return today in YYYY-MM-DD format', () => {
      expect(getToday()).toBe('2024-03-15');
    });
  });

  describe('getDaysAgo', () => {
    it('should return correct date for days ago', () => {
      expect(getDaysAgo(0)).toBe('2024-03-15');
      expect(getDaysAgo(1)).toBe('2024-03-14');
      expect(getDaysAgo(7)).toBe('2024-03-08');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date('2024-03-15'))).toBe(true);
      expect(isToday('2024-03-15')).toBe(true);
    });

    it('should return false for other days', () => {
      expect(isToday(new Date('2024-03-14'))).toBe(false);
      expect(isToday('2024-03-16')).toBe(false);
    });
  });

  describe('getRelativeTimeString', () => {
    it('should return "Just nu" for very recent times', () => {
      const now = new Date();
      expect(getRelativeTimeString(now)).toBe('Just nu');
    });

    it('should return minutes for recent times', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(getRelativeTimeString(fiveMinutesAgo)).toBe('5 min sedan');
    });

    it('should return hours for times within a day', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(getRelativeTimeString(twoHoursAgo)).toBe('2 tim sedan');
    });

    it('should return "Igår" for yesterday', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(getRelativeTimeString(yesterday)).toBe('Igår');
    });

    it('should return days for recent dates', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(getRelativeTimeString(threeDaysAgo)).toBe('3 dagar sedan');
    });
  });
});
