import { createAxiosInstance } from '../utils/apiUtils';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/branches`;

const branchService = {
  // Get all branches (super admin only)
  getAllBranches: async () => {
    try {
      const response = await createAxiosInstance().get('/branches');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get current user's branch
  getMyBranch: async () => {
    try {
      const response = await createAxiosInstance().get('/branches/my-branch');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single branch
  getBranch: async (branchId) => {
    try {
      const response = await createAxiosInstance().get(`/branches/${branchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new branch (super admin only)
  createBranch: async (branchData) => {
    try {
      const response = await createAxiosInstance().post('/branches', branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update branch (super admin only)
  updateBranch: async (branchId, branchData) => {
    try {
      const response = await createAxiosInstance().put(`/branches/${branchId}`, branchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete branch (super admin only)
  deleteBranch: async (branchId) => {
    try {
      const response = await createAxiosInstance().delete(`/branches/${branchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default branchService; 