export interface FileInfo {
  name: string;
  path: string;
  size: number;
  isDirectory: boolean;
  isHidden: boolean;
  modifiedTime: Date;
  createdTime: Date;
  extension: string;
}

export type DriveType = 'fixed' | 'removable' | 'network' | 'cdrom' | 'unknown';

export interface DriveInfo {
  name: string;
  label: string;
  type: DriveType;
  totalSpace: number;
  freeSpace: number;
}

export type SortField = 'name' | 'size' | 'date' | 'extension';

export type SortOrder = 'asc' | 'desc';

export interface ReadDirectoryOptions {
  showHidden?: boolean;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export enum FileErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NOT_A_DIRECTORY = 'NOT_A_DIRECTORY',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INVALID_NAME = 'INVALID_NAME',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export type ConflictStrategy = 'overwrite' | 'skip' | 'rename';

export interface CopyOptions {
  onConflict?: ConflictStrategy;
  preserveTimestamps?: boolean;
}

export interface MoveOptions {
  onConflict?: ConflictStrategy;
}

export interface DeleteOptions {
  useTrash?: boolean;
}

export interface OperationProgress {
  currentFile: string;
  processedCount: number;
  totalCount: number;
  processedBytes: number;
  totalBytes: number;
}

export class FileError extends Error {
  constructor(
    public readonly code: FileErrorCode,
    message: string,
    public readonly path?: string,
  ) {
    super(message);
    this.name = 'FileError';
  }
}
