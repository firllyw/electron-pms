const componentService = require('../services/component-service');

/**
 * Component IPC handlers
 */
const componentHandlers = {
  /**
   * Register all component handlers
   * @param {Electron.IpcMain} ipcMain - The IPC main instance
   */
  register(ipcMain) {
    ipcMain.handle('getComponents', async (event, filters) => {
      try {
        return await componentService.getComponents(filters);
      } catch (err) {
        console.error('Error in getComponents handler:', err);
        return [];
      }
    });

    ipcMain.handle('getComponentTree', async () => {
      try {
        return await componentService.getComponentTree();
      } catch (err) {
        console.error('Error in getComponentTree handler:', err);
        return [];
      }
    });

    ipcMain.handle('getComponentDetails', async (event, id) => {
      try {
        return await componentService.getComponentDetails(id);
      } catch (err) {
        console.error('Error in getComponentDetails handler:', err);
        return null;
      }
    });

    ipcMain.handle('createComponent', async (event, data) => {
      try {
        return await componentService.createComponent(data);
      } catch (err) {
        console.error('Error in createComponent handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('updateComponent', async (event, id, data) => {
      try {
        return await componentService.updateComponent(id, data);
      } catch (err) {
        console.error('Error in updateComponent handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('deleteComponent', async (event, id) => {
      try {
        return await componentService.deleteComponent(id);
      } catch (err) {
        console.error('Error in deleteComponent handler:', err);
        return { success: false, message: err.message };
      }
    });
    
    ipcMain.handle('getSfiGroups', async () => {
      try {
        return await componentService.getSfiGroups();
      } catch (err) {
        console.error('Error in getSfiGroups handler:', err);
        return [];
      }
    });
    
    ipcMain.handle('importSfiGroups', async () => {
      try {
        return await componentService.importSfiGroups();
      } catch (err) {
        console.error('Error in importSfiGroups handler:', err);
        return { success: false, message: err.message };
      }
    });
  }
};

module.exports = componentHandlers;