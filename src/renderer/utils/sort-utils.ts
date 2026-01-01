import type { FileInfo } from '../../shared/types';
import type { SortBy, SortOrder } from '../stores/settings-store';

/**
 * 依檔案名稱排序（忽略大小寫，支援數字自然排序）
 * @returns 負數表示 a < b，正數表示 a > b，0 表示相等
 */
export function sortByName(a: FileInfo, b: FileInfo): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true });
}

/**
 * 依檔案大小排序
 * @returns 負數表示 a < b，正數表示 a > b，0 表示相等
 */
export function sortBySize(a: FileInfo, b: FileInfo): number {
  return a.size - b.size;
}

/**
 * 依修改日期排序
 * @returns 負數表示 a < b，正數表示 a > b，0 表示相等
 */
export function sortByDate(a: FileInfo, b: FileInfo): number {
  const timeA = a.modifiedTime instanceof Date ? a.modifiedTime.getTime() : 0;
  const timeB = b.modifiedTime instanceof Date ? b.modifiedTime.getTime() : 0;
  return timeA - timeB;
}

/**
 * 依副檔名排序（忽略大小寫，支援 Unicode）
 * @returns 負數表示 a < b，正數表示 a > b，0 表示相等
 */
export function sortByExtension(a: FileInfo, b: FileInfo): number {
  const extA = a.extension.toLowerCase();
  const extB = b.extension.toLowerCase();

  // 如果副檔名相同，則依名稱排序
  if (extA === extB) {
    return sortByName(a, b);
  }

  return extA.localeCompare(extB, undefined, { sensitivity: 'base' });
}

/**
 * 取得排序比較函數
 */
function getSortComparator(sortBy: SortBy): (a: FileInfo, b: FileInfo) => number {
  switch (sortBy) {
    case 'name':
      return sortByName;
    case 'size':
      return sortBySize;
    case 'date':
      return sortByDate;
    case 'extension':
      return sortByExtension;
    default:
      return sortByName;
  }
}

/**
 * 主排序函數：依指定條件排序檔案列表
 * @param files - 要排序的檔案列表
 * @param sortBy - 排序欄位 ('name' | 'size' | 'date' | 'extension')
 * @param sortOrder - 排序順序 ('asc' | 'desc')
 * @param foldersFirst - 是否將資料夾排在前面
 * @returns 排序後的新陣列（不修改原陣列）
 */
export function sortFiles(
  files: FileInfo[],
  sortBy: SortBy,
  sortOrder: SortOrder,
  foldersFirst: boolean,
): FileInfo[] {
  if (files.length <= 1) {
    return [...files];
  }

  const comparator = getSortComparator(sortBy);
  const orderMultiplier = sortOrder === 'desc' ? -1 : 1;

  return [...files].sort((a, b) => {
    // 資料夾優先處理
    if (foldersFirst) {
      if (a.isDirectory && !b.isDirectory) {
        return -1;
      }
      if (!a.isDirectory && b.isDirectory) {
        return 1;
      }
    }

    // 依指定欄位排序
    const result = comparator(a, b);
    return result * orderMultiplier;
  });
}
