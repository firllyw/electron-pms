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
console.log('Is development:', isDev);

async function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'public/favicon.ico')
  });

  // Load the app
  let startUrl;
  if (isDev) {
    startUrl = 'http://localhost:3000';
  } else {
    // In production, we need to look for the index.html file in the correct location
    // Try multiple paths to find the index.html file
    const possiblePaths = [
      path.join(__dirname, 'build/index.html'),
      path.join(__dirname, 'index.html'),
      path.join(__dirname, '../build/index.html'),
      path.join(process.resourcesPath, 'app.asar/build/index.html'),
      path.join(process.resourcesPath, 'app.asar/index.html')
    ];
    
    let foundPath = null;
    for (const htmlPath of possiblePaths) {
      console.log('Checking path:', htmlPath);
      if (fs.existsSync(htmlPath)) {
        foundPath = htmlPath;
        console.log('Found index.html at:', foundPath);
        break;
      }
    }
    
    if (foundPath) {
      startUrl = `file://${foundPath}`;
    } else {
      console.error('Could not find index.html in any of the expected locations');
      startUrl = `file://${path.join(__dirname, 'build/index.html')}`;
    }
  }
  
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);
  
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