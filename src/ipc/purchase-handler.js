const purchaseService = require('../services/purchase-service');

/**
 * Purchase IPC handlers
 */
const purchaseHandlers = {
  /**
   * Register all purchase handlers
   * @param {Electron.IpcMain} ipcMain - The IPC main instance
   */
  register(ipcMain) {
    ipcMain.handle('getPurchaseOrders', async () => {
      try {
        return await purchaseService.getPurchaseOrders();
      } catch (err) {
        console.error('Error in getPurchaseOrders handler:', err);
        return [];
      }
    });

    ipcMain.handle('createPurchaseOrder', async (event, data) => {
      try {
        return await purchaseService.createPurchaseOrder(data);
      } catch (err) {
        console.error('Error in createPurchaseOrder handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('updatePurchaseOrder', async (event, id, data) => {
      try {
        return await purchaseService.updatePurchaseOrder(id, data);
      } catch (err) {
        console.error('Error in updatePurchaseOrder handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('deletePurchaseOrder', async (event, id) => {
      try {
        return await purchaseService.deletePurchaseOrder(id);
      } catch (err) {
        console.error('Error in deletePurchaseOrder handler:', err);
        return { success: false, message: err.message };
      }
    });
  }
};

module.exports = purchaseHandlers;