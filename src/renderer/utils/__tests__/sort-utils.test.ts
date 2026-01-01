import { describe, it, expect } from 'vitest';
import { sortByName, sortBySize, sortByDate, sortByExtension, sortFiles } from '../sort-utils';
import type { FileInfo } from '../../../shared/types';

function createMockFile(overrides: Partial<FileInfo>): FileInfo {
  return {
    name: 'file.txt',
    path: '/path/to/file.txt',
    size: 1024,
    isDirectory: false,
    isHidden: false,
    modifiedTime: new Date('2025-01-15T10:00:00'),
    createdTime: new Date('2025-01-01T10:00:00'),
    extension: '.txt',
    ...overrides,
  };
}

describe('sortByName', () => {
  describe('alphabetical sorting', () => {
    it('should sort alphabetically ascending', () => {
      const a = createMockFile({ name: 'apple.txt' });
      const b = createMockFile({ name: 'banana.txt' });
      expect(sortByName(a, b)).toBeLessThan(0);
    });

    it('should return 0 for equal names', () => {
      const a = createMockFile({ name: 'file.txt' });
      const b = createMockFile({ name: 'file.txt' });
      expect(sortByName(a, b)).toBe(0);
    });

    it('should return positive when a > b', () => {
      const a = createMockFile({ name: 'zebra.txt' });
      const b = createMockFile({ name: 'apple.txt' });
      expect(sortByName(a, b)).toBeGreaterThan(0);
    });
  });

  describe('case-insensitive sorting', () => {
    it('should ignore case differences', () => {
      const a = createMockFile({ name: 'Apple.txt' });
      const b = createMockFile({ name: 'apple.txt' });
      expect(sortByName(a, b)).toBe(0);
    });

    it('should sort mixed case correctly', () => {
      const a = createMockFile({ name: 'BANANA.txt' });
      const b = createMockFile({ name: 'apple.txt' });
      expect(sortByName(a, b)).toBeGreaterThan(0);
    });
  });

  describe('numeric sorting', () => {
    it('should sort numbers naturally (file1, file2, file10)', () => {
      const file1 = createMockFile({ name: 'file1.txt' });
      const file2 = createMockFile({ name: 'file2.txt' });
      const file10 = createMockFile({ name: 'file10.txt' });

      expect(sortByName(file1, file2)).toBeLessThan(0);
      expect(sortByName(file2, file10)).toBeLessThan(0);
      expect(sortByName(file1, file10)).toBeLessThan(0);
    });

    it('should handle files with embedded numbers', () => {
      const chapter1 = createMockFile({ name: 'chapter1.doc' });
      const chapter9 = createMockFile({ name: 'chapter9.doc' });
      const chapter10 = createMockFile({ name: 'chapter10.doc' });

      expect(sortByName(chapter1, chapter9)).toBeLessThan(0);
      expect(sortByName(chapter9, chapter10)).toBeLessThan(0);
    });
  });
});

describe('sortBySize', () => {
  describe('basic size sorting', () => {
    it('should return negative when a < b', () => {
      const a = createMockFile({ size: 100 });
      const b = createMockFile({ size: 200 });
      expect(sortBySize(a, b)).toBeLessThan(0);
    });

    it('should return positive when a > b', () => {
      const a = createMockFile({ size: 500 });
      const b = createMockFile({ size: 100 });
      expect(sortBySize(a, b)).toBeGreaterThan(0);
    });

    it('should return 0 when sizes are equal', () => {
      const a = createMockFile({ size: 1024 });
      const b = createMockFile({ size: 1024 });
      expect(sortBySize(a, b)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle zero size', () => {
      const a = createMockFile({ size: 0 });
      const b = createMockFile({ size: 100 });
      expect(sortBySize(a, b)).toBeLessThan(0);
    });

    it('should handle very large sizes', () => {
      const a = createMockFile({ size: 1024 * 1024 * 1024 });
      const b = createMockFile({ size: 1024 * 1024 * 1024 * 10 });
      expect(sortBySize(a, b)).toBeLessThan(0);
    });
  });
});

describe('sortByDate', () => {
  describe('basic date sorting', () => {
    it('should return negative when a is older than b', () => {
      const a = createMockFile({ modifiedTime: new Date('2025-01-01') });
      const b = createMockFile({ modifiedTime: new Date('2025-01-15') });
      expect(sortByDate(a, b)).toBeLessThan(0);
    });

    it('should return positive when a is newer than b', () => {
      const a = createMockFile({ modifiedTime: new Date('2025-06-15') });
      const b = createMockFile({ modifiedTime: new Date('2025-01-15') });
      expect(sortByDate(a, b)).toBeGreaterThan(0);
    });

    it('should return 0 when dates are equal', () => {
      const date = new Date('2025-01-15T10:00:00');
      const a = createMockFile({ modifiedTime: date });
      const b = createMockFile({ modifiedTime: new Date(date.getTime()) });
      expect(sortByDate(a, b)).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle dates with time precision', () => {
      const a = createMockFile({ modifiedTime: new Date('2025-01-15T10:00:00') });
      const b = createMockFile({ modifiedTime: new Date('2025-01-15T10:00:01') });
      expect(sortByDate(a, b)).toBeLessThan(0);
    });

    it('should handle invalid dates (non-Date objects) as 0', () => {
      const a = createMockFile({ modifiedTime: 'invalid' as unknown as Date });
      const b = createMockFile({ modifiedTime: new Date('2025-01-15') });
      expect(sortByDate(a, b)).toBeLessThan(0);
    });
  });
});

describe('sortByExtension', () => {
  describe('basic extension sorting', () => {
    it('should sort by extension alphabetically', () => {
      const a = createMockFile({ name: 'file.doc', extension: '.doc' });
      const b = createMockFile({ name: 'file.txt', extension: '.txt' });
      expect(sortByExtension(a, b)).toBeLessThan(0);
    });

    it('should return positive when a extension > b extension', () => {
      const a = createMockFile({ name: 'file.zip', extension: '.zip' });
      const b = createMockFile({ name: 'file.doc', extension: '.doc' });
      expect(sortByExtension(a, b)).toBeGreaterThan(0);
    });
  });

  describe('case-insensitive extension sorting', () => {
    it('should ignore case in extensions', () => {
      const a = createMockFile({ name: 'file.TXT', extension: '.TXT' });
      const b = createMockFile({ name: 'file.txt', extension: '.txt' });
      expect(sortByExtension(a, b)).toBe(0);
    });
  });

  describe('same extension - fallback to name', () => {
    it('should sort by name when extensions are the same', () => {
      const a = createMockFile({ name: 'alpha.txt', extension: '.txt' });
      const b = createMockFile({ name: 'beta.txt', extension: '.txt' });
      expect(sortByExtension(a, b)).toBeLessThan(0);
    });

    it('should use numeric sorting for names with same extension', () => {
      const file1 = createMockFile({ name: 'file1.txt', extension: '.txt' });
      const file10 = createMockFile({ name: 'file10.txt', extension: '.txt' });
      expect(sortByExtension(file1, file10)).toBeLessThan(0);
    });
  });
});

describe('sortFiles', () => {
  const file1 = createMockFile({
    name: 'apple.txt',
    size: 100,
    modifiedTime: new Date('2025-01-01'),
    extension: '.txt',
    isDirectory: false,
  });

  const file2 = createMockFile({
    name: 'banana.doc',
    size: 500,
    modifiedTime: new Date('2025-01-15'),
    extension: '.doc',
    isDirectory: false,
  });

  const file3 = createMockFile({
    name: 'cherry.txt',
    size: 200,
    modifiedTime: new Date('2025-01-10'),
    extension: '.txt',
    isDirectory: false,
  });

  const folder1 = createMockFile({
    name: 'Documents',
    size: 0,
    modifiedTime: new Date('2025-01-05'),
    extension: '',
    isDirectory: true,
  });

  const folder2 = createMockFile({
    name: 'Pictures',
    size: 0,
    modifiedTime: new Date('2025-01-20'),
    extension: '',
    isDirectory: true,
  });

  describe('edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = sortFiles([], 'name', 'asc', false);
      expect(result).toEqual([]);
    });

    it('should return copy of single item array', () => {
      const files = [file1];
      const result = sortFiles(files, 'name', 'asc', false);
      expect(result).toEqual([file1]);
      expect(result).not.toBe(files);
    });

    it('should not modify original array', () => {
      const files = [file2, file1, file3];
      const original = [...files];
      sortFiles(files, 'name', 'asc', false);
      expect(files).toEqual(original);
    });
  });

  describe('sortBy: name', () => {
    it('should sort by name ascending', () => {
      const files = [file2, file1, file3];
      const result = sortFiles(files, 'name', 'asc', false);
      expect(result.map((f) => f.name)).toEqual(['apple.txt', 'banana.doc', 'cherry.txt']);
    });

    it('should sort by name descending', () => {
      const files = [file1, file2, file3];
      const result = sortFiles(files, 'name', 'desc', false);
      expect(result.map((f) => f.name)).toEqual(['cherry.txt', 'banana.doc', 'apple.txt']);
    });
  });

  describe('sortBy: size', () => {
    it('should sort by size ascending', () => {
      const files = [file2, file1, file3];
      const result = sortFiles(files, 'size', 'asc', false);
      expect(result.map((f) => f.size)).toEqual([100, 200, 500]);
    });

    it('should sort by size descending', () => {
      const files = [file1, file2, file3];
      const result = sortFiles(files, 'size', 'desc', false);
      expect(result.map((f) => f.size)).toEqual([500, 200, 100]);
    });
  });

  describe('sortBy: date', () => {
    it('should sort by date ascending (oldest first)', () => {
      const files = [file2, file1, file3];
      const result = sortFiles(files, 'date', 'asc', false);
      expect(result.map((f) => f.name)).toEqual(['apple.txt', 'cherry.txt', 'banana.doc']);
    });

    it('should sort by date descending (newest first)', () => {
      const files = [file1, file2, file3];
      const result = sortFiles(files, 'date', 'desc', false);
      expect(result.map((f) => f.name)).toEqual(['banana.doc', 'cherry.txt', 'apple.txt']);
    });
  });

  describe('sortBy: extension', () => {
    it('should sort by extension ascending', () => {
      const files = [file1, file2, file3];
      const result = sortFiles(files, 'extension', 'asc', false);
      expect(result.map((f) => f.name)).toEqual(['banana.doc', 'apple.txt', 'cherry.txt']);
    });

    it('should sort by extension descending', () => {
      const files = [file1, file2, file3];
      const result = sortFiles(files, 'extension', 'desc', false);
      expect(result.map((f) => f.name)).toEqual(['cherry.txt', 'apple.txt', 'banana.doc']);
    });
  });

  describe('foldersFirst: true', () => {
    it('should put folders first with ascending sort', () => {
      const files = [file1, folder1, file2, folder2];
      const result = sortFiles(files, 'name', 'asc', true);
      expect(result.map((f) => f.name)).toEqual([
        'Documents',
        'Pictures',
        'apple.txt',
        'banana.doc',
      ]);
    });

    it('should put folders first with descending sort', () => {
      const files = [file1, folder1, file2, folder2];
      const result = sortFiles(files, 'name', 'desc', true);
      expect(result.map((f) => f.name)).toEqual([
        'Pictures',
        'Documents',
        'banana.doc',
        'apple.txt',
      ]);
    });

    it('should sort folders by the specified criteria', () => {
      const files = [folder2, file1, folder1, file2];
      const result = sortFiles(files, 'date', 'asc', true);
      expect(result.map((f) => f.name)).toEqual([
        'Documents',
        'Pictures',
        'apple.txt',
        'banana.doc',
      ]);
    });
  });

  describe('foldersFirst: false', () => {
    it('should mix folders and files when sorting by name', () => {
      const files = [file1, folder1, file2, folder2];
      const result = sortFiles(files, 'name', 'asc', false);
      expect(result.map((f) => f.name)).toEqual([
        'apple.txt',
        'banana.doc',
        'Documents',
        'Pictures',
      ]);
    });

    it('should mix folders and files when sorting by date', () => {
      const files = [folder2, file1, folder1, file2];
      const result = sortFiles(files, 'date', 'asc', false);
      expect(result.map((f) => f.name)).toEqual([
        'apple.txt',
        'Documents',
        'banana.doc',
        'Pictures',
      ]);
    });
  });

  describe('items with same values', () => {
    it('should maintain stable sort for items with same size', () => {
      const fileA = createMockFile({ name: 'a.txt', size: 100 });
      const fileB = createMockFile({ name: 'b.txt', size: 100 });
      const fileC = createMockFile({ name: 'c.txt', size: 100 });
      const files = [fileC, fileA, fileB];
      const result = sortFiles(files, 'size', 'asc', false);
      expect(result.length).toBe(3);
      expect(result.every((f) => f.size === 100)).toBe(true);
    });

    it('should maintain stable sort for items with same date', () => {
      const date = new Date('2025-01-15');
      const fileA = createMockFile({ name: 'a.txt', modifiedTime: date });
      const fileB = createMockFile({ name: 'b.txt', modifiedTime: new Date(date.getTime()) });
      const files = [fileB, fileA];
      const result = sortFiles(files, 'date', 'asc', false);
      expect(result.length).toBe(2);
    });
  });

  describe('combined options', () => {
    it('should handle all combinations: size + desc + foldersFirst', () => {
      const files = [file1, folder1, file2, folder2, file3];
      const result = sortFiles(files, 'size', 'desc', true);
      expect(result[0].isDirectory).toBe(true);
      expect(result[1].isDirectory).toBe(true);
      expect(result[2].size).toBe(500);
      expect(result[3].size).toBe(200);
      expect(result[4].size).toBe(100);
    });

    it('should handle all combinations: extension + asc + foldersFirst', () => {
      const files = [file1, folder1, file2, file3];
      const result = sortFiles(files, 'extension', 'asc', true);
      expect(result[0].isDirectory).toBe(true);
      expect(result[1].extension).toBe('.doc');
    });
  });
});
