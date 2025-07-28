import axios from 'axios';
import { getCurrentBranchId, getBranchIdFromStorage } from './branchUtils';

const API_URL = 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

  // Create axios instance with auth header
export const createAxiosInstance = () => {
  const token = getAuthToken();
  
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });

  return instance;

  return instance;
};

  // Create axios instance without branchId (for specific cases where you don't want branchId)
export const createAxiosInstanceWithoutBatch = () => {
  const token = getAuthToken();
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}; 