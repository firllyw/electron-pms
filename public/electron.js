const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const { initDatabase } = require('../src/db/database.js');

// Import IPC handlers
const registerIpcHandlers = require('../src/ipc/index.js');

let mainWindow;
let db;

console.log('====== ELECTRON.JS IS RUNNING ======');

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js')
    },
    icon: path.join(__dirname, 'favicon.ico')
  });

  // Load the app
  mainWindow.loadURL(
    isDev 
      ? 'http://localhost:3000' 
      : `file://${path.join(__dirname, 'build/index.html')}`
  );

  // Open the DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  // Initialize SQLite database
  try {
    db = await initDatabase();
    console.log('Database initialized successfully');
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'ship_maintenance.db');
    console.log('Database path:', dbPath);
  
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }

  // Register all IPC handlers
  registerIpcHandlers();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});