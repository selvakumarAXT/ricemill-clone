import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL  }/api/auth`;

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

const authService = {
  login: async (userData) => {
    try {
      const response = await api.post('/login', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to send reset email';
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Profile update failed';
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.post('/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Password change failed';
    }
  },

  getMe: async () => {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to get user data';
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService;