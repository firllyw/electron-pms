const { getAll, getOne, runQuery } = require('../db/database');

/**
 * Maintenance service
 */
class MaintenanceService {
  /**
   * Get all maintenance tasks, optionally filtered by component ID or SFI code
   * @param {Object} filters - Filter criteria
   * @param {number} [filters.componentId] - Optional component ID to filter by
   * @param {string} [filters.sfiCode] - Optional SFI code to filter by
   * @param {string} [filters.status] - Optional status to filter by (overdue, upcoming, completed)
   * @param {number} [filters.dueDays] - Optional number of days to filter by upcoming tasks
   * @returns {Promise<Array>} List of maintenance tasks
   */
  async getMaintenanceTasks(filters = {}) {
    try {
      let whereConditions = [];
      let params = [];
      
      // Add component filter
      if (filters.componentId) {
        whereConditions.push('m.component_id = ?');
        params.push(filters.componentId);
      }
      
      // Add SFI code filter (for component and all children)
      if (filters.sfiCode) {
        whereConditions.push('c.sfi_code LIKE ?');
        params.push(`${filters.sfiCode}%`);
      }
      
      // Add status filter
      if (filters.status) {
        const now = new Date();
        
        switch (filters.status) {
          case 'overdue':
            whereConditions.push('m.due_at < ?');
            params.push(now.toISOString());
            break;
          case 'upcoming':
            // Default to 7 days if not specified
            const daysAhead = filters.dueDays || 7;
            const futureDate = new Date();
            futureDate.setDate(now.getDate() + daysAhead);
            
            whereConditions.push('m.due_at > ? AND m.due_at <= ?');
            params.push(now.toISOString(), futureDate.toISOString());
            break;
          case 'completed':
            whereConditions.push('EXISTS (SELECT 1 FROM maintenance_history h WHERE h.task_id = m.id)');
            break;
        }
      }
      
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      const tasks = await getAll(`
        SELECT 
          m.*, 
          c.name as component_name,
          c.sfi_code,
          c.running_hours as current_running_hours,
          (SELECT MAX(performed_at) FROM maintenance_history WHERE task_id = m.id) as last_performed
        FROM maintenance_tasks m 
        JOIN components c ON m.component_id = c.id 
        ${whereClause} 
        ORDER BY m.due_at
      `, params);
      
      // Calculate status and remaining time for each task
      return tasks.map(task => {
        const dueDate = new Date(task.due_at);
        const now = new Date();
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));
        
        let status = 'normal';
        if (diffDays < 0) {
          status = 'overdue';
        } else if (diffDays < 7) {
          status = 'soon';
        }
        console.log('task', task.due_at, diffDays, status);
        
        // Calculate hours remaining if we have running hours
        let hoursRemaining = null;
        // if (task.interval_hours && task.current_running_hours) {
        //   console.log('task', task);
        //   const lastDoneHours = task.last_done_hours || 0;
        //   const nextDueHours = lastDoneHours + task.interval_hours;
        //   hoursRemaining = nextDueHours - task.current_running_hours;
          
        //   if (hoursRemaining < 0) {
        //     status = 'overdue';
        //   } else if (hoursRemaining < 50) {
        //     status = 'soon';
        //   }
        // }
        
        return {
          ...task,
          status,
          days_remaining: diffDays,
          hours_remaining: hoursRemaining
        };
      });
    } catch (err) {
      console.error('Error fetching maintenance tasks:', err);
      throw err;
    }
  }

  /**
   * Create a new maintenance task
   * @param {Object} data - The maintenance task data
   * @returns {Promise<Object>} Result with success status and new ID
   */
  async createMaintenanceTask(data) {
    try {
      console.log('Creating maintenance task:', data);
      // Validate component exists
      const component = await getOne('SELECT id FROM components WHERE id = ?', [data.component_id]);
      
      console.log('Component:', component);
      if (!component || !data.component_id) {
        return { success: false, message: 'Component not found' };
      }
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      console.log('Creating maintenance task:', data);
      const result = await runQuery(
        `INSERT INTO maintenance_tasks 
          (component_id, name, description, interval_hours, last_done_at, due_at) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.component_id, 
          data.name, 
          data.description || null, 
          data.interval_hours, 
          data.last_done_at || null, 
          data.due_at || null
        ]
      );
      
      if (!result.lastID) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Failed to create maintenance task' };
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
      
      console.error('Error creating maintenance task:', err);
      throw err;
    }
  }

  /**
   * Update an existing maintenance task
   * @param {number} id - The maintenance task ID
   * @param {Object} data - The maintenance task data
   * @returns {Promise<Object>} Result with success status
   */
  async updateMaintenanceTask(id, data) {
    try {
      // Check if task exists
      const task = await getOne('SELECT id FROM maintenance_tasks WHERE id = ?', [id]);
      
      if (!task) {
        return { success: false, message: 'Maintenance task not found' };
      }
      
      // Validate component exists if changing
      if (data.component_id) {
        const component = await getOne('SELECT id FROM components WHERE id = ?', [data.component_id]);
        
        if (!component) {
          return { success: false, message: 'Component not found' };
        }
      }
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      const result = await runQuery(
        `UPDATE maintenance_tasks 
        SET component_id = ?, name = ?, description = ?, interval_hours = ?, 
            last_done_at = ?, due_at = ? 
        WHERE id = ?`,
        [
          data.component_id, 
          data.name, 
          data.description || null, 
          data.interval_hours, 
          data.last_done_at || null, 
          data.due_at || null,
          id
        ]
      );
      
      await runQuery('COMMIT');
      
      return { success: result.changes > 0 };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error updating maintenance task:', err);
      throw err;
    }
  }

  /**
   * Delete a maintenance task
   * @param {number} id - The maintenance task ID
   * @returns {Promise<Object>} Result with success status
   */
  async deleteMaintenanceTask(id) {
    try {
      // Check if task exists
      const task = await getOne('SELECT id FROM maintenance_tasks WHERE id = ?', [id]);
      
      if (!task) {
        return { success: false, message: 'Maintenance task not found' };
      }
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      // First delete any history records
      await runQuery('DELETE FROM maintenance_history WHERE task_id = ?', [id]);
      
      // Then delete the task
      const result = await runQuery('DELETE FROM maintenance_tasks WHERE id = ?', [id]);
      
      await runQuery('COMMIT');
      
      return { success: result.changes > 0 };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error deleting maintenance task:', err);
      throw err;
    }
  }
  
  /**
   * Complete a maintenance task
   * @param {number} id - The maintenance task ID
   * @param {Object} data - The completion data
   * @returns {Promise<Object>} Result with success status
   */
  async completeMaintenanceTask(id, data) {
    try {
      // Check if task exists
      const task = await getOne(
        'SELECT m.*, c.running_hours FROM maintenance_tasks m JOIN components c ON m.component_id = c.id WHERE m.id = ?', 
        [id]
      );
      
      if (!task) {
        return { success: false, message: 'Maintenance task not found' };
      }
      
      // Start transaction
      await runQuery('BEGIN TRANSACTION');
      
      // Add to maintenance history
      const historyResult = await runQuery(
        `INSERT INTO maintenance_history 
          (component_id, task_id, name, description, performed_by, performed_at, running_hours, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.component_id,
          id,
          task.name,
          task.description,
          data.performed_by,
          data.performed_at || new Date().toISOString(),
          data.running_hours || task.running_hours || 0,
          data.notes || null
        ]
      );
      
      if (!historyResult.lastID) {
        await runQuery('ROLLBACK');
        return { success: false, message: 'Failed to record maintenance history' };
      }
      
      // Update the task's last_done_at and calculate new due_at
      const newLastDoneAt = data.performed_at || new Date().toISOString();
      let newDueAt = null;
      
      if (task.interval_hours) {
        // Calculate new due date based on interval
        const dueDate = new Date(newLastDoneAt);
        dueDate.setHours(dueDate.getHours() + task.interval_hours);
        newDueAt = dueDate.toISOString();
      }
      
      await runQuery(
        'UPDATE maintenance_tasks SET last_done_at = ?, due_at = ? WHERE id = ?',
        [newLastDoneAt, newDueAt, id]
      );
      
      await runQuery('COMMIT');
      
      return { success: true, id: historyResult.lastID };
    } catch (err) {
      // Roll back in case of any error
      try {
        await runQuery('ROLLBACK');
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
      
      console.error('Error completing maintenance task:', err);
      throw err;
    }
  }
  
  /**
   * Get maintenance history
   * @param {Object} filters - Filter criteria
   * @param {number} [filters.componentId] - Optional component ID to filter by
   * @param {string} [filters.sfiCode] - Optional SFI code to filter by
   * @param {number} [filters.taskId] - Optional task ID to filter by
   * @param {number} [filters.limit] - Optional limit of records to return
   * @returns {Promise<Array>} List of maintenance history records
   */
  async getMaintenanceHistory(filters = {}) {
    try {
      let whereConditions = [];
      let params = [];
      
      // Add component filter
      if (filters.componentId) {
        whereConditions.push('h.component_id = ?');
        params.push(filters.componentId);
      }
      
      // Add SFI code filter (for component and all children)
      if (filters.sfiCode) {
        whereConditions.push('c.sfi_code LIKE ?');
        params.push(`${filters.sfiCode}%`);
      }
      
      // Add task filter
      if (filters.taskId) {
        whereConditions.push('h.task_id = ?');
        params.push(filters.taskId);
      }
      
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      const limitClause = filters.limit ? `LIMIT ${parseInt(filters.limit)}` : '';
      
      return await getAll(`
        SELECT 
          h.*,
          c.name as component_name,
          c.sfi_code,
          u.name as performed_by_name
        FROM maintenance_history h
        JOIN components c ON h.component_id = c.id
        LEFT JOIN users u ON h.performed_by = u.id
        ${whereClause}
        ORDER BY h.performed_at DESC
        ${limitClause}
      `, params);
    } catch (err) {
      console.error('Error fetching maintenance history:', err);
      throw err;
    }
  }
}

module.exports = new MaintenanceService();