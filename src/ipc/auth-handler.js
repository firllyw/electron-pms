const authService = require('../services/auth-service');

/**
 * Authentication IPC handlers
 */
const authHandlers = {
  /**
   * Register all auth handlers
   * @param {Electron.IpcMain} ipcMain - The IPC main instance
   */
  register(ipcMain) {
    ipcMain.handle('authenticate', async (event, { username, password }) => {
      try {
        console.log('Authenticating user:', username);
        return await authService.authenticate(username, password);
      } catch (err) {
        return { success: false, message: 'An error occurred during authentication' };
      }
    });
  }
};

module.exports = authHandlers;