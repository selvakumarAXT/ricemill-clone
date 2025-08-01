import { createAxiosInstance } from '../utils/apiUtils';

const API_URL = '/bag-weight-options';

// Get all bag weight options
export const getBagWeightOptions = async (branchId = null) => {
  try {
    console.log('🌐 Making API request to:', API_URL);
    console.log('🌐 Branch ID:', branchId);
    console.log('🌐 Full URL:', `${API_URL}?branch_id=${branchId}`);
    
    const params = {};
    if (branchId) {
      params.branch_id = branchId;
    }
    
    console.log('🌐 Request params:', params);
    console.log('🌐 Auth token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    const response = await createAxiosInstance().get(API_URL, { params });
    console.log('🌐 API response status:', response.status);
    console.log('🌐 API response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('🌐 API error:', error);
    console.error('🌐 Error response:', error.response);
    console.error('🌐 Error status:', error.response?.status);
    console.error('🌐 Error data:', error.response?.data);
    console.error('🌐 Error message:', error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch bag weight options');
  }
};

// Create new bag weight option
export const createBagWeightOption = async (bagWeightData) => {
  try {
    const response = await createAxiosInstance().post(API_URL, bagWeightData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create bag weight option');
  }
};

// Update bag weight option
export const updateBagWeightOption = async (id, bagWeightData) => {
  try {
    const response = await createAxiosInstance().put(`${API_URL}/${id}`, bagWeightData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update bag weight option');
  }
};

// Delete bag weight option
export const deleteBagWeightOption = async (id) => {
  try {
    const response = await createAxiosInstance().delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete bag weight option');
  }
};

// Set default bag weight option
export const setDefaultBagWeightOption = async (id) => {
  try {
    const response = await createAxiosInstance().patch(`${API_URL}/${id}/set-default`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to set default bag weight option');
  }
};

// Format bag weight options for CreatableSelect component
export const formatBagWeightOptions = (options) => {
  return options.map(option => ({
    value: option.weight.toString(),
    label: option.label,
    isDefault: option.isDefault,
    id: option._id
  }));
};

// Get default bag weight option
export const getDefaultBagWeightOption = (options) => {
  return options.find(option => option.isDefault) || options[0] || { value: '50', label: '50 kg' };
}; 