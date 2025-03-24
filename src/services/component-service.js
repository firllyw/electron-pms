const { getAll, getOne, runQuery } = require('../db/database');

/**
 * Component service with SFI Group System integration
 */
class ComponentService {
  /**
   * Get all components, optionally filtered by parent ID or SFI code
   * @param {Object} filters - Filter criteria
   * @param {number} [filters.parentId] - Optional parent ID to filter by
   * @param {string} [filters.sfiCode] - Optional SFI code to filter by
   * @param {string} [filters.searchTerm] - Optional search term for component name
   * @returns {Promise<Array>} List of components
   */
  async getComponents(filters = {}) {
    try {
      await this.ensureComponentTableStructure();
      
      let whereConditions = [];
      let params = [];
      
      // Add parent filter
      if (filters.parentId) {
        whereConditions.push('parent_id = ?');
        params.push(filters.parentId);
      } else if (filters.parentId === null) {
        whereConditions.push('parent_id IS NULL');
      }
      
      // Add SFI code filter
      if (filters.sfiCode) {
        whereConditions.push('sfi_code LIKE ?');
        params.push(`${filters.sfiCode}%`);
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
        `SELECT * FROM components ${whereClause} ORDER BY sfi_code, name`, 
        params
      );
    } catch (err) {
      console.error('Error fetching components:', err);
      throw err;
    }
  }

  /**
   * Get SFI group structure for component organization
   * @returns {Promise<Array>} List of SFI groups
   */
  async getSfiGroups() {
    try {
      await this.ensureSfiGroupTable();
      
      return await getAll('SELECT * FROM sfi_groups ORDER BY code');
    } catch (err) {
      console.error('Error fetching SFI groups:', err);
      throw err;
    }
  }

  /**
   * Create a new component
   * @param {Object} data - The component data
   * @returns {Promise<Object>} Result with success status and new ID
   */
  async createComponent(data) {
    try {
      await this.ensureComponentTableStructure();
      
      // Validate SFI code if provided
      if (data.sfi_code) {
        const isValid = await this.validateSfiCode(data.sfi_code);
        if (!isValid) {
          return { success: false, message: 'Invalid SFI code format' };
        }
      }
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      const result = await runQuery(
        `INSERT INTO components 
          (name, parent_id, type, sfi_code, technical_specs, manufacturer, model, 
           serial_number, installation_date, warranty_expiry, criticality) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name,
          data.parent_id || null,
          data.type || 'equipment',
          data.sfi_code || null,
          data.technical_specs || null,
          data.manufacturer || null,
          data.model || null,
          data.serial_number || null,
          data.installation_date || null,
          data.warranty_expiry || null,
          data.criticality || 'medium'
        ]
      );
      
      if (!result.lastID) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Failed to create component' };
      }
      
      // Add initial attributes if provided
      if (data.attributes && Array.isArray(data.attributes) && data.attributes.length > 0) {
        await this.ensureComponentAttributeTable();
        
        for (const attr of data.attributes) {
          const attrResult = await runQuery(
            'INSERT INTO component_attributes (component_id, name, value) VALUES (?, ?, ?)',
            [result.lastID, attr.name, attr.value]
          );
          
          if (!attrResult.lastID) {
            await runQuery('ROLLBACK');
            return { success: false, message: 'Failed to add component attributes' };
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
      
      console.error('Error creating component:', err);
      throw err;
    }
  }

  /**
   * Update an existing component
   * @param {number} id - The component ID
   * @param {Object} data - The component data
   * @returns {Promise<Object>} Result with success status
   */
  async updateComponent(id, data) {
    try {
      await this.ensureComponentTableStructure();
      
      // Validate SFI code if provided
      if (data.sfi_code) {
        const isValid = await this.validateSfiCode(data.sfi_code);
        if (!isValid) {
          return { success: false, message: 'Invalid SFI code format' };
        }
      }
      
      // Check if component exists
      const component = await getOne('SELECT id FROM components WHERE id = ?', [id]);
      if (!component) {
        return { success: false, message: 'Component not found' };
      }
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      const result = await runQuery(
        `UPDATE components 
        SET name = ?, parent_id = ?, type = ?, sfi_code = ?, technical_specs = ?,
            manufacturer = ?, model = ?, serial_number = ?, installation_date = ?, 
            warranty_expiry = ?, criticality = ?
        WHERE id = ?`,
        [
          data.name,
          data.parent_id || null,
          data.type || 'equipment',
          data.sfi_code || null,
          data.technical_specs || null,
          data.manufacturer || null,
          data.model || null,
          data.serial_number || null,
          data.installation_date || null,
          data.warranty_expiry || null,
          data.criticality || 'medium',
          id
        ]
      );
      
      // Update attributes if provided
      if (data.attributes && Array.isArray(data.attributes)) {
        await this.ensureComponentAttributeTable();
        
        // Delete existing attributes
        await runQuery('DELETE FROM component_attributes WHERE component_id = ?', [id]);
        
        // Add new attributes
        for (const attr of data.attributes) {
          const attrResult = await runQuery(
            'INSERT INTO component_attributes (component_id, name, value) VALUES (?, ?, ?)',
            [id, attr.name, attr.value]
          );
          
          if (!attrResult.lastID) {
            await runQuery('ROLLBACK');
            return { success: false, message: 'Failed to update component attributes' };
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
      
      console.error('Error updating component:', err);
      throw err;
    }
  }

  /**
   * Delete a component
   * @param {number} id - The component ID
   * @returns {Promise<Object>} Result with success status
   */
  async deleteComponent(id) {
    try {
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      // First check if there are child components
      const children = await getAll('SELECT id FROM components WHERE parent_id = ?', [id]);
      
      if (children.length > 0) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Cannot delete component with children' };
      }
      
      // Then check if there are maintenance tasks
      const tasks = await getAll('SELECT id FROM maintenance_tasks WHERE component_id = ?', [id]);
      
      if (tasks.length > 0) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Cannot delete component with maintenance tasks' };
      }
      
      // Delete component attributes first
      await runQuery('DELETE FROM component_attributes WHERE component_id = ?', [id]);
      
      // Then delete the component
      const result = await runQuery('DELETE FROM components WHERE id = ?', [id]);
      
      await runQuery('COMMIT');
      
      return { success: result.changes > 0 };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error deleting component:', err);
      throw err;
    }
  }

  /**
   * Get component with full details including attributes
   * @param {number} id - The component ID
   * @returns {Promise<Object>} Component details
   */
  async getComponentDetails(id) {
    try {
      // Get component basic info
      const component = await getOne('SELECT * FROM components WHERE id = ?', [id]);
      
      if (!component) {
        return null;
      }
      
      // Get component attributes
      component.attributes = await getAll(
        'SELECT name, value FROM component_attributes WHERE component_id = ?',
        [id]
      );
      
      // Get parent info if exists
      if (component.parent_id) {
        component.parent = await getOne(
          'SELECT id, name, sfi_code FROM components WHERE id = ?',
          [component.parent_id]
        );
      }
      
      // Get children if any
      component.children = await getAll(
        'SELECT id, name, sfi_code, type FROM components WHERE parent_id = ?',
        [id]
      );
      
      return component;
    } catch (err) {
      console.error('Error getting component details:', err);
      throw err;
    }
  }

  /**
   * Get the component hierarchy tree
   * @returns {Promise<Array>} Hierarchical list of components
   */
  async getComponentTree() {
    try {
      // Get all components
      const allComponents = await getAll('SELECT id, name, parent_id, type, sfi_code, manufacturer, model, running_hours, criticality FROM components ORDER BY sfi_code, name');
      
      // Build the tree starting with root components (no parent)
      const rootComponents = allComponents.filter(comp => !comp.parent_id);
      
      // Recursive function to build the tree
      const buildTree = (parentComponents) => {
        return parentComponents.map(parent => {
          const children = allComponents.filter(comp => comp.parent_id === parent.id);
          return {
            ...parent,
            children: children.length > 0 ? buildTree(children) : []
          };
        });
      };
      
      return buildTree(rootComponents);
    } catch (err) {
      console.error('Error getting component tree:', err);
      throw err;
    }
  }

  /**
   * Import standard SFI groups
   * @returns {Promise<Object>} Result with success status
   */
  async importSfiGroups() {
    try {
      await this.ensureSfiGroupTable();
      
      // Check if SFI groups are already imported
      const existingGroups = await getOne('SELECT COUNT(*) as count FROM sfi_groups');
      
      if (existingGroups.count > 0) {
        return { success: true, message: 'SFI groups already imported' };
      }
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Import standard main groups
      const mainGroups = [
        { code: '1', name: 'Ship General', description: 'General ship systems and components' },
        { code: '2', name: 'Hull', description: 'Hull structure and related components' },
        { code: '3', name: 'Equipment for Cargo', description: 'Cargo handling equipment' },
        { code: '4', name: 'Ship Equipment', description: 'General ship equipment' },
        { code: '5', name: 'Equipment for Crew and Passengers', description: 'Accommodation and related systems' },
        { code: '6', name: 'Machinery Main Components', description: 'Main engine and related systems' },
        { code: '7', name: 'Systems for Machinery Main Components', description: 'Supporting systems for main engine' },
        { code: '8', name: 'Ship Common Systems', description: 'Common ship systems' }
      ];
      
      for (const group of mainGroups) {
        const result = await runQuery(
          'INSERT INTO sfi_groups (code, name, description, level) VALUES (?, ?, ?, ?)',
          [group.code, group.name, group.description, 1]
        );
        
        if (!result.lastID) {
          await runQuery('ROLLBACK');
          return { success: false, message: 'Failed to import SFI groups' };
        }
      }
      
      // Add some second level groups as examples (would be more in a real implementation)
      const subGroups = [
        { code: '60', name: 'Diesel Engine for Propulsion', parent_code: '6', level: 2 },
        { code: '61', name: 'Gas Turbine for Propulsion', parent_code: '6', level: 2 },
        { code: '62', name: 'Gear and Clutches', parent_code: '6', level: 2 },
        { code: '63', name: 'Propeller, Propeller Shaft', parent_code: '6', level: 2 },
        { code: '70', name: 'Fuel Oil System', parent_code: '7', level: 2 },
        { code: '71', name: 'Lube Oil System', parent_code: '7', level: 2 },
        { code: '72', name: 'Cooling System', parent_code: '7', level: 2 },
        { code: '80', name: 'Ballast and Bilge System', parent_code: '8', level: 2 },
        { code: '81', name: 'Fire and Wash Deck System', parent_code: '8', level: 2 }
      ];
      
      for (const group of subGroups) {
        const result = await runQuery(
          'INSERT INTO sfi_groups (code, name, description, parent_code, level) VALUES (?, ?, ?, ?, ?)',
          [group.code, group.name, '', group.parent_code, group.level]
        );
        
        if (!result.lastID) {
          await runQuery('ROLLBACK');
          return { success: false, message: 'Failed to import SFI sub-groups' };
        }
      }
      
      await runQuery('COMMIT');
      
      return { success: true, message: 'Successfully imported SFI groups' };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error importing SFI groups:', err);
      throw err;
    }
  }

  /**
   * Validate SFI code format
   * @private
   * @param {string} sfiCode - The SFI code to validate
   * @returns {Promise<boolean>} Whether the code is valid
   */
  async validateSfiCode(sfiCode) {
    // SFI codes typically follow the format:
    // - Level 1: Single digit (1-9)
    // - Level 2: Two digits (10-99)
    // - Level 3: Three digits (100-999)
    
    // Basic validation
    if (!sfiCode) return false;
    
    // Remove any non-numeric characters for validation
    const cleanCode = sfiCode.toString().replace(/\D/g, '');
    
    // Check if it's a valid length (1-3 digits)
    return cleanCode.length >= 1 && cleanCode.length <= 3;
  }
  
  /**
   * Ensure the component table has the necessary structure for SFI integration
   * @private
   * @returns {Promise<void>}
   */
  async ensureComponentTableStructure() {
    try {
      // Check if the sfi_code column exists
      const tableInfo = await getAll("PRAGMA table_info(components)");
      
      // Extract column names
      const columns = tableInfo.map(col => col.name);
      
      // Start a transaction for schema modifications
      if (!columns.includes('sfi_code')) {
        await runQuery('BEGIN TRANSACTION');
        
        // Add SFI code column
        await runQuery('ALTER TABLE components ADD COLUMN sfi_code TEXT');
        
        // Add technical specifications columns
        if (!columns.includes('technical_specs')) {
          await runQuery('ALTER TABLE components ADD COLUMN technical_specs TEXT');
        }
        if (!columns.includes('manufacturer')) {
          await runQuery('ALTER TABLE components ADD COLUMN manufacturer TEXT');
        }
        if (!columns.includes('model')) {
          await runQuery('ALTER TABLE components ADD COLUMN model TEXT');
        }
        if (!columns.includes('serial_number')) {
          await runQuery('ALTER TABLE components ADD COLUMN serial_number TEXT');
        }
        if (!columns.includes('installation_date')) {
          await runQuery('ALTER TABLE components ADD COLUMN installation_date TEXT');
        }
        if (!columns.includes('warranty_expiry')) {
          await runQuery('ALTER TABLE components ADD COLUMN warranty_expiry TEXT');
        }
        if (!columns.includes('criticality')) {
          await runQuery('ALTER TABLE components ADD COLUMN criticality TEXT DEFAULT "medium"');
        }
        if (!columns.includes('running_hours')) {
          await runQuery('ALTER TABLE components ADD COLUMN running_hours INTEGER DEFAULT 0');
        }
        
        await runQuery('COMMIT');
      }
    } catch (err) {
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error ensuring component table structure:', err);
      throw err;
    }
  }
  
  /**
   * Ensure the component attribute table exists
   * @private
   * @returns {Promise<void>}
   */
  async ensureComponentAttributeTable() {
    try {
      await runQuery(`
        CREATE TABLE IF NOT EXISTS component_attributes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          component_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          value TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (component_id) REFERENCES components (id) ON DELETE CASCADE
        )
      `);
    } catch (err) {
      console.error('Error creating component attributes table:', err);
      throw err;
    }
  }
  
  /**
   * Ensure the SFI group table exists
   * @private
   * @returns {Promise<void>}
   */
  async ensureSfiGroupTable() {
    try {
      await runQuery(`
        CREATE TABLE IF NOT EXISTS sfi_groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          description TEXT,
          parent_code TEXT,
          level INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_code) REFERENCES sfi_groups (code)
        )
      `);
    } catch (err) {
      console.error('Error creating SFI groups table:', err);
      throw err;
    }
  }
}

module.exports = new ComponentService();