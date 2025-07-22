import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  // Login user
  login: async (userData) => {
    const response = await api.post('/login', userData);
    return response;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response;
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.post('/change-password', passwordData);
    return response;
  },

  // Get current user
  getMe: async () => {
    const response = await api.get('/me');
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService; 