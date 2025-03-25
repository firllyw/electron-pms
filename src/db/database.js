const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

let db;

// Initialize the database
function initDatabase() {
  return new Promise((resolve, reject) => {
    try {
      const userDataPath = app.getPath('userData');
      const dbPath = path.join(userDataPath, 'ship_maintenance.db');
      
      // Ensure directory exists
      if (!fs.existsSync(userDataPath)) {
        fs.mkdirSync(userDataPath, { recursive: true });
      }
      
      // Create/open database (better-sqlite3 is synchronous)
      db = new Database(dbPath, { verbose: console.log });
      
      // Enable foreign keys
      db.pragma('foreign_keys = ON');
      
      // Create tables and seed data
      createTables()
        .then(() => seedInitialData())
        .then(() => {
          // Import SFI component data
          const componentSeeder = require('../services/component-seeder');
          return componentSeeder.seedComponents();
        })
        .then(() => resolve(db))
        .catch(err => {
          console.error('Database initialization error:', err);
          reject(err);
        });
    } catch (err) {
      console.error('Error initializing database:', err);
      reject(err);
    }
    
    return db;
  });
}

// Create necessary tables
function createTables() {
  return new Promise((resolve, reject) => {
    try {
      // Start transaction
      const transaction = db.transaction(() => {
        // Users table
        db.exec(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Components table
        db.exec(`
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
        `);
        
        // Maintenance tasks table
        db.exec(`
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
        `);
        
        // Maintenance history table
        db.exec(`
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
        `);
        
        // Component attributes table
        db.exec(`
          CREATE TABLE IF NOT EXISTS component_attributes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            component_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            value TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (component_id) REFERENCES components (id) ON DELETE CASCADE
          )
        `);
        
        // SFI groups table
        db.exec(`
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
      });

      // Part table
      db.exec(`
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

      // Crewing table, unrelated to users, so it will have it's own details profile
      db.exec(`
        CREATE TABLE IF NOT EXISTS crewing (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          bod TEXT NOT NULL,
          country TEXT NOT NULL,
          position TEXT NOT NULL,

          role TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Crew Documents
      db.exec(`
        CREATE TABLE IF NOT EXISTS crew_documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          crewing_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          document_type TEXT NOT NULL,
          document_number TEXT NOT NULL,
          issued_date TEXT NOT NULL,
          expiry_date TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (crewing_id) REFERENCES crewing (id)
        )
      `);
      
      // Execute the transaction
      transaction();
      
      resolve();
    } catch (err) {
      console.error('Error creating tables:', err);
      reject(err);
    }
  });
}

// Seed with initial data if needed
function seedInitialData() {
  return new Promise((resolve, reject) => {
    try {
      // Check if users table is empty
      const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
      
      if (userCount.count === 0) {
        // Begin transaction for seeding data
        const transaction = db.transaction(() => {
          // Add default admin user
          const insertUser = db.prepare(
            'INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)'
          );
          
          insertUser.run('admin', 'password', 'Administrator', 'administrator');
          insertUser.run('engineer', 'password', 'Marine Engineer', 'engineer');
        });
        
        // Execute the transaction
        transaction();
      }
      
      resolve();
    } catch (err) {
      console.error('Error seeding initial data:', err);
      reject(err);
    }
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
    try {
      // Create a prepared statement
      const stmt = db.prepare(sql);
      
      // Run the statement
      const result = stmt.run(...params);
      
      resolve({ 
        lastID: result.lastInsertRowid, 
        changes: result.changes 
      });
    } catch (err) {
      reject(err);
    }
  });
}

// Get a single row with promise support
function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      // Create a prepared statement
      const stmt = db.prepare(sql);
      
      // Get a single row
      const row = stmt.get(...params);
      
      resolve(row);
    } catch (err) {
      reject(err);
    }
  });
}

// Get multiple rows with promise support
function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      // Create a prepared statement
      const stmt = db.prepare(sql);
      
      // Get all rows
      const rows = stmt.all(...params);
      
      resolve(rows);
    } catch (err) {
      reject(err);
    }
  });
}

// Close the database connection
function closeDatabase() {
  return new Promise((resolve, reject) => {
    try {
      if (db) {
        db.close();
        db = null;
      }
      resolve();
    } catch (err) {
      console.error('Error closing database:', err);
      reject(err);
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