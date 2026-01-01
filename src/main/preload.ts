import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from './ipc/channels';
import type {
  ReadDirectoryOptions,
  FileInfo,
  DriveInfo,
  CopyOptions,
  MoveOptions,
  DeleteOptions,
} from '../shared/types';

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
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    set: (settings: unknown) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
  },
  system: {
    getInfo: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_INFO),
    getPlatform: () => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_PLATFORM),
  },
} as const;

contextBridge.exposeInMainWorld('api', api);

declare global {
  interface Window {
    api: typeof api;
  }
}
