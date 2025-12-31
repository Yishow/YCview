import { app, BrowserWindow } from 'electron';

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
      sandbox: true,
    },
  });

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
