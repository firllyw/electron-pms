const userService = require('../services/user-service');

/**
 * User IPC handlers
 */
const userHandlers = {
  /**
   * Register all user handlers
   * @param {Electron.IpcMain} ipcMain - The IPC main instance
   */
  register(ipcMain) {
    ipcMain.handle('getUsers', async () => {
      try {
        return await userService.getUsers();
      } catch (err) {
        console.error('Error in getUsers handler:', err);
        return [];
      }
    });

    ipcMain.handle('createUser', async (event, data) => {
      try {
        return await userService.createUser(data);
      } catch (err) {
        console.error('Error in createUser handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('updateUser', async (event, id, data) => {
      try {
        return await userService.updateUser(id, data);
      } catch (err) {
        console.error('Error in updateUser handler:', err);
        return { success: false, message: err.message };
      }
    });

    ipcMain.handle('deleteUser', async (event, id) => {
      try {
        return await userService.deleteUser(id);
      } catch (err) {
        console.error('Error in deleteUser handler:', err);
        return { success: false, message: err.message };
      }
    });
  }
};

module.exports = userHandlers;