import type { FileInfo } from '../../shared/types';

export interface FilterOptions {
  /** 搜尋查詢字串 */
  query?: string;
  /** 是否顯示隱藏檔案，預設 true */
  showHiddenFiles?: boolean;
  /** 是否使用模糊匹配，預設 false */
  useFuzzyMatch?: boolean;
}

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * 依檔名過濾檔案（忽略大小寫）
 * @example filterByName(files, 'doc') // 返回檔名包含 'doc' 的檔案
 */
export function filterByName(files: FileInfo[], query: string): FileInfo[] {
  if (!query || query.trim() === '') {
    return files;
  }

  const lowerQuery = query.toLowerCase();
  return files.filter((file) => file.name.toLowerCase().includes(lowerQuery));
}

/**
 * 過濾隱藏檔案
 * @example filterHiddenFiles(files, false) // 返回非隱藏檔案
 */
export function filterHiddenFiles(files: FileInfo[], showHidden: boolean): FileInfo[] {
  if (showHidden) {
    return files;
  }
  return files.filter((file) => !file.isHidden);
}

/**
 * 模糊匹配（支援連續字元匹配）
 * 查詢字串中的每個字元必須按順序出現在目標文字中
 * @example fuzzyMatch('document.txt', 'doc') // true
 * @example fuzzyMatch('document.txt', 'dmt') // true (d-ocu-m-en-t)
 * @example fuzzyMatch('document.txt', 'xyz') // false
 */
export function fuzzyMatch(text: string, query: string): boolean {
  if (!query || query.trim() === '') {
    return true;
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  let textIndex = 0;
  let queryIndex = 0;

  while (textIndex < lowerText.length && queryIndex < lowerQuery.length) {
    if (lowerText[textIndex] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
    textIndex++;
  }

  return queryIndex === lowerQuery.length;
}

/**
 * 高亮匹配區段
 * 返回文字區段陣列，標記哪些部分匹配查詢字串
 * @example highlightMatch('document.txt', 'doc') // [{ text: 'doc', highlighted: true }, { text: 'ument.txt', highlighted: false }]
 */
export function highlightMatch(text: string, query: string): HighlightSegment[] {
  if (!query || query.trim() === '') {
    return [{ text, highlighted: false }];
  }

  if (!text) {
    return [];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // 首先嘗試連續匹配（子字串匹配）
  const substringIndex = lowerText.indexOf(lowerQuery);
  if (substringIndex !== -1) {
    const segments: HighlightSegment[] = [];

    if (substringIndex > 0) {
      segments.push({
        text: text.slice(0, substringIndex),
        highlighted: false,
      });
    }

    segments.push({
      text: text.slice(substringIndex, substringIndex + query.length),
      highlighted: true,
    });

    if (substringIndex + query.length < text.length) {
      segments.push({
        text: text.slice(substringIndex + query.length),
        highlighted: false,
      });
    }

    return segments;
  }

  // 如果沒有連續匹配，嘗試模糊匹配高亮
  const segments: HighlightSegment[] = [];
  let textIndex = 0;
  let queryIndex = 0;
  let currentSegment = '';
  let isCurrentHighlighted = false;

  while (textIndex < text.length) {
    const textChar = text[textIndex];
    const lowerTextChar = lowerText[textIndex];

    if (queryIndex < lowerQuery.length && lowerTextChar === lowerQuery[queryIndex]) {
      // 匹配字元
      if (!isCurrentHighlighted && currentSegment) {
        segments.push({ text: currentSegment, highlighted: false });
        currentSegment = '';
      }
      isCurrentHighlighted = true;
      currentSegment += textChar;
      queryIndex++;
    } else {
      // 非匹配字元
      if (isCurrentHighlighted && currentSegment) {
        segments.push({ text: currentSegment, highlighted: true });
        currentSegment = '';
      }
      isCurrentHighlighted = false;
      currentSegment += textChar;
    }
    textIndex++;
  }

  // 處理剩餘區段
  if (currentSegment) {
    segments.push({ text: currentSegment, highlighted: isCurrentHighlighted });
  }

  // 如果查詢沒有完全匹配，返回無高亮的原始文字
  if (queryIndex < lowerQuery.length) {
    return [{ text, highlighted: false }];
  }

  return segments;
}

/**
 * 主過濾函數 - 組合多種過濾條件
 * @example filterFiles(files, { query: 'doc', showHiddenFiles: false, useFuzzyMatch: true })
 */
export function filterFiles(files: FileInfo[], options: FilterOptions = {}): FileInfo[] {
  const { query = '', showHiddenFiles = true, useFuzzyMatch = false } = options;

  let result = files;

  // 過濾隱藏檔案
  result = filterHiddenFiles(result, showHiddenFiles);

  // 依查詢過濾
  if (query && query.trim() !== '') {
    if (useFuzzyMatch) {
      result = result.filter((file) => fuzzyMatch(file.name, query));
    } else {
      result = filterByName(result, query);
    }
  }

  return result;
}
