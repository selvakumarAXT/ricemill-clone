import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

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

const dashboardService = {
  // Get comprehensive dashboard stats for superadmin
  getSuperadminDashboard: async () => {
    try {
      const response = await api.get('/dashboard/superadmin');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get branch-specific dashboard stats
  getBranchDashboard: async (branchId) => {
    try {
      const response = await api.get(`/dashboard/branch/${branchId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get real-time activity feed
  getActivityFeed: async (limit = 10) => {
    try {
      const response = await api.get(`/dashboard/activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get production efficiency metrics
  getEfficiencyMetrics: async (period = 'month') => {
    try {
      const response = await api.get(`/dashboard/efficiency?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get financial overview
  getFinancialOverview: async (period = 'month') => {
    try {
      const response = await api.get(`/dashboard/financial?period=${period}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get inventory alerts
  getInventoryAlerts: async () => {
    try {
      const response = await api.get('/dashboard/alerts/inventory');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get quality metrics
  getQualityMetrics: async () => {
    try {
      const response = await api.get('/dashboard/quality');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default dashboardService; 