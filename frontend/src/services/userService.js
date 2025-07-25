import axios from 'axios';

const API_URL = 'http://localhost:3001/api/users';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Ensure credentials (cookies, etc.) are sent with requests
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const userService = {
  // Get all users, optionally filtered by branchId (for superadmin)
  getAllUsers: async (branchId = '') => {
    try {
      const params = branchId ? { branchId } : {};
      const response = await api.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single user
  getUser: async (userId) => {
    const response = await api.get(`/${userId}`);
    return response;
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    const response = await api.post('/', userData);
    return response;
  },

  // Update user (admin only)
  updateUser: async (userId, userData) => {
    const response = await api.put(`/${userId}`, userData);
    return response;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/${userId}`);
    return response;
  },
};

export default userService; 