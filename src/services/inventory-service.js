const { getAll, runQuery } = require('../db/database');

/**
 * Inventory service
 */
class InventoryService {
  /**
   * Get all inventory items
   * @returns {Promise<Array>} List of inventory items
   */
  async getInventoryItems() {
    try {
      // We need to create this table since it doesn't exist in the original schema
      await this.ensureInventoryTable();
      
      return await getAll('SELECT * FROM inventory ORDER BY name');
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      throw err;
    }
  }

  /**
   * Create a new inventory item
   * @param {Object} data - The inventory item data
   * @returns {Promise<Object>} Result with success status and new ID
   */
  async createInventoryItem(data) {
    try {
      await this.ensureInventoryTable();
      
      const result = await runQuery(
        `INSERT INTO inventory 
          (name, description, quantity, min_quantity, location, part_number) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.description || null,
          data.quantity || 0,
          data.min_quantity || 0,
          data.location || null,
          data.part_number || null
        ]
      );
      
      if (result.lastID) {
        return { success: true, id: result.lastID };
      }
      
      return { success: false, message: 'Failed to create inventory item' };
    } catch (err) {
      console.error('Error creating inventory item:', err);
      throw err;
    }
  }

  /**
   * Update an existing inventory item
   * @param {number} id - The inventory item ID
   * @param {Object} data - The inventory item data
   * @returns {Promise<Object>} Result with success status
   */
  async updateInventoryItem(id, data) {
    try {
      await this.ensureInventoryTable();
      
      const result = await runQuery(
        `UPDATE inventory 
        SET name = ?, description = ?, quantity = ?, min_quantity = ?, 
            location = ?, part_number = ? 
        WHERE id = ?`,
        [
          data.name,
          data.description || null,
          data.quantity || 0,
          data.min_quantity || 0,
          data.location || null,
          data.part_number || null,
          id
        ]
      );
      
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('Error updating inventory item:', err);
      throw err;
    }
  }

  /**
   * Delete an inventory item
   * @param {number} id - The inventory item ID
   * @returns {Promise<Object>} Result with success status
   */
  async deleteInventoryItem(id) {
    try {
      await this.ensureInventoryTable();
      
      const result = await runQuery('DELETE FROM inventory WHERE id = ?', [id]);
      
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('Error deleting inventory item:', err);
      throw err;
    }
  }

  /**
   * Ensure the inventory table exists
   * @private
   * @returns {Promise<void>}
   */
  async ensureInventoryTable() {
    try {
      await runQuery(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          quantity INTEGER NOT NULL DEFAULT 0,
          min_quantity INTEGER NOT NULL DEFAULT 0,
          location TEXT,
          part_number TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (err) {
      console.error('Error creating inventory table:', err);
      throw err;
    }
  }
}

module.exports = new InventoryService();