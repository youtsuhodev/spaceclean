const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'icon.png'),
    backgroundColor: '#1a1a2e',
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 o';
  const units = ['o', 'Ko', 'Mo', 'Go', 'To'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
}

function getDirSize(dirPath, depth = 0, maxDepth = 3) {
  try {
    const stat = fs.statSync(dirPath);
    if (!stat.isDirectory()) {
      return { path: dirPath, name: path.basename(dirPath), size: stat.size, isDir: false };
    }

    let totalSize = 0;
    let children = [];

    if (depth < maxDepth) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === '$RECYCLE.BIN' || entry.name === 'System Volume Information') continue;
        try {
          const fullPath = path.join(dirPath, entry.name);
          const child = getDirSize(fullPath, depth + 1, maxDepth);
          children.push(child);
          totalSize += child.size;
        } catch { }
      }
    }

    return {
      path: dirPath,
      name: path.basename(dirPath) || dirPath,
      size: totalSize,
      isDir: true,
      children,
    };
  } catch {
    return { path: dirPath, name: path.basename(dirPath), size: 0, isDir: false };
  }
}

ipcMain.handle('scan-directory', async (event, dirPath) => {
  const result = getDirSize(dirPath);
  return result;
});

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Choisir un dossier à analyser',
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
