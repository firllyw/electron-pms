const { getAll, getOne, runQuery } = require('../db/database');

/**
 * User service
 */
class UserService {
  /**
   * Get all users
   * @returns {Promise<Array>} List of users
   */
  async getUsers() {
    try {
      return await getAll(
        'SELECT id, username, name, role, created_at FROM users ORDER BY name'
      );
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  }

  /**
   * Create a new user
   * @param {Object} data - The user data
   * @returns {Promise<Object>} Result with success status and new ID
   */
  async createUser(data) {
    try {
      // Check if the username already exists
      const existingUser = await getOne('SELECT id FROM users WHERE username = ?', [data.username]);
      
      if (existingUser) {
        return { success: false, message: 'Username already exists' };
      }
      
      const result = await runQuery(
        'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)',
        [
          data.username,
          data.password,
          data.name,
          data.role || 'user'
        ]
      );
      
      if (result.lastID) {
        return { success: true, id: result.lastID };
      }
      
      return { success: false, message: 'Failed to create user' };
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  /**
   * Update an existing user
   * @param {number} id - The user ID
   * @param {Object} data - The user data
   * @returns {Promise<Object>} Result with success status
   */
  async updateUser(id, data) {
    try {
      // Check if the username is being changed and if it already exists
      if (data.username) {
        const existingUser = await getOne(
          'SELECT id FROM users WHERE username = ? AND id != ?', 
          [data.username, id]
        );
        
        if (existingUser) {
          return { success: false, message: 'Username already exists' };
        }
      }
      
      let query, params;
      
      if (data.password) {
        // If password is being updated
        query = 'UPDATE users SET username = ?, password = ?, name = ?, role = ? WHERE id = ?';
        params = [
          data.username,
          data.password,
          data.name,
          data.role || 'user',
          id
        ];
      } else {
        // If password is not being updated
        query = 'UPDATE users SET username = ?, name = ?, role = ? WHERE id = ?';
        params = [
          data.username,
          data.name,
          data.role || 'user',
          id
        ];
      }
      
      const result = await runQuery(query, params);
      
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  /**
   * Delete a user
   * @param {number} id - The user ID
   * @returns {Promise<Object>} Result with success status
   */
  async deleteUser(id) {
    try {
      // Don't allow deletion of the last administrator
      const adminCount = await getOne(
        'SELECT COUNT(*) as count FROM users WHERE role = "administrator"'
      );
      
      if (adminCount.count <= 1) {
        const userToDelete = await getOne('SELECT role FROM users WHERE id = ?', [id]);
        if (userToDelete && userToDelete.role === 'administrator') {
          return { 
            success: false, 
            message: 'Cannot delete the last administrator account' 
          };
        }
      }
      
      const result = await runQuery('DELETE FROM users WHERE id = ?', [id]);
      
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }
}

module.exports = new UserService();