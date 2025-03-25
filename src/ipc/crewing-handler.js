const crewingService = require('../services/crewing-service');

/**
 * Crewing IPC handlers
 */
const crewingHandlers = {
  /**
   * Register all crewing handlers
   * @param {Electron.IpcMain} ipcMain - The IPC main instance
   */
  register(ipcMain) {
    ipcMain.handle('getCrewMembers', async (event, filters) => {
      try {
        return await crewingService.getCrewMembers(filters || {});
      } catch (err) {
        console.error('Error in getCrewMembers handler:', err);
        return [];
      }
    });

    ipcMain.handle('getCrewPositions', async () => {
      try {
        return await crewingService.getCrewPositions();
      } catch (err) {
        console.error('Error in getCrewPositions handler:', err);
        return [];
      }
    });

    ipcMain.handle('createCrewMember', async (event, data) => {
      try {
        return await crewingService.createCrewMember(data);
      } catch (err) {
        console.error('Error in createCrewMember handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('updateCrewMember', async (event, id, data) => {
      try {
        return await crewingService.updateCrewMember(id, data);
      } catch (err) {
        console.error('Error in updateCrewMember handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('deleteCrewMember', async (event, id) => {
      try {
        return await crewingService.deleteCrewMember(id);
      } catch (err) {
        console.error('Error in deleteCrewMember handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('getCrewMemberDetails', async (event, id) => {
      try {
        return await crewingService.getCrewMemberDetails(id);
      } catch (err) {
        console.error('Error in getCrewMemberDetails handler:', err);
        return null;
      }
    });

    ipcMain.handle('getExpiringDocuments', async (event, daysToExpiry) => {
      try {
        return await crewingService.getExpiringDocuments(daysToExpiry);
      } catch (err) {
        console.error('Error in getExpiringDocuments handler:', err);
        return [];
      }
    });
  }
};

module.exports = crewingHandlers;