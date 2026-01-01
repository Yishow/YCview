export type FileSizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

export interface FormatFileSizeOptions {
  /** 小數位數，預設 2 */
  decimals?: number;
  /** 強制使用指定單位 */
  forceUnit?: FileSizeUnit;
  /** 是否在數字與單位間加空格，預設 true */
  space?: boolean;
}

export type DateFormatType = 'full' | 'date' | 'time' | 'datetime' | 'relative' | 'short';

export interface FormatDateOptions {
  /** 日期格式類型，預設 'datetime' */
  format?: DateFormatType;
  /** 是否顯示秒數（適用於 full 格式），預設 false */
  showSeconds?: boolean;
}

export interface FormatNumberOptions {
  /** 小數位數，預設 0 */
  decimals?: number;
  /** 千分位分隔符，預設 ',' */
  separator?: string;
  /** 是否補零至指定小數位，預設 false */
  padDecimals?: boolean;
}

const FILE_SIZE_UNITS: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];
const BYTES_PER_UNIT = 1024;

/**
 * 格式化檔案大小
 * @example formatFileSize(1024) // "1 KB"
 * @example formatFileSize(1536) // "1.5 KB"
 */
export function formatFileSize(bytes: number, options: FormatFileSizeOptions = {}): string {
  const { decimals = 2, forceUnit, space = true } = options;

  const isNegative = bytes < 0;
  const absBytes = Math.abs(bytes);

  if (absBytes === 0) {
    return space ? '0 B' : '0B';
  }

  let unitIndex: number;
  let value: number;

  if (forceUnit) {
    unitIndex = FILE_SIZE_UNITS.indexOf(forceUnit);
    if (unitIndex === -1) {
      unitIndex = 0;
    }
    value = absBytes / Math.pow(BYTES_PER_UNIT, unitIndex);
  } else {
    unitIndex = 0;
    value = absBytes;

    while (value >= BYTES_PER_UNIT && unitIndex < FILE_SIZE_UNITS.length - 1) {
      value /= BYTES_PER_UNIT;
      unitIndex++;
    }
  }

  const unit = FILE_SIZE_UNITS[unitIndex];
  const spacer = space ? ' ' : '';

  let formattedValue: string;
  if (Number.isInteger(value) && decimals > 0) {
    formattedValue = formatNumber(value, { decimals: 0 });
  } else {
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(value * factor) / factor;
    formattedValue = formatNumber(rounded, {
      decimals: decimals,
      padDecimals: false,
    });
  }

  const prefix = isNegative ? '-' : '';
  return `${prefix}${formattedValue}${spacer}${unit}`;
}

/**
 * 格式化日期
 * @example formatDate(new Date()) // "2025-01-01 14:30"
 * @example formatDate(new Date(), { format: 'relative' }) // "今天 14:30"
 */
export function formatDate(date: Date | number | string, options: FormatDateOptions = {}): string {
  const { format = 'datetime', showSeconds = false } = options;

  let dateObj: Date;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = new Date(date);
  }

  if (isNaN(dateObj.getTime())) {
    return '無效日期';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  const dateStr = `${year}-${month}-${day}`;
  const timeStr = showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
  const shortTimeStr = `${hours}:${minutes}`;

  switch (format) {
    case 'full':
      return `${dateStr} ${hours}:${minutes}:${seconds}`;

    case 'date':
      return dateStr;

    case 'time':
      return timeStr;

    case 'datetime':
      return `${dateStr} ${shortTimeStr}`;

    case 'short':
      return `${month}-${day} ${shortTimeStr}`;

    case 'relative':
      return formatRelativeDate(dateObj, shortTimeStr);

    default:
      return `${dateStr} ${shortTimeStr}`;
  }
}

function formatRelativeDate(date: Date, timeStr: string): string {
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = today.getTime() - dateOnly.getTime();
  const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));

  if (dateOnly.getTime() === today.getTime()) {
    return `今天 ${timeStr}`;
  }

  if (dateOnly.getTime() === yesterday.getTime()) {
    return '昨天';
  }

  if (diffDays < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 1) {
      return '明天';
    }
    return `${futureDays} 天後`;
  }

  if (diffDays <= 7) {
    return `${diffDays} 天前`;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化數字（千分位分隔）
 * @example formatNumber(1234567) // "1,234,567"
 * @example formatNumber(1234.5678, { decimals: 2 }) // "1,234.57"
 */
export function formatNumber(num: number, options: FormatNumberOptions = {}): string {
  const { decimals = 0, separator = ',', padDecimals = false } = options;

  if (!Number.isFinite(num)) {
    if (Number.isNaN(num)) return 'NaN';
    return num > 0 ? 'Infinity' : '-Infinity';
  }

  const factor = Math.pow(10, decimals);
  const rounded = Math.round(num * factor) / factor;

  const isNegative = rounded < 0;
  const absValue = Math.abs(rounded);
  const [integerPart, decimalPart = ''] = absValue.toString().split('.');

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  let result = formattedInteger;

  if (decimals > 0) {
    if (padDecimals) {
      const paddedDecimal = decimalPart.padEnd(decimals, '0').slice(0, decimals);
      result = `${formattedInteger}.${paddedDecimal}`;
    } else if (decimalPart) {
      const trimmedDecimal = decimalPart.slice(0, decimals);
      result = `${formattedInteger}.${trimmedDecimal}`;
    }
  }

  return isNegative ? `-${result}` : result;
}
