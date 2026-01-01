/**
 * Rename Engine - 批次改名引擎
 * 提供多種檔名轉換規則和衝突檢測功能
 */

// 改名規則類型
export type RenameRule =
  | {
      type: 'findReplace';
      find: string;
      replace: string;
      caseSensitive: boolean;
      useRegex: boolean;
    }
  | { type: 'prefix'; value: string }
  | { type: 'suffix'; value: string }
  | {
      type: 'sequence';
      start: number;
      step: number;
      digits: number;
      position: 'prefix' | 'suffix' | 'replace';
    }
  | { type: 'case'; mode: 'upper' | 'lower' | 'title' | 'sentence' }
  | { type: 'removeChars'; chars: string };

// 預覽結果
export interface RenamePreview {
  originalName: string;
  newName: string;
  hasConflict: boolean;
  hasError: boolean;
  errorMessage?: string;
}

// 檔名驗證結果
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// 非法字元（Windows 檔案系統限制）
const ILLEGAL_CHARS = /[\\/:*?"<>|]/;
const ILLEGAL_CHARS_DESCRIPTION = '\\ / : * ? " < > |';

// 最大檔名長度
const MAX_FILENAME_LENGTH = 255;

/**
 * 驗證檔名是否合法
 */
export function validateFilename(filename: string): ValidationResult {
  // 空檔名
  if (!filename || filename.trim().length === 0) {
    return { valid: false, message: 'Filename cannot be empty' };
  }

  // 包含非法字元
  if (ILLEGAL_CHARS.test(filename)) {
    return {
      valid: false,
      message: `Filename contains illegal characters: ${ILLEGAL_CHARS_DESCRIPTION}`,
    };
  }

  // 檔名過長
  if (filename.length > MAX_FILENAME_LENGTH) {
    return {
      valid: false,
      message: `Filename exceeds maximum length of ${MAX_FILENAME_LENGTH} characters`,
    };
  }

  // Windows 保留名稱
  const reservedNames = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];

  const nameWithoutExt = filename.split('.')[0].toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return {
      valid: false,
      message: `"${nameWithoutExt}" is a reserved Windows filename`,
    };
  }

  // 以空格或點號結尾
  if (filename.endsWith(' ') || filename.endsWith('.')) {
    return {
      valid: false,
      message: 'Filename cannot end with a space or period',
    };
  }

  return { valid: true };
}

/**
 * 分離檔名和副檔名
 */
export function splitFilename(filename: string): { name: string; ext: string } {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return { name: filename, ext: '' };
  }
  return {
    name: filename.substring(0, lastDotIndex),
    ext: filename.substring(lastDotIndex),
  };
}

/**
 * 轉換標題格式（每個單字首字母大寫）
 */
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

/**
 * 轉換句首格式（只有第一個字母大寫）
 */
function toSentenceCase(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 套用單一規則到檔名
 * @param filename 原始檔名
 * @param rule 要套用的規則
 * @param index 檔案索引（用於序號規則）
 */
export function applyRule(filename: string, rule: RenameRule, index: number): string {
  const { name, ext } = splitFilename(filename);

  switch (rule.type) {
    case 'findReplace': {
      const { find, replace, caseSensitive, useRegex } = rule;
      if (!find) return filename;

      try {
        if (useRegex) {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(find, flags);
          const newName = name.replace(regex, replace);
          return newName + ext;
        } else {
          let result = name;
          if (caseSensitive) {
            result = name.split(find).join(replace);
          } else {
            // 不區分大小寫的替換
            const regex = new RegExp(escapeRegExp(find), 'gi');
            result = name.replace(regex, replace);
          }
          return result + ext;
        }
      } catch {
        // 正則表達式無效，返回原檔名
        return filename;
      }
    }

    case 'prefix': {
      return rule.value + name + ext;
    }

    case 'suffix': {
      return name + rule.value + ext;
    }

    case 'sequence': {
      const { start, step, digits, position } = rule;
      const seqNum = start + index * step;
      const paddedNum = String(seqNum).padStart(digits, '0');

      switch (position) {
        case 'prefix':
          return paddedNum + name + ext;
        case 'suffix':
          return name + paddedNum + ext;
        case 'replace':
          return paddedNum + ext;
        default:
          return filename;
      }
    }

    case 'case': {
      let newName: string;
      switch (rule.mode) {
        case 'upper':
          newName = name.toUpperCase();
          break;
        case 'lower':
          newName = name.toLowerCase();
          break;
        case 'title':
          newName = toTitleCase(name);
          break;
        case 'sentence':
          newName = toSentenceCase(name);
          break;
        default:
          newName = name;
      }
      return newName + ext;
    }

    case 'removeChars': {
      const { chars } = rule;
      if (!chars) return filename;

      let newName = name;
      for (const char of chars) {
        newName = newName.split(char).join('');
      }
      return newName + ext;
    }

    default:
      return filename;
  }
}

/**
 * 轉義正則表達式特殊字元
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 套用多個規則到檔名
 */
export function applyRules(filename: string, rules: RenameRule[], index: number): string {
  let result = filename;
  for (const rule of rules) {
    result = applyRule(result, rule, index);
  }
  return result;
}

/**
 * 檢測重複檔名（衝突）
 */
export function detectConflicts(previews: RenamePreview[]): RenamePreview[] {
  const nameCount = new Map<string, number>();

  // 計算每個新檔名出現的次數
  for (const preview of previews) {
    if (!preview.hasError) {
      const lowerName = preview.newName.toLowerCase();
      nameCount.set(lowerName, (nameCount.get(lowerName) || 0) + 1);
    }
  }

  // 標記重複的檔名
  return previews.map((preview) => {
    if (preview.hasError) {
      return preview;
    }

    const lowerName = preview.newName.toLowerCase();
    const count = nameCount.get(lowerName) || 0;

    if (count > 1) {
      return {
        ...preview,
        hasConflict: true,
      };
    }

    // 檢查是否與其他檔案的原始檔名衝突（排除自己）
    const conflictWithOriginal = previews.some(
      (other) =>
        other !== preview &&
        other.originalName.toLowerCase() === preview.newName.toLowerCase() &&
        other.newName.toLowerCase() !== other.originalName.toLowerCase(),
    );

    if (conflictWithOriginal) {
      return {
        ...preview,
        hasConflict: true,
      };
    }

    return preview;
  });
}

/**
 * 產生預覽結果
 * @param files 原始檔名列表
 * @param rules 要套用的規則列表
 */
export function generatePreview(files: string[], rules: RenameRule[]): RenamePreview[] {
  const previews: RenamePreview[] = files.map((filename, index) => {
    // 套用所有規則
    const newName = applyRules(filename, rules, index);

    // 驗證新檔名
    const validation = validateFilename(newName);

    if (!validation.valid) {
      return {
        originalName: filename,
        newName,
        hasConflict: false,
        hasError: true,
        errorMessage: validation.message,
      };
    }

    return {
      originalName: filename,
      newName,
      hasConflict: false,
      hasError: false,
    };
  });

  // 檢測衝突
  return detectConflicts(previews);
}

/**
 * 建立空規則
 */
export function createEmptyRule(type: RenameRule['type']): RenameRule {
  switch (type) {
    case 'findReplace':
      return { type: 'findReplace', find: '', replace: '', caseSensitive: false, useRegex: false };
    case 'prefix':
      return { type: 'prefix', value: '' };
    case 'suffix':
      return { type: 'suffix', value: '' };
    case 'sequence':
      return { type: 'sequence', start: 1, step: 1, digits: 2, position: 'suffix' };
    case 'case':
      return { type: 'case', mode: 'lower' };
    case 'removeChars':
      return { type: 'removeChars', chars: '' };
    default:
      return { type: 'prefix', value: '' };
  }
}

/**
 * 取得規則類型的顯示名稱
 */
export function getRuleTypeName(type: RenameRule['type']): string {
  switch (type) {
    case 'findReplace':
      return 'Find & Replace';
    case 'prefix':
      return 'Add Prefix';
    case 'suffix':
      return 'Add Suffix';
    case 'sequence':
      return 'Sequence Number';
    case 'case':
      return 'Change Case';
    case 'removeChars':
      return 'Remove Characters';
    default:
      return 'Unknown';
  }
}

/**
 * 取得大小寫模式的顯示名稱
 */
export function getCaseModeName(mode: 'upper' | 'lower' | 'title' | 'sentence'): string {
  switch (mode) {
    case 'upper':
      return 'UPPERCASE';
    case 'lower':
      return 'lowercase';
    case 'title':
      return 'Title Case';
    case 'sentence':
      return 'Sentence case';
    default:
      return mode;
  }
}
