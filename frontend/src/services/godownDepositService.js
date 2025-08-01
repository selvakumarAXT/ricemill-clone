import { createAxiosInstance } from '../utils/apiUtils';

// Godown Deposit API service
const godownDepositService = {
  // Get all godown deposit records
  getAllGodownDeposits: async () => {
    try {
      const response = await createAxiosInstance().get('/godown-deposits');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single godown deposit record
  getGodownDepositById: async (id) => {
    try {
      const response = await createAxiosInstance().get(`/godown-deposits/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new godown deposit record
  createGodownDeposit: async (godownDepositData) => {
    try {
      const response = await createAxiosInstance().post('/godown-deposits', godownDepositData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update godown deposit record
  updateGodownDeposit: async (id, godownDepositData) => {
    try {
      const response = await createAxiosInstance().put(`/godown-deposits/${id}`, godownDepositData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete godown deposit record
  deleteGodownDeposit: async (id) => {
    try {
      const response = await createAxiosInstance().delete(`/godown-deposits/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get godown deposit statistics
  getGodownDepositStats: async () => {
    try {
      const response = await createAxiosInstance().get('/godown-deposits/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper function to format godown deposit data for frontend
  formatGodownDepositResponse: (godownDepositData) => {
    // Format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
      if (!date) return '';
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toISOString().split('T')[0];
    };

    return {
      ...godownDepositData,
      date: formatDateForInput(godownDepositData.date),
    };
  }
};

export default godownDepositService; 