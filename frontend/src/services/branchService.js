import axios from 'axios';

const API_URL = 'http://localhost:3001/api/branches';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Ensure credentials (cookies, etc.) are sent with requests
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const branchService = {
  // Get all branches (super admin only)
  getAllBranches: async () => {
    try {
      const response = await api.get('/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user's branch
  getMyBranch: async () => {
    try {
      const response = await api.get('/my-branch');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single branch
  getBranch: async (branchId) => {
    try {
      const response = await api.get(`/${branchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new branch (super admin only)
  createBranch: async (branchData) => {
    try {
      const response = await api.post('/', branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update branch (super admin only)
  updateBranch: async (branchId, branchData) => {
    try {
      const response = await api.put(`/${branchId}`, branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete branch (super admin only)
  deleteBranch: async (branchId) => {
    try {
      const response = await api.delete(`/${branchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default branchService; 