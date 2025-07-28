import { createAxiosInstance } from '../utils/apiUtils';

const API_URL = 'http://localhost:3001/api/production';

const productionService = {
  // Get all production, optionally filtered by branch_id (for superadmin)
  getAllProduction: async (branch_id = '') => {
    try {
      const params = branch_id ? { branch_id } : {};
      const response = await createAxiosInstance().get('/production', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  // Add other methods as needed (create, update, delete, etc.)
};

export default productionService; 