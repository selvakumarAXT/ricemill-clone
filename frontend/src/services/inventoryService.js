import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL  }/api/inventory`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const inventoryService = {
  // Get all inventory, optionally filtered by branch_id (for superadmin)
  getAllInventory: async (branch_id = '') => {
    try {
      const params = branch_id ? { branch_id } : {};
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single inventory record
  getInventoryById: async (id) => {
    try {
      const response = await api.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new inventory record
  createInventory: async (inventoryData) => {
    try {
      const response = await api.post('/', inventoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update inventory record
  updateInventory: async (id, inventoryData) => {
    try {
      const response = await api.put(`/${id}`, inventoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete inventory record
  deleteInventory: async (id) => {
    try {
      const response = await api.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get inventory statistics
  getInventoryStats: async (branch_id = '') => {
    try {
      const params = branch_id ? { branch_id } : {};
      const response = await api.get('/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default inventoryService; 