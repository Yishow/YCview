import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

import { IPC_CHANNELS } from './ipc/channels';
import type {
  ReadDirectoryOptions,
  FileInfo,
  DriveInfo,
  CopyOptions,
  MoveOptions,
  DeleteOptions,
} from '../shared/types';
import type {
  CompressOptions,
  ExtractOptions,
  CompressResult,
  ExtractResult,
  ListResult,
  ArchiveProgress,
} from './services/archive-service';
import type {
  HashAlgorithm,
  HashResult,
  HashProgress,
  HashVerifyResult,
} from './services/hash-service';

type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

const api = {
  file: {
    readDirectory: (
      path: string,
      options?: ReadDirectoryOptions,
    ): Promise<IpcResponse<FileInfo[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_READ_DIRECTORY, path, options),
    getInfo: (path: string): Promise<IpcResponse<FileInfo>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_GET_INFO, path),
    getDrives: (): Promise<IpcResponse<DriveInfo[]>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_GET_DRIVES),
    copy: (
      sources: string[],
      destination: string,
      options?: CopyOptions,
    ): Promise<IpcResponse<boolean>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_COPY, sources, destination, options),
    move: (
      sources: string[],
      destination: string,
      options?: MoveOptions,
    ): Promise<IpcResponse<boolean>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_MOVE, sources, destination, options),
    delete: (paths: string[], options?: DeleteOptions): Promise<IpcResponse<boolean>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_DELETE, paths, options),
    rename: (oldPath: string, newName: string): Promise<IpcResponse<string>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_RENAME, oldPath, newName),
    createDirectory: (parentPath: string, name: string): Promise<IpcResponse<string>> =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_CREATE_DIRECTORY, parentPath, name),
  },
  archive: {
    compress: (
      sources: string[],
      destination: string,
      options: CompressOptions,
    ): Promise<IpcResponse<CompressResult>> =>
      ipcRenderer.invoke(IPC_CHANNELS.ARCHIVE_COMPRESS, sources, destination, options),
    extract: (
      archive: string,
      destination: string,
      options?: ExtractOptions,
    ): Promise<IpcResponse<ExtractResult>> =>
      ipcRenderer.invoke(IPC_CHANNELS.ARCHIVE_EXTRACT, archive, destination, options),
    list: (archive: string): Promise<IpcResponse<ListResult>> =>
      ipcRenderer.invoke(IPC_CHANNELS.ARCHIVE_LIST, archive),
    onProgress: (callback: (progress: ArchiveProgress) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, progress: ArchiveProgress): void => {
        callback(progress);
      };
      ipcRenderer.on(IPC_CHANNELS.ARCHIVE_PROGRESS, handler);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.ARCHIVE_PROGRESS, handler);
      };
    },
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    set: (settings: unknown) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
  },
  system: {
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_INFO),
    getPlatform: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_PLATFORM),
  },
  hash: {
    calculate: (filePath: string, algorithm: HashAlgorithm): Promise<IpcResponse<HashResult>> =>
      ipcRenderer.invoke(IPC_CHANNELS.HASH_CALCULATE, filePath, algorithm),
    calculateBatch: (
      filePaths: string[],
      algorithm: HashAlgorithm,
    ): Promise<IpcResponse<Record<string, HashResult>>> =>
      ipcRenderer.invoke(IPC_CHANNELS.HASH_CALCULATE_BATCH, filePaths, algorithm),
    verify: (
      filePath: string,
      expectedHash: string,
      algorithm: HashAlgorithm,
    ): Promise<IpcResponse<HashVerifyResult>> =>
      ipcRenderer.invoke(IPC_CHANNELS.HASH_VERIFY, filePath, expectedHash, algorithm),
    onProgress: (callback: (progress: HashProgress) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, progress: HashProgress): void => {
        callback(progress);
      };
      ipcRenderer.on(IPC_CHANNELS.HASH_PROGRESS, handler);
      return () => {
        ipcRenderer.removeListener(IPC_CHANNELS.HASH_PROGRESS, handler);
      };
    },
  },
} as const;

contextBridge.exposeInMainWorld('api', api);

declare global {
  interface Window {
    api: typeof api;
  }
}
