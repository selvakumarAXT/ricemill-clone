import axios from 'axios';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}`;

const api = axios.create({ baseURL: API_BASE, withCredentials: true });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const branchManagementService = {
  getAllUsers: async () => (await api.get('/users')).data,
  getAllCheckStacks: async () => (await api.get('/checkstacks')).data,
  getAllHolds: async () => (await api.get('/holds')).data,
  getAllDelivers: async () => (await api.get('/delivers')).data,
};

export default branchManagementService; 