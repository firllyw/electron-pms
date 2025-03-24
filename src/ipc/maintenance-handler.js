const maintenanceService = require('../services/maintenance-service');

/**
 * Maintenance task IPC handlers
 */
const maintenanceHandlers = {
  /**
   * Register all maintenance handlers
   * @param {Electron.IpcMain} ipcMain - The IPC main instance
   */
  register(ipcMain) {
    ipcMain.handle('getMaintenanceTasks', async (event, filters) => {
      try {
        return await maintenanceService.getMaintenanceTasks(filters);
      } catch (err) {
        console.error('Error in getMaintenanceTasks handler:', err);
        return [];
      }
    });

    ipcMain.handle('createMaintenanceTask', async (event, data) => {
      try {
        return await maintenanceService.createMaintenanceTask(data);
      } catch (err) {
        console.error('Error in createMaintenanceTask handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('updateMaintenanceTask', async (event, id, data) => {
      try {
        return await maintenanceService.updateMaintenanceTask(id, data);
      } catch (err) {
        console.error('Error in updateMaintenanceTask handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('deleteMaintenanceTask', async (event, id) => {
      try {
        return await maintenanceService.deleteMaintenanceTask(id);
      } catch (err) {
        console.error('Error in deleteMaintenanceTask handler:', err);
        return { success: false, message: err.message };
      }
    });
    
    ipcMain.handle('completeMaintenanceTask', async (event, id, data) => {
      try {
        return await maintenanceService.completeMaintenanceTask(id, data);
      } catch (err) {
        console.error('Error in completeMaintenanceTask handler:', err);
        return { success: false, message: err.message };
      }
    });
    
    ipcMain.handle('getMaintenanceHistory', async (event, filters) => {
      try {
        return await maintenanceService.getMaintenanceHistory(filters);
      } catch (err) {
        console.error('Error in getMaintenanceHistory handler:', err);
        return [];
      }
    });
  }
};

module.exports = maintenanceHandlers;