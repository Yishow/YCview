import { app, BrowserWindow } from 'electron';
import path from 'node:path';

import { registerIpcHandlers } from './ipc';

const DEV_SERVER_URL = 'http://127.0.0.1:5173';

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 1024,
    minHeight: 768,
    title: 'WinCV Modern',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.resolve(__dirname, '../../electron/preload.cjs'),
    },
  });

  registerIpcHandlers();

  return win.loadURL(DEV_SERVER_URL);
}

app.whenReady().then(() => {
  void createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) void createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
