const { getAll, getOne, runQuery } = require('../db/database');

/**
 * Purchase service
 */
class PurchaseService {
  /**
   * Get all purchase orders
   * @returns {Promise<Array>} List of purchase orders
   */
  async getPurchaseOrders() {
    try {
      // We need to create this table since it doesn't exist in the original schema
      await this.ensurePurchaseOrderTable();
      
      // Get all purchase orders
      const purchaseOrders = await getAll(`
        SELECT po.*, 
               u.name as created_by_name 
        FROM purchase_orders po
        LEFT JOIN users u ON po.created_by = u.id
        ORDER BY po.created_at DESC
      `);
      
      // For each purchase order, get its items
      for (const order of purchaseOrders) {
        order.items = await this.getPurchaseOrderItems(order.id);
      }
      
      return purchaseOrders;
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      throw err;
    }
  }

  /**
   * Get all items for a specific purchase order
   * @param {number} purchaseOrderId - The purchase order ID
   * @returns {Promise<Array>} List of purchase order items
   */
  async getPurchaseOrderItems(purchaseOrderId) {
    try {
      await this.ensurePurchaseItemTable();
      
      return await getAll(
        'SELECT * FROM purchase_order_items WHERE purchase_order_id = ?',
        [purchaseOrderId]
      );
    } catch (err) {
      console.error('Error fetching purchase order items:', err);
      return [];
    }
  }

  /**
   * Create a new purchase order
   * @param {Object} data - The purchase order data
   * @returns {Promise<Object>} Result with success status and new ID
   */
  async createPurchaseOrder(data) {
    try {
      await this.ensurePurchaseOrderTable();
      
      // Start a transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Calculate total amount if not provided
      let totalAmount = data.total_amount || 0;
      
      if (data.items && Array.isArray(data.items) && data.items.length > 0 && !data.total_amount) {
        totalAmount = data.items.reduce((total, item) => {
          return total + (item.quantity || 1) * (item.unit_price || 0);
        }, 0);
      }
      
      // Insert the purchase order
      const result = await runQuery(
        `INSERT INTO purchase_orders 
          (order_number, supplier, status, total_amount, created_by, notes) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.order_number,
          data.supplier,
          data.status || 'pending',
          totalAmount,
          data.created_by,
          data.notes || null
        ]
      );
      
      if (!result.lastID) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Failed to create purchase order' };
      }
      
      // If there are items in the purchase order, insert them
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        await this.ensurePurchaseItemTable();
        
        for (const item of data.items) {
          const itemResult = await runQuery(
            `INSERT INTO purchase_order_items 
              (purchase_order_id, name, quantity, unit_price, part_number) 
            VALUES (?, ?, ?, ?, ?)`,
            [
              result.lastID,
              item.name,
              item.quantity || 1,
              item.unit_price || 0,
              item.part_number || null
            ]
          );
          
          if (!itemResult.lastID) {
            await runQuery('ROLLBACK');
            return { success: false, message: 'Failed to add item to purchase order' };
          }
        }
      }
      
      // Commit the transaction
      await runQuery('COMMIT');
      
      return { success: true, id: result.lastID };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error creating purchase order:', err);
      throw err;
    }
  }

  /**
   * Update an existing purchase order
   * @param {number} id - The purchase order ID
   * @param {Object} data - The purchase order data
   * @returns {Promise<Object>} Result with success status
   */
  async updatePurchaseOrder(id, data) {
    try {
      await this.ensurePurchaseOrderTable();
      
      // Start a transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Calculate total amount if not provided
      let totalAmount = data.total_amount || 0;
      
      if (data.items && Array.isArray(data.items) && data.items.length > 0 && !data.total_amount) {
        totalAmount = data.items.reduce((total, item) => {
          return total + (item.quantity || 1) * (item.unit_price || 0);
        }, 0);
      }
      
      // Check if the order exists
      const order = await getOne('SELECT id FROM purchase_orders WHERE id = ?', [id]);
      
      if (!order) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Purchase order not found' };
      }
      
      // Update the order
      const result = await runQuery(
        `UPDATE purchase_orders 
        SET order_number = ?, supplier = ?, status = ?, total_amount = ?, notes = ? 
        WHERE id = ?`,
        [
          data.order_number,
          data.supplier,
          data.status || 'pending',
          totalAmount,
          data.notes || null,
          id
        ]
      );
      
      // If there are items in the purchase order, update them
      if (data.items && Array.isArray(data.items)) {
        await this.ensurePurchaseItemTable();
        
        // First delete all existing items
        await runQuery('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [id]);
        
        // Then insert the updated items
        for (const item of data.items) {
          const itemResult = await runQuery(
            `INSERT INTO purchase_order_items 
              (purchase_order_id, name, quantity, unit_price, part_number) 
            VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              item.name,
              item.quantity || 1,
              item.unit_price || 0,
              item.part_number || null
            ]
          );
          
          if (!itemResult.lastID) {
            await runQuery('ROLLBACK');
            return { success: false, message: 'Failed to update purchase order items' };
          }
        }
      }
      
      // Commit the transaction
      await runQuery('COMMIT');
      
      return { success: result.changes > 0 };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error updating purchase order:', err);
      throw err;
    }
  }

  /**
   * Delete a purchase order
   * @param {number} id - The purchase order ID
   * @returns {Promise<Object>} Result with success status
   */
  async deletePurchaseOrder(id) {
    try {
      await this.ensurePurchaseOrderTable();
      await this.ensurePurchaseItemTable();
      
      // Start a transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Check if the order exists
      const order = await getOne('SELECT id FROM purchase_orders WHERE id = ?', [id]);
      
      if (!order) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Purchase order not found' };
      }
      
      // Delete all items first
      await runQuery('DELETE FROM purchase_order_items WHERE purchase_order_id = ?', [id]);
      
      // Then delete the purchase order
      const result = await runQuery('DELETE FROM purchase_orders WHERE id = ?', [id]);
      
      // Commit the transaction
      await runQuery('COMMIT');
      
      return { success: result.changes > 0 };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error deleting purchase order:', err);
      throw err;
    }
  }

  /**
   * Ensure the purchase order table exists
   * @private
   * @returns {Promise<void>}
   */
  async ensurePurchaseOrderTable() {
    try {
      await runQuery(`
        CREATE TABLE IF NOT EXISTS purchase_orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT NOT NULL,
          supplier TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          total_amount REAL NOT NULL DEFAULT 0,
          created_by INTEGER,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (created_by) REFERENCES users (id)
        )
      `);
    } catch (err) {
      console.error('Error creating purchase orders table:', err);
      throw err;
    }
  }

  /**
   * Ensure the purchase order items table exists
   * @private
   * @returns {Promise<void>}
   */
  async ensurePurchaseItemTable() {
    try {
      await runQuery(`
        CREATE TABLE IF NOT EXISTS purchase_order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          purchase_order_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price REAL NOT NULL DEFAULT 0,
          part_number TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders (id) ON DELETE CASCADE
        )
      `);
    } catch (err) {
      console.error('Error creating purchase order items table:', err);
      throw err;
    }
  }
}

module.exports = new PurchaseService();