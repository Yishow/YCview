import { contextBridge, ipcRenderer } from 'electron';

import { IPC_CHANNELS } from './ipc/channels';

const api = {
  file: {
    readDirectory: (path: string, options?: unknown) =>
      ipcRenderer.invoke(IPC_CHANNELS.FILE_READ_DIRECTORY, { path, options }),
    getInfo: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE_GET_INFO, { path }),
    getDrives: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_GET_DRIVES),
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
    set: (settings: unknown) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, { settings }),
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
