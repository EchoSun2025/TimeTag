import { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } from 'electron';
import path from 'path';

// Keep a global reference to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let miniWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    frame: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Maximize window on startup (not fullscreen, to keep system menus visible)
  mainWindow.maximize();

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMiniWindow() {
  miniWindow = new BrowserWindow({
    width: 252,
    height: 55,  // Reduced to 55px for more compact size
    x: 20,  // Position at left
    y: 20,  // Position at top
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,  // Allow dragging
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    miniWindow.loadURL('http://localhost:5173#/mini');
    // Open DevTools for debugging mini window
    miniWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    miniWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: 'mini',
    });
  }

  // Make window draggable
  miniWindow.setIgnoreMouseEvents(false);

  miniWindow.on('closed', () => {
    miniWindow = null;
  });
}

function registerGlobalShortcuts() {
  // Alt+X to start/stop recording
  globalShortcut.register('Alt+X', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut:toggle-recording');
    }
    if (miniWindow) {
      miniWindow.webContents.send('shortcut:toggle-recording');
    }
  });

  // Alt+A to toggle between full and mini view
  globalShortcut.register('Alt+A', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut:toggle-view');
    }
    if (miniWindow) {
      miniWindow.webContents.send('shortcut:toggle-view');
    }
  });
}

function createTray() {
  // Tray icon functionality can be added later
  // For now, just a placeholder
}

app.whenReady().then(() => {
  createMainWindow();
  registerGlobalShortcuts();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.handle('window:minimize-to-mini', async () => {
  if (mainWindow && !miniWindow) {
    mainWindow.hide();
    createMiniWindow();
  }
});

ipcMain.handle('window:restore-from-mini', async () => {
  if (miniWindow) {
    miniWindow.close();
    miniWindow = null;
  }
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
  } else {
    createMainWindow();
  }
});

ipcMain.handle('window:close', async () => {
  app.quit();
});
