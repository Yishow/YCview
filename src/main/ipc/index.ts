import { ipcMain } from 'electron';

import { IPC_CHANNELS } from './channels';

type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

function ok<T>(data: T): IpcResponse<T> {
  return { success: true, data };
}

function fail(code: string, message: string): IpcResponse<never> {
  return { success: false, error: { code, message } };
}

function registerFileHandlers() {
  ipcMain.handle(IPC_CHANNELS.FILE_READ_DIRECTORY, async () => ok([]));
  ipcMain.handle(IPC_CHANNELS.FILE_GET_INFO, async () =>
    fail('NOT_IMPLEMENTED', 'Not implemented'),
  );
  ipcMain.handle(IPC_CHANNELS.FILE_GET_DRIVES, async () => ok([]));
}

function registerSettingsHandlers() {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => ok({}));
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async () => ok(true));
}

function registerSystemHandlers() {
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_INFO, async () =>
    ok({ platform: process.platform, arch: process.arch, versions: process.versions }),
  );
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_PLATFORM, async () => ok(process.platform));
}

export function registerIpcHandlers() {
  registerFileHandlers();
  registerSettingsHandlers();
  registerSystemHandlers();
}
