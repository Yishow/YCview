import { describe, it, expect } from 'vitest';
import {
  filterByName,
  filterHiddenFiles,
  fuzzyMatch,
  highlightMatch,
  filterFiles,
} from '../filter-utils';
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

describe('filterByName', () => {
  describe('basic substring match', () => {
    it('should filter files by name containing query (case-insensitive)', () => {
      const files = [
        createMockFile({ name: 'document.txt' }),
        createMockFile({ name: 'image.png' }),
        createMockFile({ name: 'Documentation.md' }),
      ];
      const result = filterByName(files, 'doc');
      expect(result.length).toBe(2);
      expect(result.map((f) => f.name)).toEqual(['document.txt', 'Documentation.md']);
    });

    it('should be case-insensitive', () => {
      const files = [
        createMockFile({ name: 'README.md' }),
        createMockFile({ name: 'readme.txt' }),
        createMockFile({ name: 'ReadMe.json' }),
      ];
      const result = filterByName(files, 'README');
      expect(result.length).toBe(3);
    });
  });

  describe('empty query', () => {
    it('should return all files when query is empty string', () => {
      const files = [createMockFile({ name: 'file1.txt' }), createMockFile({ name: 'file2.txt' })];
      const result = filterByName(files, '');
      expect(result).toEqual(files);
    });

    it('should return all files when query is only whitespace', () => {
      const files = [createMockFile({ name: 'file1.txt' }), createMockFile({ name: 'file2.txt' })];
      const result = filterByName(files, '   ');
      expect(result).toEqual(files);
    });
  });

  describe('no match', () => {
    it('should return empty array when no files match', () => {
      const files = [createMockFile({ name: 'apple.txt' }), createMockFile({ name: 'banana.txt' })];
      const result = filterByName(files, 'xyz');
      expect(result).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty files array', () => {
      const result = filterByName([], 'test');
      expect(result).toEqual([]);
    });

    it('should match special characters', () => {
      const files = [
        createMockFile({ name: 'file-name.txt' }),
        createMockFile({ name: 'file_name.txt' }),
        createMockFile({ name: 'file.name.txt' }),
      ];
      const result = filterByName(files, '-');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('file-name.txt');
    });

    it('should handle Unicode characters', () => {
      const files = [
        createMockFile({ name: '文件.txt' }),
        createMockFile({ name: '档案.txt' }),
        createMockFile({ name: 'document.txt' }),
      ];
      const result = filterByName(files, '文');
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('文件.txt');
    });
  });
});

describe('filterHiddenFiles', () => {
  const hiddenFile = createMockFile({ name: '.hidden', isHidden: true });
  const visibleFile = createMockFile({ name: 'visible.txt', isHidden: false });
  const anotherHidden = createMockFile({ name: '.config', isHidden: true });

  describe('showHidden = true', () => {
    it('should return all files when showHidden is true', () => {
      const files = [hiddenFile, visibleFile, anotherHidden];
      const result = filterHiddenFiles(files, true);
      expect(result.length).toBe(3);
      expect(result).toEqual(files);
    });
  });

  describe('showHidden = false', () => {
    it('should filter out hidden files when showHidden is false', () => {
      const files = [hiddenFile, visibleFile, anotherHidden];
      const result = filterHiddenFiles(files, false);
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('visible.txt');
    });

    it('should return empty array when all files are hidden', () => {
      const files = [hiddenFile, anotherHidden];
      const result = filterHiddenFiles(files, false);
      expect(result).toEqual([]);
    });

    it('should return all files when none are hidden', () => {
      const files = [
        createMockFile({ name: 'file1.txt', isHidden: false }),
        createMockFile({ name: 'file2.txt', isHidden: false }),
      ];
      const result = filterHiddenFiles(files, false);
      expect(result.length).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      expect(filterHiddenFiles([], true)).toEqual([]);
      expect(filterHiddenFiles([], false)).toEqual([]);
    });
  });
});

describe('fuzzyMatch', () => {
  describe('basic substring match', () => {
    it('should match when query is substring of text', () => {
      expect(fuzzyMatch('document.txt', 'doc')).toBe(true);
      expect(fuzzyMatch('document.txt', 'ment')).toBe(true);
      expect(fuzzyMatch('document.txt', 'txt')).toBe(true);
    });
  });

  describe('fuzzy character matching', () => {
    it('should match non-contiguous characters in order (d-o-c-u-m-e-n-t)', () => {
      expect(fuzzyMatch('document.txt', 'dmt')).toBe(true);
      expect(fuzzyMatch('document.txt', 'dct')).toBe(true);
      expect(fuzzyMatch('document.txt', 'dctt')).toBe(true);
    });

    it('should match characters spread across the text', () => {
      expect(fuzzyMatch('MyDocument.txt', 'mdt')).toBe(true);
      expect(fuzzyMatch('application.js', 'apjs')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(fuzzyMatch('Document.TXT', 'DOC')).toBe(true);
      expect(fuzzyMatch('README.md', 'readmemd')).toBe(true);
    });
  });

  describe('empty query', () => {
    it('should return true when query is empty', () => {
      expect(fuzzyMatch('document.txt', '')).toBe(true);
    });

    it('should return true when query is only whitespace', () => {
      expect(fuzzyMatch('document.txt', '   ')).toBe(true);
    });
  });

  describe('no match', () => {
    it('should return false when query characters not in text', () => {
      expect(fuzzyMatch('document.txt', 'xyz')).toBe(false);
    });

    it('should return false when characters are out of order', () => {
      expect(fuzzyMatch('abc', 'cba')).toBe(false);
      expect(fuzzyMatch('document', 'tnemucod')).toBe(false);
    });

    it('should return false when query is longer than matching characters', () => {
      expect(fuzzyMatch('ab', 'abc')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', () => {
      expect(fuzzyMatch('', 'abc')).toBe(false);
    });

    it('should handle both empty text and query', () => {
      expect(fuzzyMatch('', '')).toBe(true);
    });

    it('should handle Unicode characters', () => {
      expect(fuzzyMatch('文件夹', '文夹')).toBe(true);
      expect(fuzzyMatch('文件夹', '件')).toBe(true);
    });

    it('should handle special characters', () => {
      expect(fuzzyMatch('file-name.txt', '-.')).toBe(true);
      expect(fuzzyMatch('[test](file).md', '[]')).toBe(true);
    });

    it('should handle single character matches', () => {
      expect(fuzzyMatch('a', 'a')).toBe(true);
      expect(fuzzyMatch('a', 'b')).toBe(false);
    });
  });
});

describe('highlightMatch', () => {
  describe('continuous match highlighting', () => {
    it('should highlight substring match at the beginning', () => {
      const result = highlightMatch('document.txt', 'doc');
      expect(result).toEqual([
        { text: 'doc', highlighted: true },
        { text: 'ument.txt', highlighted: false },
      ]);
    });

    it('should highlight substring match in the middle', () => {
      const result = highlightMatch('document.txt', 'ment');
      expect(result).toEqual([
        { text: 'docu', highlighted: false },
        { text: 'ment', highlighted: true },
        { text: '.txt', highlighted: false },
      ]);
    });

    it('should highlight substring match at the end', () => {
      const result = highlightMatch('document.txt', 'txt');
      expect(result).toEqual([
        { text: 'document.', highlighted: false },
        { text: 'txt', highlighted: true },
      ]);
    });

    it('should highlight entire text when query matches all', () => {
      const result = highlightMatch('doc', 'doc');
      expect(result).toEqual([{ text: 'doc', highlighted: true }]);
    });
  });

  describe('fuzzy match highlighting', () => {
    it('should highlight individual characters for fuzzy match', () => {
      const result = highlightMatch('document.txt', 'dmt');
      expect(result).toEqual([
        { text: 'd', highlighted: true },
        { text: 'ocu', highlighted: false },
        { text: 'm', highlighted: true },
        { text: 'en', highlighted: false },
        { text: 't', highlighted: true },
        { text: '.txt', highlighted: false },
      ]);
    });

    it('should handle fuzzy match with adjacent characters', () => {
      const result = highlightMatch('abcdef', 'ace');
      expect(result).toEqual([
        { text: 'a', highlighted: true },
        { text: 'b', highlighted: false },
        { text: 'c', highlighted: true },
        { text: 'd', highlighted: false },
        { text: 'e', highlighted: true },
        { text: 'f', highlighted: false },
      ]);
    });
  });

  describe('empty query', () => {
    it('should return single unhighlighted segment for empty query', () => {
      const result = highlightMatch('document.txt', '');
      expect(result).toEqual([{ text: 'document.txt', highlighted: false }]);
    });

    it('should return single unhighlighted segment for whitespace query', () => {
      const result = highlightMatch('document.txt', '   ');
      expect(result).toEqual([{ text: 'document.txt', highlighted: false }]);
    });
  });

  describe('no match', () => {
    it('should return original text unhighlighted when no match', () => {
      const result = highlightMatch('document.txt', 'xyz');
      expect(result).toEqual([{ text: 'document.txt', highlighted: false }]);
    });

    it('should return original text unhighlighted for out-of-order query', () => {
      const result = highlightMatch('abc', 'cba');
      expect(result).toEqual([{ text: 'abc', highlighted: false }]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty text', () => {
      const result = highlightMatch('', 'abc');
      expect(result).toEqual([]);
    });

    it('should handle empty text with empty query', () => {
      const result = highlightMatch('', '');
      expect(result).toEqual([{ text: '', highlighted: false }]);
    });

    it('should be case-insensitive', () => {
      const result = highlightMatch('Document.TXT', 'DOC');
      expect(result).toEqual([
        { text: 'Doc', highlighted: true },
        { text: 'ument.TXT', highlighted: false },
      ]);
    });

    it('should handle Unicode characters', () => {
      const result = highlightMatch('文件夹', '文');
      expect(result).toEqual([
        { text: '文', highlighted: true },
        { text: '件夹', highlighted: false },
      ]);
    });

    it('should handle special characters', () => {
      const result = highlightMatch('file-name.txt', '-');
      expect(result).toEqual([
        { text: 'file', highlighted: false },
        { text: '-', highlighted: true },
        { text: 'name.txt', highlighted: false },
      ]);
    });

    it('should handle single character text', () => {
      expect(highlightMatch('a', 'a')).toEqual([{ text: 'a', highlighted: true }]);
      expect(highlightMatch('a', 'b')).toEqual([{ text: 'a', highlighted: false }]);
    });
  });
});

describe('filterFiles', () => {
  const file1 = createMockFile({ name: 'document.txt', isHidden: false });
  const file2 = createMockFile({ name: 'image.png', isHidden: false });
  const file3 = createMockFile({ name: '.hidden', isHidden: true });
  const file4 = createMockFile({ name: 'Documentation.md', isHidden: false });
  const file5 = createMockFile({ name: '.config', isHidden: true });

  describe('combination of query + showHiddenFiles + useFuzzyMatch', () => {
    it('should filter by query with hidden files shown (no fuzzy)', () => {
      const files = [file1, file2, file3, file4, file5];
      const result = filterFiles(files, {
        query: 'doc',
        showHiddenFiles: true,
        useFuzzyMatch: false,
      });
      expect(result.length).toBe(2);
      expect(result.map((f) => f.name)).toEqual(['document.txt', 'Documentation.md']);
    });

    it('should filter by query with hidden files hidden (no fuzzy)', () => {
      const files = [file1, file2, file3, file4, file5];
      const result = filterFiles(files, {
        query: 'doc',
        showHiddenFiles: false,
        useFuzzyMatch: false,
      });
      expect(result.length).toBe(2);
      expect(result.map((f) => f.name)).toEqual(['document.txt', 'Documentation.md']);
    });

    it('should filter by fuzzy query with hidden files shown', () => {
      const files = [file1, file2, file3, file4, file5];
      const result = filterFiles(files, {
        query: 'dmt',
        showHiddenFiles: true,
        useFuzzyMatch: true,
      });
      expect(result.length).toBe(2);
      expect(result.map((f) => f.name)).toEqual(['document.txt', 'Documentation.md']);
    });

    it('should filter by fuzzy query with hidden files hidden', () => {
      const files = [file1, file2, file3, file4, file5];
      const result = filterFiles(files, {
        query: 'dmt',
        showHiddenFiles: false,
        useFuzzyMatch: true,
      });
      expect(result.length).toBe(2);
    });

    it('should only filter hidden files when query is empty', () => {
      const files = [file1, file2, file3, file4, file5];
      const result = filterFiles(files, {
        query: '',
        showHiddenFiles: false,
        useFuzzyMatch: false,
      });
      expect(result.length).toBe(3);
      expect(result.every((f) => !f.isHidden)).toBe(true);
    });
  });

  describe('default options', () => {
    it('should return all files with default options', () => {
      const files = [file1, file2, file3, file4, file5];
      const result = filterFiles(files);
      expect(result.length).toBe(5);
    });

    it('should return all files with empty options object', () => {
      const files = [file1, file2, file3, file4, file5];
      const result = filterFiles(files, {});
      expect(result.length).toBe(5);
    });

    it('should use substring match by default (not fuzzy)', () => {
      const files = [file1, file2, file3, file4, file5];
      const result = filterFiles(files, { query: 'dmt' });
      expect(result.length).toBe(0);
    });

    it('should show hidden files by default', () => {
      const files = [file3, file5];
      const result = filterFiles(files, {});
      expect(result.length).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty input', () => {
      const result = filterFiles([]);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty input with options', () => {
      const result = filterFiles([], { query: 'test', showHiddenFiles: false });
      expect(result).toEqual([]);
    });

    it('should handle empty query with whitespace', () => {
      const files = [file1, file2];
      const result = filterFiles(files, { query: '   ' });
      expect(result.length).toBe(2);
    });

    it('should return empty array when no matches found', () => {
      const files = [file1, file2, file4];
      const result = filterFiles(files, { query: 'xyz' });
      expect(result).toEqual([]);
    });

    it('should handle files with special characters in names', () => {
      const specialFiles = [
        createMockFile({ name: 'file-with-dashes.txt' }),
        createMockFile({ name: 'file_with_underscores.txt' }),
        createMockFile({ name: 'file.with.dots.txt' }),
      ];
      const result = filterFiles(specialFiles, { query: '-' });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('file-with-dashes.txt');
    });

    it('should handle Unicode file names', () => {
      const unicodeFiles = [
        createMockFile({ name: '文件.txt' }),
        createMockFile({ name: '图片.png' }),
        createMockFile({ name: 'document.txt' }),
      ];
      const result = filterFiles(unicodeFiles, { query: '文' });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('文件.txt');
    });

    it('should apply hidden filter before query filter', () => {
      const files = [
        createMockFile({ name: '.document', isHidden: true }),
        createMockFile({ name: 'document.txt', isHidden: false }),
      ];
      const result = filterFiles(files, {
        query: 'doc',
        showHiddenFiles: false,
      });
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('document.txt');
    });
  });

  describe('fuzzy vs substring matching', () => {
    it('should use substring matching when useFuzzyMatch is false', () => {
      const files = [createMockFile({ name: 'document.txt' })];
      expect(filterFiles(files, { query: 'doc', useFuzzyMatch: false }).length).toBe(1);
      expect(filterFiles(files, { query: 'dmt', useFuzzyMatch: false }).length).toBe(0);
    });

    it('should use fuzzy matching when useFuzzyMatch is true', () => {
      const files = [createMockFile({ name: 'document.txt' })];
      expect(filterFiles(files, { query: 'doc', useFuzzyMatch: true }).length).toBe(1);
      expect(filterFiles(files, { query: 'dmt', useFuzzyMatch: true }).length).toBe(1);
    });
  });
});
