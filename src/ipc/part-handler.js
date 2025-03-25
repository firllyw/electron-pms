const partService = require('../services/part-service');

/**
 * Parts IPC handlers
 */
const partHandlers = {
  /**
   * Register all part handlers
   * @param {Electron.IpcMain} ipcMain - The IPC main instance
   */
  register(ipcMain) {
    ipcMain.handle('getParts', async (event, filters) => {
      try {
        return await partService.getParts(filters || {});
      } catch (err) {
        console.error('Error in getParts handler:', err);
        return [];
      }
    });
    
    ipcMain.handle('getPartDetails', async (event, id) => {
      try {
        return await partService.getPartDetails(id);
      } catch (err) {
        console.error('Error in getPartDetails handler:', err);
        return null;
      }
    });

    ipcMain.handle('createPart', async (event, data) => {
      try {
        return await partService.createPart(data);
      } catch (err) {
        console.error('Error in createPart handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('updatePart', async (event, id, data) => {
      try {
        return await partService.updatePart(id, data);
      } catch (err) {
        console.error('Error in updatePart handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('deletePart', async (event, id) => {
      try {
        return await partService.deletePart(id);
      } catch (err) {
        console.error('Error in deletePart handler:', err);
        return { success: false, message: err.message };
      }
    });
    
    ipcMain.handle('adjustPartStock', async (event, id, quantity, notes) => {
      try {
        return await partService.adjustStock(id, quantity, notes);
      } catch (err) {
        console.error('Error in adjustPartStock handler:', err);
        return { success: false, message: err.message };
      }
    });
    
    ipcMain.handle('getLowStockParts', async () => {
      try {
        return await partService.getLowStockParts();
      } catch (err) {
        console.error('Error in getLowStockParts handler:', err);
        return [];
      }
    });
  }
};

module.exports = partHandlers;