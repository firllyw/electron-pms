const { getAll, getOne, runQuery } = require('../db/database');

/**
 * Service for managing spare parts inventory
 */
class PartService {
  /**
   * Get all parts, optionally filtered by search term or stock status
   * @param {Object} filters - Filter criteria
   * @param {string} [filters.searchTerm] - Optional search term for part name or number
   * @param {boolean} [filters.lowStock] - Optional filter for items below min_stock
   * @returns {Promise<Array>} List of parts
   */
  async getParts(filters = {}) {
    try {
      await this.ensurePartTableStructure();
      
      let whereConditions = [];
      let params = [];
      
      // Add name or part number search
      if (filters.searchTerm) {
        whereConditions.push('(name LIKE ? OR part_number LIKE ?)');
        params.push(`%${filters.searchTerm}%`, `%${filters.searchTerm}%`);
      }
      
      // Add low stock filter
      if (filters.lowStock) {
        whereConditions.push('stock < min_stock');
      }
      
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      return await getAll(
        `SELECT * FROM parts ${whereClause} ORDER BY name`, 
        params
      );
    } catch (err) {
      console.error('Error fetching parts:', err);
      throw err;
    }
  }

  /**
   * Get part details by ID
   * @param {number} id - The part ID
   * @returns {Promise<Object>} Part details
   */
  async getPartDetails(id) {
    try {
      const part = await getOne('SELECT * FROM parts WHERE id = ?', [id]);
      
      if (!part) {
        return null;
      }
      
      return part;
    } catch (err) {
      console.error('Error getting part details:', err);
      throw err;
    }
  }

  /**
   * Create a new part
   * @param {Object} data - The part data
   * @returns {Promise<Object>} Result with success status and new ID
   */
  async createPart(data) {
    try {
      await this.ensurePartTableStructure();
      
      // Check if part number already exists
      const existingPart = await getOne('SELECT id FROM parts WHERE part_number = ?', [data.part_number]);
      if (existingPart) {
        return { success: false, message: 'Part number already exists' };
      }
      
      const result = await runQuery(
        `INSERT INTO parts 
          (name, part_number, manufacturer, model, stock, min_stock, technical_specs) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.part_number,
          data.manufacturer || null,
          data.model || null,
          data.stock || 0,
          data.min_stock || 0,
          data.technical_specs || null
        ]
      );
      
      if (!result.lastID) {
        return { success: false, message: 'Failed to create part' };
      }
      
      return { success: true, id: result.lastID };
    } catch (err) {
      console.error('Error creating part:', err);
      throw err;
    }
  }

  /**
   * Update an existing part
   * @param {number} id - The part ID
   * @param {Object} data - The part data
   * @returns {Promise<Object>} Result with success status
   */
  async updatePart(id, data) {
    try {
      await this.ensurePartTableStructure();
      
      // Check if part exists
      const part = await getOne('SELECT id FROM parts WHERE id = ?', [id]);
      if (!part) {
        return { success: false, message: 'Part not found' };
      }
      
      // Check if part number already exists for another part
      if (data.part_number) {
        const existingPart = await getOne(
          'SELECT id FROM parts WHERE part_number = ? AND id != ?', 
          [data.part_number, id]
        );
        
        if (existingPart) {
          return { success: false, message: 'Part number already exists' };
        }
      }
      
      const result = await runQuery(
        `UPDATE parts 
        SET name = ?, part_number = ?, manufacturer = ?, model = ?, 
            stock = ?, min_stock = ?, technical_specs = ?
        WHERE id = ?`,
        [
          data.name,
          data.part_number,
          data.manufacturer || null,
          data.model || null,
          data.stock || 0,
          data.min_stock || 0,
          data.technical_specs || null,
          id
        ]
      );
      
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('Error updating part:', err);
      throw err;
    }
  }

  /**
   * Delete a part
   * @param {number} id - The part ID
   * @returns {Promise<Object>} Result with success status
   */
  async deletePart(id) {
    try {
      const result = await runQuery('DELETE FROM parts WHERE id = ?', [id]);
      
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('Error deleting part:', err);
      throw err;
    }
  }

  /**
   * Adjust part stock levels
   * @param {number} id - The part ID
   * @param {number} quantity - Quantity to add (positive) or remove (negative)
   * @param {string} [notes] - Optional notes about the stock adjustment
   * @returns {Promise<Object>} Result with success status and new stock level
   */
  async adjustStock(id, quantity, notes = '') {
    try {
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Get current stock
      const part = await getOne('SELECT stock FROM parts WHERE id = ?', [id]);
      
      if (!part) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Part not found' };
      }
      
      // Calculate new stock level
      const newStock = part.stock + quantity;
      
      // Don't allow negative stock
      if (newStock < 0) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Cannot reduce stock below zero' };
      }
      
      // Update stock
      const result = await runQuery(
        'UPDATE parts SET stock = ? WHERE id = ?',
        [newStock, id]
      );
      
      // Record stock movement in a separate table if one exists
      try {
        await runQuery(
          `INSERT INTO part_movements 
            (part_id, quantity, previous_stock, new_stock, notes) 
          VALUES (?, ?, ?, ?, ?)`,
          [id, quantity, part.stock, newStock, notes]
        );
      } catch (err) {
        // If part_movements table doesn't exist, just ignore
        console.log('Note: part_movements table does not exist');
      }
      
      await runQuery('COMMIT');
      
      return { 
        success: result.changes > 0, 
        newStock: newStock,
        belowMinimum: newStock < part.min_stock
      };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error adjusting stock:', err);
      throw err;
    }
  }

  /**
   * Get parts that are below their minimum stock level
   * @returns {Promise<Array>} List of parts below minimum stock
   */
  async getLowStockParts() {
    try {
      await this.ensurePartTableStructure();
      
      return await getAll(
        'SELECT * FROM parts WHERE stock < min_stock ORDER BY (min_stock - stock) DESC', 
        []
      );
    } catch (err) {
      console.error('Error fetching low stock parts:', err);
      throw err;
    }
  }
  
  /**
   * Ensure the parts table has the necessary structure
   * @private
   * @returns {Promise<void>}
   */
  async ensurePartTableStructure() {
    try {
      // Create the parts table if it doesn't exist
      await runQuery(`
        CREATE TABLE IF NOT EXISTS parts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          part_number TEXT NOT NULL,
          manufacturer TEXT,
          model TEXT,
          stock INTEGER DEFAULT 0,
          min_stock INTEGER DEFAULT 0,
          technical_specs TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create index on part_number for faster lookups
      await runQuery(`
        CREATE INDEX IF NOT EXISTS idx_part_number ON parts (part_number)
      `);
      
      // Optional: create a movements table to track stock changes
      await runQuery(`
        CREATE TABLE IF NOT EXISTS part_movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          part_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          previous_stock INTEGER NOT NULL,
          new_stock INTEGER NOT NULL,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (part_id) REFERENCES parts (id) ON DELETE CASCADE
        )
      `);
    } catch (err) {
      console.error('Error ensuring parts table structure:', err);
      throw err;
    }
  }
}

module.exports = new PartService();