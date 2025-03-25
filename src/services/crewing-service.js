const { getAll, getOne, runQuery } = require('../db/database');

/**
 * Crewing service for managing vessel crew and their documents
 */
class CrewingService {
  /**
   * Get all crew members, optionally filtered by position or search term
   * @param {Object} filters - Filter criteria
   * @param {string} [filters.position] - Optional position to filter by
   * @param {string} [filters.searchTerm] - Optional search term for crew name
   * @returns {Promise<Array>} List of crew members
   */
  async getCrewMembers(filters = {}) {
    try {
      await this.ensureCrewingTableStructure();
      
      let whereConditions = [];
      let params = [];
      
      // Add position filter
      if (filters.position) {
        whereConditions.push('position = ?');
        params.push(filters.position);
      }
      
      // Add name search
      if (filters.searchTerm) {
        whereConditions.push('name LIKE ?');
        params.push(`%${filters.searchTerm}%`);
      }
      
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      return await getAll(
        `SELECT * FROM crewing ${whereClause} ORDER BY position, name`, 
        params
      );
    } catch (err) {
      console.error('Error fetching crew members:', err);
      throw err;
    }
  }

  /**
   * Get crew positions for filtering
   * @returns {Promise<Array>} List of unique positions
   */
  async getCrewPositions() {
    try {
      await this.ensureCrewingTableStructure();
      
      return await getAll('SELECT DISTINCT position FROM crewing ORDER BY position');
    } catch (err) {
      console.error('Error fetching crew positions:', err);
      throw err;
    }
  }

  /**
   * Create a new crew member
   * @param {Object} data - The crew member data
   * @returns {Promise<Object>} Result with success status and new ID
   */
  async createCrewMember(data) {
    try {
      await this.ensureCrewingTableStructure();
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      const result = await runQuery(
        `INSERT INTO crewing 
          (name, dob, country, position, role) 
        VALUES (?, ?, ?, ?, ?)`,
        [
          data.name,
          data.dob || null,
          data.country || null,
          data.position || null,
          data.role || 'crew'
        ]
      );
      
      if (!result.lastID) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Failed to create crew member' };
      }
      
      // Add initial documents if provided
      if (data.documents && Array.isArray(data.documents) && data.documents.length > 0) {
        await this.ensureCrewDocumentsTable();
        
        for (const doc of data.documents) {
          const docResult = await runQuery(
            `INSERT INTO crew_documents 
              (crewing_id, name, document_type, document_number, issued_date, expiry_date) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              result.lastID, 
              doc.name, 
              doc.document_type, 
              doc.document_number, 
              doc.issued_date, 
              doc.expiry_date
            ]
          );
          
          if (!docResult.lastID) {
            await runQuery('ROLLBACK');
            return { success: false, message: 'Failed to add crew documents' };
          }
        }
      }
      
      await runQuery('COMMIT');
      
      return { success: true, id: result.lastID };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error creating crew member:', err);
      throw err;
    }
  }

  /**
   * Update an existing crew member
   * @param {number} id - The crew member ID
   * @param {Object} data - The crew member data
   * @returns {Promise<Object>} Result with success status
   */
  async updateCrewMember(id, data) {
    try {
      await this.ensureCrewingTableStructure();
      
      // Check if crew member exists
      const crewMember = await getOne('SELECT id FROM crewing WHERE id = ?', [id]);
      if (!crewMember) {
        return { success: false, message: 'Crew member not found' };
      }
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Update the updated_at timestamp
      const now = new Date().toISOString();
      
      const result = await runQuery(
        `UPDATE crewing 
        SET name = ?, dob = ?, country = ?, position = ?, role = ?, updated_at = ?
        WHERE id = ?`,
        [
          data.name,
          data.dob || null,
          data.country || null,
          data.position || null,
          data.role || 'crew',
          now,
          id
        ]
      );
      
      // Update documents if provided
      if (data.documents && Array.isArray(data.documents)) {
        await this.ensureCrewDocumentsTable();
        
        // Delete existing documents
        await runQuery('DELETE FROM crew_documents WHERE crewing_id = ?', [id]);
        
        // Add new documents
        for (const doc of data.documents) {
          const docResult = await runQuery(
            `INSERT INTO crew_documents 
              (crewing_id, name, document_type, document_number, issued_date, expiry_date) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              id, 
              doc.name, 
              doc.document_type, 
              doc.document_number, 
              doc.issued_date, 
              doc.expiry_date
            ]
          );
          
          if (!docResult.lastID) {
            await runQuery('ROLLBACK');
            return { success: false, message: 'Failed to update crew documents' };
          }
        }
      }
      
      await runQuery('COMMIT');
      
      return { success: result.changes > 0 };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error updating crew member:', err);
      throw err;
    }
  }

  /**
   * Delete a crew member
   * @param {number} id - The crew member ID
   * @returns {Promise<Object>} Result with success status
   */
  async deleteCrewMember(id) {
    try {
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Delete crew member documents first
      await runQuery('DELETE FROM crew_documents WHERE crewing_id = ?', [id]);
      
      // Then delete the crew member
      const result = await runQuery('DELETE FROM crewing WHERE id = ?', [id]);
      
      await runQuery('COMMIT');
      
      return { success: result.changes > 0 };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error deleting crew member:', err);
      throw err;
    }
  }

  /**
   * Get crew member with full details including documents
   * @param {number} id - The crew member ID
   * @returns {Promise<Object>} Crew member details
   */
  async getCrewMemberDetails(id) {
    try {
      // Get crew member basic info
      const crewMember = await getOne('SELECT * FROM crewing WHERE id = ?', [id]);
      
      if (!crewMember) {
        return null;
      }
      
      // Get crew member documents
      crewMember.documents = await getAll(
        'SELECT * FROM crew_documents WHERE crewing_id = ? ORDER BY expiry_date',
        [id]
      );
      
      return crewMember;
    } catch (err) {
      console.error('Error getting crew member details:', err);
      throw err;
    }
  }
  
  /**
   * Get expiring documents within a specified time period
   * @param {number} daysToExpiry - Number of days to check for expiring documents
   * @returns {Promise<Array>} List of expiring documents with crew member info
   */
  async getExpiringDocuments(daysToExpiry = 30) {
    try {
      await this.ensureCrewDocumentsTable();
      
      const today = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysToExpiry);
      const futureDateStr = futureDate.toISOString().split('T')[0];
      
      return await getAll(`
        SELECT cd.*, c.name as crew_name, c.position 
        FROM crew_documents cd
        JOIN crewing c ON cd.crewing_id = c.id
        WHERE cd.expiry_date BETWEEN ? AND ?
        ORDER BY cd.expiry_date ASC
      `, [today, futureDateStr]);
    } catch (err) {
      console.error('Error getting expiring documents:', err);
      throw err;
    }
  }
  
  /**
   * Ensure the crewing table has the necessary structure
   * @private
   * @returns {Promise<void>}
   */
  async ensureCrewingTableStructure() {
    try {
      // Create the crewing table if it doesn't exist
      await runQuery(`
        CREATE TABLE IF NOT EXISTS crewing (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          dob TEXT,
          country TEXT,
          position TEXT,
          role TEXT NOT NULL DEFAULT 'crew',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Check if the updated_at column exists (for backward compatibility)
      const tableInfo = await getAll("PRAGMA table_info(crewing)");
      const columns = tableInfo.map(col => col.name);
      
      if (!columns.includes('updated_at')) {
        await runQuery('ALTER TABLE crewing ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
      }
      
      // Fix column name from bod to dob if needed (correcting the typo in the original schema)
      if (columns.includes('bod') && !columns.includes('dob')) {
        await runQuery('BEGIN TRANSACTION');
        
        // Create a new table with correct column name
        await runQuery(`
          CREATE TABLE crewing_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            dob TEXT,
            country TEXT,
            position TEXT,
            role TEXT NOT NULL DEFAULT 'crew',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Copy data with renamed column
        await runQuery(`
          INSERT INTO crewing_new (id, name, dob, country, position, role, created_at, updated_at)
          SELECT id, name, bod, country, position, role, created_at, updated_at FROM crewing
        `);
        
        // Drop old table and rename new one
        await runQuery('DROP TABLE crewing');
        await runQuery('ALTER TABLE crewing_new RENAME TO crewing');
        
        await runQuery('COMMIT');
      }
    } catch (err) {
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error ensuring crewing table structure:', err);
      throw err;
    }
  }
  
  /**
   * Ensure the crew documents table exists
   * @private
   * @returns {Promise<void>}
   */
  async ensureCrewDocumentsTable() {
    try {
      await runQuery(`
        CREATE TABLE IF NOT EXISTS crew_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          crewing_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          document_type TEXT NOT NULL,
          document_number TEXT NOT NULL,
          issued_date TEXT NOT NULL,
          expiry_date TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (crewing_id) REFERENCES crewing (id) ON DELETE CASCADE
        )
      `);
    } catch (err) {
      console.error('Error creating crew documents table:', err);
      throw err;
    }
  }
}

module.exports = new CrewingService();