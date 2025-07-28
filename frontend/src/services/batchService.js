import { createAxiosInstance } from '../utils/apiUtils';

const batchService = {
  // Get all batches for current branch
  getAllBatches: async (params = {}) => {
    try {
      const response = await createAxiosInstance().get('/batches', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get active batches for current branch
  getActiveBatches: async () => {
    try {
      const response = await createAxiosInstance().get('/batches/active');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get batch by ID
  getBatchById: async (id) => {
    try {
      const response = await createAxiosInstance().get(`/batches/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new batch
  createBatch: async (batchData) => {
    try {
      const response = await createAxiosInstance().post('/batches', batchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update batch
  updateBatch: async (id, batchData) => {
    try {
      const response = await createAxiosInstance().put(`/batches/${id}`, batchData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete batch
  deleteBatch: async (id) => {
    try {
      const response = await createAxiosInstance().delete(`/batches/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default batchService; 