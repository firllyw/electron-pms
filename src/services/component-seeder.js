const { runQuery, getOne, getAll } = require('../db/database');
const cargoShipData = require('../db/sfi-seed-data');

/**
 * Component seeder service for importing SFI-based component hierarchies
 */
class ComponentSeederService {
  /**
   * Seed components from a ship data object
   * @returns {Promise<Object>} Result with success status
   */
  async seedComponents() {
    try {
      // Check if components already exist
      const existingComponents = await getOne('SELECT COUNT(*) as count FROM components');
      
      if (existingComponents.count > 10) {
        return { success: true, message: 'Components already seeded' };
      }
      
      // Start a transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Ensure table structure
      await this.ensureComponentTableStructure();
      
      // Process all top-level systems
      const systems = Object.values(cargoShipData);
      const componentMap = new Map(); // To store ID mappings
      
      // First insert all top-level systems
      for (const system of systems) {
        const result = await this.insertComponent({
          name: system.name,
          parent_id: null,
          type: system.type,
          sfi_code: system.sfi_code
        });
        
        if (!result.success) {
          await runQuery('ROLLBACK');
          return result;
        }
        
        componentMap.set(system.id || system.sfi_code, result.id);
      }
      
      // Then recursively insert all children
      for (const system of systems) {
        const parentId = componentMap.get(system.id || system.sfi_code);
        
        if (system.children && system.children.length > 0) {
          const result = await this.insertChildComponents(system.children, parentId, componentMap);
          
          if (!result.success) {
            await runQuery('ROLLBACK');
            return result;
          }
        }
      }
      
      // Import maintenance tasks for some components
      await this.seedMaintenanceTasks(componentMap);
      
      await runQuery('COMMIT');
      
      return { success: true, message: 'Successfully seeded components' };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error seeding components:', err);
      throw err;
    }
  }
  
  /**
   * Recursively insert child components
   * @private
   * @param {Array} children - Child components to insert
   * @param {number} parentId - Parent component ID
   * @param {Map} componentMap - Map of component IDs
   * @returns {Promise<Object>} Result with success status
   */
  async insertChildComponents(children, parentId, componentMap) {
    try {
      for (const child of children) {
        // Insert the child component
        const result = await this.insertComponent({
          name: child.name,
          parent_id: parentId,
          type: child.type,
          sfi_code: child.sfi_code,
          manufacturer: child.manufacturer,
          model: child.model,
          technical_specs: child.technical_specs,
          serial_number: child.serial_number,
          installation_date: child.installation_date,
          warranty_expiry: child.warranty_expiry,
          criticality: child.criticality,
          running_hours: child.running_hours || 0
        });
        
        if (!result.success) {
          return result;
        }
        
        componentMap.set(child.id || child.sfi_code, result.id);
        
        // Recursively insert any children
        if (child.children && child.children.length > 0) {
          const childResult = await this.insertChildComponents(child.children, result.id, componentMap);
          
          if (!childResult.success) {
            return childResult;
          }
        }
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error inserting child components:', err);
      throw err;
    }
  }
  
  /**
   * Insert a single component
   * @private
   * @param {Object} component - Component data
   * @returns {Promise<Object>} Result with success status and new ID
   */
  async insertComponent(component) {
    try {
      const result = await runQuery(
        `INSERT INTO components 
          (name, parent_id, type, sfi_code, manufacturer, model, technical_specs, 
           serial_number, installation_date, warranty_expiry, criticality, running_hours) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          component.name,
          component.parent_id,
          component.type || 'component',
          component.sfi_code,
          component.manufacturer || null,
          component.model || null,
          component.technical_specs || null,
          component.serial_number || null,
          component.installation_date || null,
          component.warranty_expiry || null,
          component.criticality || 'medium',
          component.running_hours || 0
        ]
      );
      
      if (result.lastID) {
        return { success: true, id: result.lastID };
      }
      
      return { success: false, message: 'Failed to insert component' };
    } catch (err) {
      console.error('Error inserting component:', err);
      throw err;
    }
  }
  
  /**
   * Seed maintenance tasks for selected components
   * @private
   * @param {Map} componentMap - Map of component IDs
   * @returns {Promise<Object>} Result with success status
   */
  async seedMaintenanceTasks(componentMap) {
    try {
      // For this example, we'll add maintenance tasks for the main engine
      const mainEngineId = componentMap.get('600');
      if (mainEngineId) {
        const maintenanceTasks = [
          {
            component_id: mainEngineId,
            name: '100-hours maintenance',
            description: 'General check of all engine systems.',
            interval_hours: 100,
            last_done_at: new Date(Date.now() - 82 * 3600 * 1000).toISOString(),
            due_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString()
          },
          {
            component_id: mainEngineId,
            name: 'Change engine oil',
            description: 'Replace engine oil and oil filter.',
            interval_hours: 200,
            last_done_at: new Date(Date.now() - 182 * 3600 * 1000).toISOString(),
            due_at: new Date(Date.now() + 18 * 3600 * 1000).toISOString()
          },
          {
            component_id: mainEngineId,
            name: 'Check crankshaft alignment',
            description: 'Verify alignment of crankshaft and connecting rods.',
            interval_hours: 1000,
            last_done_at: new Date(Date.now() - 382 * 3600 * 1000).toISOString(),
            due_at: new Date(Date.now() + 618 * 3600 * 1000).toISOString()
          },
          {
            component_id: mainEngineId,
            name: 'Replace fuel filters',
            description: 'Replace primary and secondary fuel filters.',
            interval_hours: 500,
            last_done_at: new Date(Date.now() - 382 * 3600 * 1000).toISOString(),
            due_at: new Date(Date.now() + 118 * 3600 * 1000).toISOString()
          },
          {
            component_id: mainEngineId,
            name: 'Check cooling system',
            description: 'Inspect coolant levels, hoses, and water pump.',
            interval_hours: 200,
            last_done_at: new Date(Date.now() - 282 * 3600 * 1000).toISOString(),
            due_at: new Date(Date.now() - 82 * 3600 * 1000).toISOString()
          }
        ];
        
        for (const task of maintenanceTasks) {
          await runQuery(
            `INSERT INTO maintenance_tasks 
              (component_id, name, description, interval_hours, last_done_at, due_at) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
              task.component_id,
              task.name,
              task.description,
              task.interval_hours,
              task.last_done_at,
              task.due_at
            ]
          );
        }
      }
      
      // Add maintenance tasks for propeller system
      const propellerId = componentMap.get('631');
      if (propellerId) {
        await runQuery(
          `INSERT INTO maintenance_tasks 
            (component_id, name, description, interval_hours, last_done_at, due_at) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            propellerId,
            'Propeller inspection',
            'Visual inspection of propeller blades for damage and fouling.',
            2000,
            new Date(Date.now() - 1500 * 3600 * 1000).toISOString(),
            new Date(Date.now() + 500 * 3600 * 1000).toISOString()
          ]
        );
      }
      
      // Add maintenance tasks for cooling system
      const coolingSystemId = componentMap.get('720');
      if (coolingSystemId) {
        await runQuery(
          `INSERT INTO maintenance_tasks 
            (component_id, name, description, interval_hours, last_done_at, due_at) 
          VALUES (?, ?, ?, ?, ?, ?)`,
          [
            coolingSystemId,
            'Clean heat exchangers',
            'Disassemble and clean sea water side of heat exchangers.',
            4000,
            new Date(Date.now() - 3500 * 3600 * 1000).toISOString(),
            new Date(Date.now() + 500 * 3600 * 1000).toISOString()
          ]
        );
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error seeding maintenance tasks:', err);
      throw err;
    }
  }
  
  /**
   * Ensure the component table has the necessary structure
   * @private
   * @returns {Promise<void>}
   */
  async ensureComponentTableStructure() {
    try {
      // Get table info using getAll instead of runQuery
      const tableInfo = await getAll("PRAGMA table_info(components)");
      
      // Extract column names from tableInfo
      const columns = tableInfo.map(col => col.name);
      
      // Add missing columns
      if (!columns.includes('sfi_code')) {
        await runQuery('ALTER TABLE components ADD COLUMN sfi_code TEXT');
      }
      
      if (!columns.includes('manufacturer')) {
        await runQuery('ALTER TABLE components ADD COLUMN manufacturer TEXT');
      }
      
      if (!columns.includes('model')) {
        await runQuery('ALTER TABLE components ADD COLUMN model TEXT');
      }
      
      if (!columns.includes('technical_specs')) {
        await runQuery('ALTER TABLE components ADD COLUMN technical_specs TEXT');
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
    } catch (err) {
      console.error('Error ensuring component table structure:', err);
      throw err;
    }
  }
}

module.exports = new ComponentSeederService();