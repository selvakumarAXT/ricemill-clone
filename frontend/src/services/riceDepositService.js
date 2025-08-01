import { createAxiosInstance } from '../utils/apiUtils';

// Rice Deposit API service
const riceDepositService = {
  // Get all rice deposit records
  getAllRiceDeposits: async () => {
    try {
      const response = await createAxiosInstance().get('/rice-deposits');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single rice deposit record
  getRiceDepositById: async (id) => {
    try {
      const response = await createAxiosInstance().get(`/rice-deposits/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new rice deposit record
  createRiceDeposit: async (riceDepositData) => {
    try {
      const response = await createAxiosInstance().post('/rice-deposits', riceDepositData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update rice deposit record
  updateRiceDeposit: async (id, riceDepositData) => {
    try {
      const response = await createAxiosInstance().put(`/rice-deposits/${id}`, riceDepositData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete rice deposit record
  deleteRiceDeposit: async (id) => {
    try {
      const response = await createAxiosInstance().delete(`/rice-deposits/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get rice deposit statistics
  getRiceDepositStats: async () => {
    try {
      const response = await createAxiosInstance().get('/rice-deposits/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper function to format rice deposit data for frontend
  formatRiceDepositResponse: (riceDepositData) => {
    return {
      ...riceDepositData,
      // Add any additional formatting if needed
    };
  }
};

export default riceDepositService; 