import { ipcMain, BrowserWindow } from 'electron';

import { IPC_CHANNELS } from './channels';
import { FileService } from '../services/file-service';
import {
  ArchiveService,
  type CompressOptions,
  type ExtractOptions,
} from '../services/archive-service';
import { HashService, type HashAlgorithm } from '../services/hash-service';
import {
  FileError,
  ReadDirectoryOptions,
  CopyOptions,
  MoveOptions,
  DeleteOptions,
} from '../../shared/types';

type IpcResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

function ok<T>(data: T): IpcResponse<T> {
  return { success: true, data };
}

function fail(code: string, message: string): IpcResponse<never> {
  return { success: false, error: { code, message } };
}

function handleError(error: unknown): IpcResponse<never> {
  if (error instanceof FileError) {
    return fail(error.code, error.message);
  }
  return fail('UNKNOWN_ERROR', String(error));
}

function registerFileHandlers() {
  ipcMain.handle(
    IPC_CHANNELS.FILE_READ_DIRECTORY,
    async (_event, dirPath: string, options?: ReadDirectoryOptions) => {
      try {
        const files = await FileService.readDirectory(dirPath, options);
        return ok(files);
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.FILE_GET_INFO, async (_event, filePath: string) => {
    try {
      const info = await FileService.getFileInfo(filePath);
      return ok(info);
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_GET_DRIVES, async () => {
    try {
      const drives = await FileService.getDrives();
      return ok(drives);
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.FILE_COPY,
    async (_event, sources: string[], destination: string, options?: CopyOptions) => {
      try {
        await FileService.copy(sources, destination, options);
        return ok(true);
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.FILE_MOVE,
    async (_event, sources: string[], destination: string, options?: MoveOptions) => {
      try {
        await FileService.move(sources, destination, options);
        return ok(true);
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.FILE_DELETE,
    async (_event, paths: string[], options?: DeleteOptions) => {
      try {
        await FileService.deleteFiles(paths, options);
        return ok(true);
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.FILE_RENAME, async (_event, oldPath: string, newName: string) => {
    try {
      const newPath = await FileService.rename(oldPath, newName);
      return ok(newPath);
    } catch (error) {
      return handleError(error);
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.FILE_CREATE_DIRECTORY,
    async (_event, parentPath: string, name: string) => {
      try {
        const newPath = await FileService.createDirectory(parentPath, name);
        return ok(newPath);
      } catch (error) {
        return handleError(error);
      }
    },
  );
}

function registerSettingsHandlers() {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => ok({}));
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async () => ok(true));
}

function registerArchiveHandlers() {
  ipcMain.handle(
    IPC_CHANNELS.ARCHIVE_COMPRESS,
    async (event, sources: string[], destination: string, options: CompressOptions) => {
      try {
        const result = await ArchiveService.compress(sources, destination, options, (progress) => {
          const win = BrowserWindow.fromWebContents(event.sender);
          if (win) {
            win.webContents.send(IPC_CHANNELS.ARCHIVE_PROGRESS, progress);
          }
        });
        return ok(result);
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.ARCHIVE_EXTRACT,
    async (event, archive: string, destination: string, options?: ExtractOptions) => {
      try {
        const result = await ArchiveService.extract(archive, destination, options, (progress) => {
          const win = BrowserWindow.fromWebContents(event.sender);
          if (win) {
            win.webContents.send(IPC_CHANNELS.ARCHIVE_PROGRESS, progress);
          }
        });
        return ok(result);
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.ARCHIVE_LIST, async (_event, archive: string) => {
    try {
      const result = await ArchiveService.list(archive);
      return ok(result);
    } catch (error) {
      return handleError(error);
    }
  });
}

function registerSystemHandlers() {
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_INFO, async () =>
    ok({ platform: process.platform, arch: process.arch, versions: process.versions }),
  );
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_PLATFORM, async () => ok(process.platform));
}

function registerHashHandlers() {
  ipcMain.handle(
    IPC_CHANNELS.HASH_CALCULATE,
    async (event, filePath: string, algorithm: HashAlgorithm) => {
      try {
        const result = await HashService.calculate(filePath, algorithm, (progress) => {
          const win = BrowserWindow.fromWebContents(event.sender);
          if (win) {
            win.webContents.send(IPC_CHANNELS.HASH_PROGRESS, progress);
          }
        });
        return ok(result);
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.HASH_CALCULATE_BATCH,
    async (event, filePaths: string[], algorithm: HashAlgorithm) => {
      try {
        const result = await HashService.calculateBatch(filePaths, algorithm, (progress) => {
          const win = BrowserWindow.fromWebContents(event.sender);
          if (win) {
            win.webContents.send(IPC_CHANNELS.HASH_PROGRESS, progress);
          }
        });
        return ok(Object.fromEntries(result));
      } catch (error) {
        return handleError(error);
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.HASH_VERIFY,
    async (_event, filePath: string, expectedHash: string, algorithm: HashAlgorithm) => {
      try {
        const result = await HashService.verify(filePath, expectedHash, algorithm);
        return ok(result);
      } catch (error) {
        return handleError(error);
      }
    },
  );
}

export function registerIpcHandlers() {
  registerFileHandlers();
  registerArchiveHandlers();
  registerSettingsHandlers();
  registerSystemHandlers();
  registerHashHandlers();
}
