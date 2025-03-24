const inventoryService = require('../services/inventory-service');

/**
 * Inventory IPC handlers
 */
const inventoryHandlers = {
  /**
   * Register all inventory handlers
   * @param {Electron.IpcMain} ipcMain - The IPC main instance
   */
  register(ipcMain) {
    ipcMain.handle('getInventoryItems', async () => {
      try {
        return await inventoryService.getInventoryItems();
      } catch (err) {
        console.error('Error in getInventoryItems handler:', err);
        return [];
      }
    });

    ipcMain.handle('createInventoryItem', async (event, data) => {
      try {
        return await inventoryService.createInventoryItem(data);
      } catch (err) {
        console.error('Error in createInventoryItem handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('updateInventoryItem', async (event, id, data) => {
      try {
        return await inventoryService.updateInventoryItem(id, data);
      } catch (err) {
        console.error('Error in updateInventoryItem handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('deleteInventoryItem', async (event, id) => {
      try {
        return await inventoryService.deleteInventoryItem(id);
      } catch (err) {
        console.error('Error in deleteInventoryItem handler:', err);
        return { success: false, message: err.message };
      }
    });
  }
};

module.exports = inventoryHandlers;