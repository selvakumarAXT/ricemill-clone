import { createAxiosInstance } from '../utils/apiUtils';

const qcService = {
  // Get all QC records
  getAllQC: async (branch_id = '') => {
    try {
      const params = branch_id ? { branch_id } : {};
      const response = await createAxiosInstance().get('/qc', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single QC record
  getQCById: async (id) => {
    try {
      const response = await createAxiosInstance().get(`/qc/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new QC record
  createQC: async (qcData, files = []) => {
    try {
      const formData = new FormData();
      
      // Add QC data
      Object.keys(qcData).forEach(key => {
        if (qcData[key] !== null && qcData[key] !== undefined) {
          formData.append(key, qcData[key]);
        }
      });
      
      // Add files
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('documents', file);
        });
      }
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await createAxiosInstance().post('/qc', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw error;
      }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update QC record
  updateQC: async (id, qcData, files = []) => {
    try {
      const formData = new FormData();
      
      // Add QC data
      Object.keys(qcData).forEach(key => {
        if (qcData[key] !== null && qcData[key] !== undefined) {
          formData.append(key, qcData[key]);
        }
      });
      
      // Add files
      if (files && files.length > 0) {
        files.forEach(file => {
          formData.append('documents', file);
        });
      }
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      try {
        const response = await createAxiosInstance().put(`/qc/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.data;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. Please try again.');
        }
        throw error;
      }
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete QC record
  deleteQC: async (id) => {
    try {
      const response = await createAxiosInstance().delete(`/qc/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get QC statistics
  getQCStats: async (branch_id = '') => {
    try {
      const params = branch_id ? { branch_id } : {};
      const response = await createAxiosInstance().get('/qc/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Helper function to format QC data for frontend
  formatQCResponse: (qcData) => {
    // Format sampleDate for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
      if (!date) return '';
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      return dateObj.toISOString().split('T')[0];
    };

    return {
      ...qcData,
      sampleDate: formatDateForInput(qcData.sampleDate),
    };
  }
};

export default qcService;

