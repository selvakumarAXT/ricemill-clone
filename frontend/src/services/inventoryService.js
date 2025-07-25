import axios from 'axios';

const API_URL = 'http://localhost:3001/api/inventory';

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
  // Get all inventory, optionally filtered by branchId (for superadmin)
  getAllInventory: async (branchId = '') => {
    try {
      const params = branchId ? { branchId } : {};
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Add other methods as needed (create, update, delete, etc.)
};

export default inventoryService; 