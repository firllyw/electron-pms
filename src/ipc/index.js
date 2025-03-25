const { ipcMain, app } = require('electron');
const path = require('path');

// Import all IPC handler modules
const authHandlers = require('./auth-handler');
const componentHandlers = require('./component-handler');
const maintenanceHandlers = require('./maintenance-handler');
const inventoryHandlers = require('./inventory-handler');
const purchaseHandlers = require('./purchase-handler');
const userHandlers = require('./user-handler');
const { getOne } = require('../db/database');
const crewingHandlers = require('./crewing-handler');
const partHandlers = require('./part-handler');

/**
 * Register all IPC handlers for the application
 */
function registerIpcHandlers() {
  // Register auth handlers
  authHandlers.register(ipcMain);
  
  // Register component handlers
  componentHandlers.register(ipcMain);
  
  // Register maintenance handlers
  maintenanceHandlers.register(ipcMain);
  
  // Register inventory handlers
  inventoryHandlers.register(ipcMain);
  
  // Register purchase handlers
  purchaseHandlers.register(ipcMain);
  
  // Register user handlers
  userHandlers.register(ipcMain);

  crewingHandlers.register(ipcMain);

  partHandlers.register(ipcMain);
  
  // Application information
  ipcMain.handle('getAppVersion', async () => {
    return app.getVersion();
  });

  ipcMain.handle('getDatabaseInfo', async () => {
    try {
      const components = await getOne('SELECT COUNT(*) as count FROM components');
      const tasks = await getOne('SELECT COUNT(*) as count FROM maintenance_tasks');
      const users = await getOne('SELECT COUNT(*) as count FROM users');
      
      return {
        components: components.count,
        tasks: tasks.count,
        users: users.count,
        path: path.join(app.getPath('userData'), 'ship_maintenance.db')
      };
    } catch (err) {
      console.error('Error getting database info:', err);
      return { error: err.message };
    }
  });
}

module.exports = registerIpcHandlers;