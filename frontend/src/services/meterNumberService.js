import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/meter-numbers`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const meterNumberService = {
  // Get all meter numbers with filtering
  getMeterNumbers: async (params = {}) => {
    try {
      const response = await api.get('/meter-numbers', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching meter numbers:', error);
      throw error;
    }
  },

  // Get active meter numbers for dropdown
  getActiveMeterNumbers: async (branchId = null) => {
    try {
      const params = branchId ? { branch_id: branchId } : {};
      const response = await api.get('/meter-numbers/active', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching active meter numbers:', error);
      throw error;
    }
  },

  // Get meter number by ID
  getMeterNumberById: async (id) => {
    try {
      const response = await api.get(`/meter-numbers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching meter number:', error);
      throw error;
    }
  },

  // Create new meter number
  createMeterNumber: async (meterNumberData) => {
    try {
      const response = await api.post('/meter-numbers', meterNumberData);
      return response.data;
    } catch (error) {
      console.error('Error creating meter number:', error);
      throw error;
    }
  },

  // Update meter number
  updateMeterNumber: async (id, meterNumberData) => {
    try {
      const response = await api.put(`/meter-numbers/${id}`, meterNumberData);
      return response.data;
    } catch (error) {
      console.error('Error updating meter number:', error);
      throw error;
    }
  },

  // Delete meter number
  deleteMeterNumber: async (id) => {
    try {
      const response = await api.delete(`/meter-numbers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting meter number:', error);
      throw error;
    }
  }
};
