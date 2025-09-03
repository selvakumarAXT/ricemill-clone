import axios from 'axios';
import { getCurrentBranchId,  } from './branchUtils';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}`;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth header and automatic branch_id injection
export const createAxiosInstance = () => {
  const token = getAuthToken();
  
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  // Add request interceptor to automatically include branch_id
  instance.interceptors.request.use(
    (config) => {
      const currentBranchId = getCurrentBranchId();
      
      // Add branch_id for all cases (including 'all' for superadmin)
      // But exclude DELETE requests as they handle branch_id logic in the backend
      if (currentBranchId && config.method !== 'delete') {
        // For GET requests, add to query parameters
        if (config.method === 'get' && config.params) {
          config.params.branch_id = currentBranchId;
        } else if (config.method === 'get') {
          config.params = { branch_id: currentBranchId };
        }
        
        // For POST/PUT requests, add to request body if it exists
        if ((config.method === 'post' || config.method === 'put') && config.data) {
          config.data.branch_id = currentBranchId;
        }
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create axios instance without branch_id (for specific cases where you don't want branch_id)
export const createAxiosInstanceWithoutBranch = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}; 