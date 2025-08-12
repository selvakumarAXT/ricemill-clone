import { createAxiosInstance } from '../utils/apiUtils';

// Get all paddy records with pagination and search
export const getAllPaddy = async (params = {}) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get('/paddy', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch paddy records' };
  }
};

// Get paddy by ID
export const getPaddyById = async (id) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get(`/paddy/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch paddy record' };
  }
};

// Test paddy API endpoint
export const testPaddyAPI = async () => {
  try {
    const axiosInstance = createAxiosInstance();
    console.log('Testing paddy API endpoint...');
    
    const response = await axiosInstance.post('/paddy/test', {
      test: 'data',
      message: 'Testing paddy creation'
    });
    
    console.log('Test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing paddy API:', error);
    throw error.response?.data || { message: 'Failed to test paddy API' };
  }
};

// Test simple endpoint without middleware
export const testSimplePaddyAPI = async () => {
  try {
    const axiosInstance = createAxiosInstance();
    console.log('Testing simple paddy API endpoint...');
    
    const response = await axiosInstance.post('/paddy/simple-test', {
      test: 'simple data',
      message: 'Testing simple endpoint'
    });
    
    console.log('Simple test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing simple paddy API:', error);
    throw error.response?.data || { message: 'Failed to test simple paddy API' };
  }
};

// Test paddy creation endpoint
export const testPaddyCreate = async () => {
  try {
    const axiosInstance = createAxiosInstance();
    console.log('Testing paddy creation endpoint...');
    
    const response = await axiosInstance.post('/paddy/test-create');
    
    console.log('Test create response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing paddy create:', error);
    throw error.response?.data || { message: 'Failed to test paddy create' };
  }
};

// Create new paddy record
export const createPaddy = async (paddyData, files = []) => {
  try {
    const axiosInstance = createAxiosInstance();
    
    console.log('Creating paddy with data:', paddyData);
    console.log('Files to upload:', files);
    
    if (files && files.length > 0) {
      // If files are provided, use FormData
      const formData = new FormData();
      
      console.log('Building FormData...');
      
      // Add all paddy data as individual fields
      Object.keys(paddyData).forEach(key => {
        if (key === 'gunny' || key === 'paddy') {
          // Handle nested objects
          Object.keys(paddyData[key]).forEach(nestedKey => {
            const fieldName = `${key}[${nestedKey}]`;
            const fieldValue = paddyData[key][nestedKey];
            console.log(`Adding field: ${fieldName} = ${fieldValue}`);
            formData.append(fieldName, fieldValue);
          });
        } else {
          console.log(`Adding field: ${key} = ${paddyData[key]}`);
          formData.append(key, paddyData[key]);
        }
      });
      
      // Add files
      files.forEach((file, index) => {
        console.log(`Adding file ${index}:`, file.name, file.size);
        formData.append('documents', file);
      });
      
      console.log('FormData built, sending request...');
      
      const response = await axiosInstance.post('/paddy', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // No files, send as regular JSON
      console.log('No files, sending as JSON...');
      const response = await axiosInstance.post('/paddy', paddyData);
      return response.data;
    }
  } catch (error) {
    console.error('Error in createPaddy service:', error);
    throw error.response?.data || { message: 'Failed to create paddy record' };
  }
};

// Update paddy record
export const updatePaddy = async (id, paddyData, files = []) => {
  try {
    const axiosInstance = createAxiosInstance();
    
    if (files && files.length > 0) {
      // If files are provided, use FormData
      const formData = new FormData();
      
      // Add all paddy data as individual fields
      Object.keys(paddyData).forEach(key => {
        if (key === 'gunny' || key === 'paddy') {
          // Handle nested objects
          Object.keys(paddyData[key]).forEach(nestedKey => {
            formData.append(`${key}[${nestedKey}]`, paddyData[key][nestedKey]);
          });
        } else {
          formData.append(key, paddyData[key]);
        }
      });
      
      // Add files
      files.forEach((file, index) => {
        formData.append('documents', file);
      });
      
      const response = await axiosInstance.put(`/paddy/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // No files, send as regular JSON
      const response = await axiosInstance.put(`/paddy/${id}`, paddyData);
      return response.data;
    }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update paddy record' };
  }
};

// Delete paddy record
export const deletePaddy = async (id) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.delete(`/paddy/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete paddy record' };
  }
};

// Get paddy statistics
export const getPaddyStats = async (params = {}) => {
  try {
    const axiosInstance = createAxiosInstance();
    const response = await axiosInstance.get('/paddy/stats', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch paddy statistics' };
  }
};

// Helper function to format paddy data for API
export const formatPaddyData = (formData) => {
  return {
    issueDate: formData.issueDate,
    issueMemo: formData.issueMemo,
    lorryNumber: formData.lorryNumber,
    paddyFrom: formData.paddyFrom,
    paddyVariety: formData.paddyVariety,
    moisture: parseFloat(formData.moisture) || 0,
    gunny: {
      nb: parseInt(formData.gunny?.nb) || 0,
      onb: parseInt(formData.gunny?.onb) || 0,
      ss: parseInt(formData.gunny?.ss) || 0,
      swp: parseInt(formData.gunny?.swp) || 0,
    },
    paddy: {
      bags: parseInt(formData.paddy?.bags) || 0,
      weight: parseFloat(formData.paddy?.weight) || 0,
    },
    createdBy: formData.createdBy,
    createdAt: formData.createdAt,
    updatedAt: formData.updatedAt,
    branch_id: formData.branch_id,
  };
};

// Helper function to format API response for frontend
export const formatPaddyResponse = (paddyData) => {
  // Format issueDate for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return dateObj.toISOString().split('T')[0];
  };

  return {
    id: paddyData._id,
    issueDate: formatDateForInput(paddyData.issueDate),
    issueMemo: paddyData.issueMemo,
    lorryNumber: paddyData.lorryNumber,
    paddyFrom: paddyData.paddyFrom,
    paddyVariety: paddyData.paddyVariety,
    moisture: paddyData.moisture || 0,
    gunny: {
      nb: paddyData.gunny?.nb || 0,
      onb: paddyData.gunny?.onb || 0,
      ss: paddyData.gunny?.ss || 0,
      swp: paddyData.gunny?.swp || 0,
    },
    paddy: {
      bags: paddyData.paddy?.bags || 0,
      weight: paddyData.paddy?.weight || 0,
    },
    createdBy: paddyData.createdBy,
    createdAt: paddyData.createdAt,
    updatedAt: paddyData.updatedAt,
    branch_id: paddyData.branch_id,
  };
}; 