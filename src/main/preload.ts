import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from './ipc/channels';
import type { ReadDirectoryOptions, FileInfo, DriveInfo } from '../shared/types';

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
