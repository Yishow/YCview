import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatFileSize, formatDate, formatNumber } from '../format-utils';

describe('formatFileSize', () => {
  describe('basic conversions', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(1)).toBe('1 B');
      expect(formatFileSize(500)).toBe('500 B');
      expect(formatFileSize(1023)).toBe('1,023 B');
    });

    it('should format KB correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
      expect(formatFileSize(1024 * 100)).toBe('100 KB');
    });

    it('should format MB correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
      expect(formatFileSize(1024 * 1024 * 100)).toBe('100 MB');
    });

    it('should format GB correctly', () => {
      expect(formatFileSize(1024 ** 3)).toBe('1 GB');
      expect(formatFileSize(1024 ** 3 * 2.5)).toBe('2.5 GB');
    });

    it('should format TB correctly', () => {
      expect(formatFileSize(1024 ** 4)).toBe('1 TB');
      expect(formatFileSize(1024 ** 4 * 1.5)).toBe('1.5 TB');
    });
  });

  describe('negative values', () => {
    it('should handle negative bytes', () => {
      expect(formatFileSize(-1024)).toBe('-1 KB');
      expect(formatFileSize(-1536)).toBe('-1.5 KB');
    });
  });

  describe('options', () => {
    it('should respect decimals option', () => {
      expect(formatFileSize(1536, { decimals: 0 })).toBe('2 KB');
      expect(formatFileSize(1536, { decimals: 1 })).toBe('1.5 KB');
      expect(formatFileSize(1536, { decimals: 3 })).toBe('1.5 KB');
    });

    it('should respect forceUnit option', () => {
      expect(formatFileSize(1024, { forceUnit: 'B' })).toBe('1,024 B');
      expect(formatFileSize(1024 * 1024, { forceUnit: 'KB' })).toBe('1,024 KB');
      expect(formatFileSize(1024, { forceUnit: 'MB' })).toBe('0 MB');
    });

    it('should respect space option', () => {
      expect(formatFileSize(1024, { space: false })).toBe('1KB');
      expect(formatFileSize(0, { space: false })).toBe('0B');
    });
  });

  describe('edge cases', () => {
    it('should handle very large numbers', () => {
      expect(formatFileSize(1024 ** 5)).toBe('1,024 TB');
    });

    it('should handle fractional bytes', () => {
      expect(formatFileSize(1.5)).toBe('1.5 B');
    });
  });
});

describe('formatDate', () => {
  let fixedDate: Date;

  beforeEach(() => {
    fixedDate = new Date('2025-06-15T14:30:45');
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('format types', () => {
    it('should format as full datetime', () => {
      const date = new Date('2025-01-15T09:05:30');
      expect(formatDate(date, { format: 'full' })).toBe('2025-01-15 09:05:30');
    });

    it('should format as date only', () => {
      const date = new Date('2025-01-15T09:05:30');
      expect(formatDate(date, { format: 'date' })).toBe('2025-01-15');
    });

    it('should format as time only', () => {
      const date = new Date('2025-01-15T09:05:30');
      expect(formatDate(date, { format: 'time' })).toBe('09:05');
      expect(formatDate(date, { format: 'time', showSeconds: true })).toBe('09:05:30');
    });

    it('should format as datetime (default)', () => {
      const date = new Date('2025-01-15T09:05:30');
      expect(formatDate(date)).toBe('2025-01-15 09:05');
      expect(formatDate(date, { format: 'datetime' })).toBe('2025-01-15 09:05');
    });

    it('should format as short', () => {
      const date = new Date('2025-01-15T09:05:30');
      expect(formatDate(date, { format: 'short' })).toBe('01-15 09:05');
    });
  });

  describe('relative format', () => {
    it('should show "今天" for today', () => {
      const result = formatDate(fixedDate, { format: 'relative' });
      expect(result).toBe('今天 14:30');
    });

    it('should show "昨天" for yesterday', () => {
      const yesterday = new Date(fixedDate.getTime() - 24 * 60 * 60 * 1000);
      expect(formatDate(yesterday, { format: 'relative' })).toBe('昨天');
    });

    it('should show "明天" for tomorrow', () => {
      const tomorrow = new Date(fixedDate.getTime() + 24 * 60 * 60 * 1000);
      expect(formatDate(tomorrow, { format: 'relative' })).toBe('明天');
    });

    it('should show "N 天前" for past dates within 7 days', () => {
      const threeDaysAgo = new Date(fixedDate.getTime() - 3 * 24 * 60 * 60 * 1000);
      expect(formatDate(threeDaysAgo, { format: 'relative' })).toBe('3 天前');
    });

    it('should show "N 天後" for future dates', () => {
      const threeDaysLater = new Date(fixedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      expect(formatDate(threeDaysLater, { format: 'relative' })).toBe('3 天後');
    });

    it('should show full date for dates older than 7 days', () => {
      const tenDaysAgo = new Date(fixedDate.getTime() - 10 * 24 * 60 * 60 * 1000);
      expect(formatDate(tenDaysAgo, { format: 'relative' })).toBe('2025-06-05');
    });
  });

  describe('input types', () => {
    it('should handle Date object', () => {
      const date = new Date('2025-01-15T09:05:30');
      expect(formatDate(date)).toBe('2025-01-15 09:05');
    });

    it('should handle timestamp number', () => {
      const timestamp = new Date('2025-01-15T09:05:30').getTime();
      expect(formatDate(timestamp)).toBe('2025-01-15 09:05');
    });

    it('should handle date string', () => {
      expect(formatDate('2025-01-15T09:05:30')).toBe('2025-01-15 09:05');
    });

    it('should handle invalid date', () => {
      expect(formatDate('invalid-date')).toBe('無效日期');
      expect(formatDate(NaN)).toBe('無效日期');
    });
  });
});

describe('formatNumber', () => {
  describe('basic formatting', () => {
    it('should format integers with thousand separators', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1234567890)).toBe('1,234,567,890');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1234)).toBe('-1,234');
      expect(formatNumber(-1234567)).toBe('-1,234,567');
    });
  });

  describe('decimal handling', () => {
    it('should round to specified decimals', () => {
      expect(formatNumber(1234.5678, { decimals: 2 })).toBe('1,234.57');
      expect(formatNumber(1234.5678, { decimals: 1 })).toBe('1,234.6');
      expect(formatNumber(1234.5678, { decimals: 0 })).toBe('1,235');
    });

    it('should pad decimals when padDecimals is true', () => {
      expect(formatNumber(1234.5, { decimals: 2, padDecimals: true })).toBe('1,234.50');
      expect(formatNumber(1234, { decimals: 2, padDecimals: true })).toBe('1,234.00');
    });

    it('should not pad decimals by default', () => {
      expect(formatNumber(1234.5, { decimals: 2 })).toBe('1,234.5');
      expect(formatNumber(1234, { decimals: 2 })).toBe('1,234');
    });
  });

  describe('custom separator', () => {
    it('should use custom separator', () => {
      expect(formatNumber(1234567, { separator: ' ' })).toBe('1 234 567');
      expect(formatNumber(1234567, { separator: '.' })).toBe('1.234.567');
      expect(formatNumber(1234567, { separator: '' })).toBe('1234567');
    });
  });

  describe('special values', () => {
    it('should handle NaN', () => {
      expect(formatNumber(NaN)).toBe('NaN');
    });

    it('should handle Infinity', () => {
      expect(formatNumber(Infinity)).toBe('Infinity');
      expect(formatNumber(-Infinity)).toBe('-Infinity');
    });
  });

  describe('edge cases', () => {
    it('should handle very small decimals', () => {
      expect(formatNumber(0.001, { decimals: 3 })).toBe('0.001');
      expect(formatNumber(0.0001, { decimals: 4 })).toBe('0.0001');
    });

    it('should handle negative decimals with padding', () => {
      expect(formatNumber(-1234.5, { decimals: 2, padDecimals: true })).toBe('-1,234.50');
    });
  });
});
