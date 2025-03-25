const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
const { initDatabase } = require('./src/db/database');

// Import IPC handlers
const registerIpcHandlers = require('./src/ipc');

let mainWindow;
let db;

console.log('====== MAIN.JS IS RUNNING ======');
console.log('App path:', app.getAppPath());
console.log('Current working directory:', process.cwd());

async function createWindow() {
  // Determine the correct preload path
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload path:', preloadPath);
  console.log('Preload exists:', fs.existsSync(preloadPath));

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    },
    icon: path.join(__dirname, 'public/favicon.ico')
  });

  // Determine the correct URL to load
  let startUrl;
  if (isDev) {
    startUrl = 'http://localhost:3000';
  } else {
    // For production builds, we need to be more careful with the path
    const htmlPath = path.join(__dirname, 'build/index.html');
    const alternativeHtmlPath = path.join(__dirname, '../build/index.html');
    
    if (fs.existsSync(htmlPath)) {
      startUrl = `file://${htmlPath}`;
      console.log('Using primary HTML path:', htmlPath);
    } else if (fs.existsSync(alternativeHtmlPath)) {
      startUrl = `file://${alternativeHtmlPath}`;
      console.log('Using alternative HTML path:', alternativeHtmlPath);
    } else {
      // If neither path works, log directories to help troubleshoot
      console.error('HTML file not found at expected paths');
      console.log('Current directory contents:', fs.readdirSync(__dirname));
      
      // Fallback to the original path
      startUrl = `file://${path.join(__dirname, 'build/index.html')}`;
      console.log('Falling back to:', startUrl);
    }
  }
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);
  
  // Open DevTools in development
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