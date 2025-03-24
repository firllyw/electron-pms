const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db;

// Initialize the database
function initDatabase() {
  return new Promise((resolve, reject) => {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'ship_maintenance.db');
    
    // Ensure directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    // Create/open database
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          console.error('Error enabling foreign keys:', err);
          reject(err);
          return;
        }
        
        // Create tables and seed data
        createTables()
          .then(() => seedInitialData())
          .then(() => {
            // Import SFI component data
            const componentSeeder = require('../services/component-seeder');
            return componentSeeder.seedComponents();
          })
          .then(() => resolve(db))
          .catch(err => reject(err));
      });
    });
    
    return db;
  });
}

// Create necessary tables
function createTables() {
  return new Promise((resolve, reject) => {
    // Users table
    const createUserTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Components table
    const createComponentTable = `
      CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        type TEXT NOT NULL,
        sfi_code TEXT,
        manufacturer TEXT,
        model TEXT,
        technical_specs TEXT,
        serial_number TEXT,
        installation_date TEXT,
        warranty_expiry TEXT,
        criticality TEXT DEFAULT 'medium',
        running_hours INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES components (id)
      )
    `;
    
    // Maintenance tasks table
    const createMaintenanceTaskTable = `
      CREATE TABLE IF NOT EXISTS maintenance_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        interval_hours INTEGER NOT NULL,
        last_done_at TIMESTAMP,
        due_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (component_id) REFERENCES components (id)
      )
    `;
    
    // Maintenance history table
    const createMaintenanceHistoryTable = `
      CREATE TABLE IF NOT EXISTS maintenance_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id INTEGER NOT NULL,
        task_id INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        performed_by INTEGER,
        performed_at TIMESTAMP NOT NULL,
        running_hours INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (component_id) REFERENCES components (id),
        FOREIGN KEY (task_id) REFERENCES maintenance_tasks (id),
        FOREIGN KEY (performed_by) REFERENCES users (id)
      )
    `;
    
    // Component attributes table
    const createComponentAttributeTable = `
      CREATE TABLE IF NOT EXISTS component_attributes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        component_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        value TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (component_id) REFERENCES components (id) ON DELETE CASCADE
      )
    `;
    
    // SFI groups table
    const createSfiGroupTable = `
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
    `;
    
    // Execute all create table statements in a transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      db.run(createUserTable, (err) => {
        if (err) {
          db.run('ROLLBACK');
          console.error('Error creating users table:', err);
          reject(err);
          return;
        }
        
        db.run(createComponentTable, (err) => {
          if (err) {
            db.run('ROLLBACK');
            console.error('Error creating components table:', err);
            reject(err);
            return;
          }
          
          db.run(createMaintenanceTaskTable, (err) => {
            if (err) {
              db.run('ROLLBACK');
              console.error('Error creating maintenance_tasks table:', err);
              reject(err);
              return;
            }
            
            db.run(createMaintenanceHistoryTable, (err) => {
              if (err) {
                db.run('ROLLBACK');
                console.error('Error creating maintenance_history table:', err);
                reject(err);
                return;
              }
              
              db.run(createComponentAttributeTable, (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  console.error('Error creating component_attributes table:', err);
                  reject(err);
                  return;
                }
                
                db.run(createSfiGroupTable, (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    console.error('Error creating sfi_groups table:', err);
                    reject(err);
                    return;
                  }
                  
                  db.run('COMMIT', (err) => {
                    if (err) {
                      console.error('Error committing transaction:', err);
                      reject(err);
                      return;
                    }
                    
                    resolve();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}

// Seed with initial data if needed
function seedInitialData() {
  return new Promise((resolve, reject) => {
    // Check if users table is empty
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        console.error('Error checking users table:', err);
        reject(err);
        return;
      }
      
      if (row.count === 0) {
        // Begin transaction for seeding data
        db.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            console.error('Error beginning transaction:', err);
            reject(err);
            return;
          }
          
          // Add default admin user
          const insertUser = `
            INSERT INTO users (username, password, name, role)
            VALUES (?, ?, ?, ?)
          `;
          
          db.run(insertUser, ['admin', 'password', 'Administrator', 'administrator'], function(err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('Error inserting admin user:', err);
              reject(err);
              return;
            }
            
            // Add engineer user
            db.run(insertUser, ['engineer', 'password', 'Marine Engineer', 'engineer'], function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Error inserting engineer user:', err);
                reject(err);
                return;
              }
              
              // Commit the transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  console.error('Error committing transaction:', err);
                  reject(err);
                  return;
                }
                
                resolve();
              });
            });
          });
        });
      } else {
        // No need to seed data
        resolve();
      }
    });
  });
}

// Get database instance
function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

// Run a query with promise support
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// Get a single row with promise support
function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

// Get multiple rows with promise support
function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

// Close the database connection
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          reject(err);
          return;
        }
        db = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initDatabase,
  getDb,
  runQuery,
  getOne,
  getAll,
  closeDatabase
};