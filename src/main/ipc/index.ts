import { ipcMain } from 'electron';

import { IPC_CHANNELS } from './channels';
import { FileService } from '../services/file-service';
import { FileError, ReadDirectoryOptions } from '../../shared/types';

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
  ipcMain.handle(
    IPC_CHANNELS.FILE_READ_DIRECTORY,
    async (_event, dirPath: string, options?: ReadDirectoryOptions) => {
      try {
        const files = await FileService.readDirectory(dirPath, options);
        return ok(files);
      } catch (error) {
        if (error instanceof FileError) {
          return fail(error.code, error.message);
        }
        return fail('UNKNOWN_ERROR', String(error));
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.FILE_GET_INFO, async (_event, filePath: string) => {
    try {
      const info = await FileService.getFileInfo(filePath);
      return ok(info);
    } catch (error) {
      if (error instanceof FileError) {
        return fail(error.code, error.message);
      }
      return fail('UNKNOWN_ERROR', String(error));
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_GET_DRIVES, async () => {
    try {
      const drives = await FileService.getDrives();
      return ok(drives);
    } catch (error) {
      if (error instanceof FileError) {
        return fail(error.code, error.message);
      }
      return fail('UNKNOWN_ERROR', String(error));
    }
  });
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
