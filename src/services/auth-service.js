const { getOne } = require('../db/database');

/**
 * Authentication service
 */
class AuthService {
  /**
   * Authenticate a user
   * @param {string} username - The username
   * @param {string} password - The password
   * @returns {Promise<Object>} Authentication result
   */
  async authenticate(username, password) {
    try {
      // Query the database for a user with the provided credentials
      const user = await getOne(
        'SELECT id, username, name, role FROM users WHERE username = ? AND password = ?',
        [username, password]
      );
      
      if (user) {
        console.log('Authenticated user:', user);
        return { success: true, user };
      }
      
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      console.error('Authentication error:', err);
      throw err;
    }
  }
}

module.exports = new AuthService();