import { createAxiosInstance } from '../utils/apiUtils';

const financialService = {
  // Get all financial transactions
  getAllTransactions: async (branchId = null) => {
    try {
      const api = createAxiosInstance();
      const params = branchId ? { branch_id: branchId } : {};
      const response = await api.get('/financial-transactions', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },

  // Create a new transaction
  createTransaction: async (transactionData) => {
    try {
      const api = createAxiosInstance();
      const response = await api.post('/financial-transactions', transactionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create transaction');
    }
  },

  // Update an existing transaction
  updateTransaction: async (transactionId, transactionData) => {
    try {
      const api = createAxiosInstance();
      const response = await api.put(`/financial-transactions/${transactionId}`, transactionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update transaction');
    }
  },

  // Delete a transaction
  deleteTransaction: async (transactionId) => {
    try {
      const api = createAxiosInstance();
      const response = await api.delete(`/financial-transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete transaction');
    }
  },

  // Get financial summary/statistics
  getFinancialSummary: async (branchId = null) => {
    try {
      const api = createAxiosInstance();
      const params = branchId ? { branch_id: branchId } : {};
      const response = await api.get('/financial-summary', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch financial summary');
    }
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (startDate, endDate, branchId = null) => {
    try {
      const api = createAxiosInstance();
      const params = {
        startDate,
        endDate,
        ...(branchId && { branch_id: branchId })
      };
      const response = await api.get('/financial-transactions/date-range/transactions', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions by date range');
    }
  },

  // Get transactions by category
  getTransactionsByCategory: async (category, branchId = null) => {
    try {
      const api = createAxiosInstance();
      const params = {
        ...(branchId && { branch_id: branchId })
      };
      const response = await api.get(`/financial-transactions/category/${category}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions by category');
    }
  }
};

export default financialService; 