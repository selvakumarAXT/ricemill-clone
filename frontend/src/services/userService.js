import { createAxiosInstance } from '../utils/apiUtils';

const API_URL = `${import.meta.env.VITE_API_URL  }/api/users`;

const userService = {
  // Get all users, optionally filtered by branch_id (for superadmin)
  getAllUsers: async (branch_id = '') => {
    try {
      const params = branch_id ? { branch_id } : {};
      const response = await createAxiosInstance().get('/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single user
  getUser: async (userId) => {
    const response = await createAxiosInstance().get(`/users/${userId}`);
    return response;
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    const response = await createAxiosInstance().post('/users', userData);
    return response;
  },

  // Update user (admin only)
  updateUser: async (userId, userData) => {
    const response = await createAxiosInstance().put(`/users/${userId}`, userData);
    return response;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await createAxiosInstance().delete(`/users/${userId}`);
    return response;
  },
};

export default userService; 