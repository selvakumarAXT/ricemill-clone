import { createAxiosInstance } from '../utils/apiUtils';

// Gunny API service
const gunnyService = {
  // Get all gunny records
  getAllGunny: async () => {
    try {
      const response = await createAxiosInstance().get('/gunny');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single gunny record
  getGunnyById: async (id) => {
    try {
      const response = await createAxiosInstance().get(`/gunny/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new gunny record
  createGunny: async (gunnyData) => {
    try {
      const response = await createAxiosInstance().post('/gunny', gunnyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update gunny record
  updateGunny: async (id, gunnyData) => {
    try {
      const response = await createAxiosInstance().put(`/gunny/${id}`, gunnyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete gunny record
  deleteGunny: async (id) => {
    try {
      const response = await createAxiosInstance().delete(`/gunny/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get gunny statistics
  getGunnyStats: async () => {
    try {
      const response = await createAxiosInstance().get('/gunny/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper function to format gunny data for frontend
  formatGunnyResponse: (gunnyData) => {
    // Format issueDate for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
      if (!date) return '';
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toISOString().split('T')[0];
    };

    return {
      ...gunnyData,
      issueDate: formatDateForInput(gunnyData.issueDate),
    };
  }
};

export default gunnyService; 