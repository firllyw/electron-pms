// dataHelpers.js - Utility functions for database operations
import { ipcRenderer } from 'electron';

// These functions can be used in your React components to interface with the database
// through the IPC channel set up in preload.js and main.js

// Authentication helper
export const authenticateUser = async (username, password) => {
  try {
    const result = await window.api.authenticate({ username, password });
    return result;
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'An error occurred during authentication' };
  }
};

// Maintenance tasks helpers
export const getMaintenanceTasks = async (componentId = null) => {
  try {
    const tasks = await window.api.getMaintenanceTasks(componentId);
    return tasks;
  } catch (error) {
    console.error('Error fetching maintenance tasks:', error);
    return [];
  }
};

export const createMaintenanceTask = async (taskData) => {
  try {
    const result = await window.api.createMaintenanceTask(taskData);
    return result;
  } catch (error) {
    console.error('Error creating maintenance task:', error);
    return { success: false, message: 'Failed to create maintenance task' };
  }
};

export const updateMaintenanceTask = async (taskId, taskData) => {
  try {
    const result = await window.api.updateMaintenanceTask(taskId, taskData);
    return result;
  } catch (error) {
    console.error('Error updating maintenance task:', error);
    return { success: false, message: 'Failed to update maintenance task' };
  }
};

// Component helpers
export const getComponents = async (parentId = null) => {
  try {
    const components = await window.api.getComponents(parentId);
    return components;
  } catch (error) {
    console.error('Error fetching components:', error);
    return [];
  }
};

export const createComponent = async (componentData) => {
  try {
    const result = await window.api.createComponent(componentData);
    return result;
  } catch (error) {
    console.error('Error creating component:', error);
    return { success: false, message: 'Failed to create component' };
  }
};

// Inventory helpers
export const getInventoryItems = async () => {
  try {
    const items = await window.api.getInventoryItems();
    return items;
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return [];
  }
};

export const updateInventoryItem = async (itemId, itemData) => {
  try {
    const result = await window.api.updateInventoryItem(itemId, itemData);
    return result;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return { success: false, message: 'Failed to update inventory item' };
  }
};

// Purchase order helpers
export const getPurchaseOrders = async () => {
  try {
    const orders = await window.api.getPurchaseOrders();
    return orders;
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return [];
  }
};

export const createPurchaseOrder = async (orderData) => {
  try {
    const result = await window.api.createPurchaseOrder(orderData);
    return result;
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return { success: false, message: 'Failed to create purchase order' };
  }
};

// These functions can be imported in your React components
// For example: import { getMaintenanceTasks } from '../utils/dataHelpers';