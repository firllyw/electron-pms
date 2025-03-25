const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
console.log('====== PRELOAD.JS IS RUNNING ======');
contextBridge.exposeInMainWorld(
  'api', {
    // Authentication
    auth: {
      authenticate: (credentials) => ipcRenderer.invoke('authenticate', credentials)
    },
    
    // Component operations
    components: {
      getAll: (filters) => ipcRenderer.invoke('getComponents', filters),
      getTree: () => ipcRenderer.invoke('getComponentTree'),
      getDetails: (id) => ipcRenderer.invoke('getComponentDetails', id),
      create: (data) => ipcRenderer.invoke('createComponent', data),
      update: (id, data) => ipcRenderer.invoke('updateComponent', id, data),
      delete: (id) => ipcRenderer.invoke('deleteComponent', id),
      
      // SFI operations
      getSfiGroups: () => ipcRenderer.invoke('getSfiGroups'),
      importSfiGroups: () => ipcRenderer.invoke('importSfiGroups')
    },
    
    // Maintenance tasks operations
    maintenance: {
      getTasks: (filters) => ipcRenderer.invoke('getMaintenanceTasks', filters),
      create: (data) => ipcRenderer.invoke('createMaintenanceTask', data),
      update: (id, data) => ipcRenderer.invoke('updateMaintenanceTask', id, data),
      delete: (id) => ipcRenderer.invoke('deleteMaintenanceTask', id),
      complete: (id, data) => ipcRenderer.invoke('completeMaintenanceTask', id, data),
      getHistory: (filters) => ipcRenderer.invoke('getMaintenanceHistory', filters)
    },
    
    // Inventory operations
    inventory: {
      getAll: () => ipcRenderer.invoke('getInventoryItems'),
      create: (data) => ipcRenderer.invoke('createInventoryItem', data),
      update: (id, data) => ipcRenderer.invoke('updateInventoryItem', id, data),
      delete: (id) => ipcRenderer.invoke('deleteInventoryItem', id)
    },
    
    // Purchase operations
    purchases: {
      getAll: () => ipcRenderer.invoke('getPurchaseOrders'),
      create: (data) => ipcRenderer.invoke('createPurchaseOrder', data),
      update: (id, data) => ipcRenderer.invoke('updatePurchaseOrder', id, data),
      delete: (id) => ipcRenderer.invoke('deletePurchaseOrder', id)
    },
    
    // User operations
    users: {
      getAll: () => ipcRenderer.invoke('getUsers'),
      create: (data) => ipcRenderer.invoke('createUser', data),
      update: (id, data) => ipcRenderer.invoke('updateUser', id, data),
      delete: (id) => ipcRenderer.invoke('deleteUser', id)
    },

    crewing: {
      getAll: () => ipcRenderer.invoke('getCrewMembers'),
      create: (data) => ipcRenderer.invoke('createCrewMember', data),
      update: (id, data) => ipcRenderer.invoke('updateCrewMember', id, data),
      delete: (id) => ipcRenderer.invoke('deleteCrewMember', id),
      getDocuments: (id) => ipcRenderer.invoke('getCrewMemberDocuments', id),
      addDocument: (id, data) => ipcRenderer.invoke('addCrewMemberDocument', id, data),
    },
    
    // Application information
    app: {
      getVersion: () => ipcRenderer.invoke('getAppVersion'),
      getDatabaseInfo: () => ipcRenderer.invoke('getDatabaseInfo')
    }
  }
);