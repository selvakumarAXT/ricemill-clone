import { createAxiosInstance } from '../utils/apiUtils';

const productionService = {
  // Get all production records
  getAllProduction: async (branchId = '') => {
    try {
      const params = branchId ? { branch_id: branchId } : {};
      const response = await createAxiosInstance().get('/production', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to fetch production records';
    }
  },

  // Get single production record
  getProduction: async (productionId) => {
    try {
      const response = await createAxiosInstance().get(`/production/${productionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to fetch production record';
    }
  },

  // Create new production record
  createProduction: async (productionData) => {
    try {
      const response = await createAxiosInstance().post('/production', productionData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to create production record';
    }
  },

  // Update production record
  updateProduction: async (productionId, productionData) => {
    try {
      const response = await createAxiosInstance().put(`/production/${productionId}`, productionData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to update production record';
    }
  },

  // Delete production record
  deleteProduction: async (productionId) => {
    try {
      const response = await createAxiosInstance().delete(`/production/${productionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to delete production record';
    }
  },

  // Get production statistics
  getProductionStats: async (branchId = '') => {
    try {
      const params = branchId ? { branch_id: branchId } : {};
      const response = await createAxiosInstance().get('/production/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to fetch production statistics';
    }
  }
};

export default productionService; 