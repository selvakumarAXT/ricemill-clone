import apiUtils from '../utils/apiUtils';

const BASE_URL = '/byproducts';

// Get all byproduct sales with pagination and filters
export const getAllByproductSales = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.search) queryParams.append('search', params.search);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (params.branch_id) queryParams.append('branch_id', params.branch_id);
    if (params.material) queryParams.append('material', params.material);
    if (params.vendor) queryParams.append('vendor', params.vendor);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);

    const url = `${BASE_URL}?${queryParams.toString()}`;
    const response = await apiUtils.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching byproduct sales:', error);
    throw error;
  }
};

// Get single byproduct sale by ID
export const getByproductSaleById = async (id) => {
  try {
    const response = await apiUtils.get(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching byproduct sale:', error);
    throw error;
  }
};

// Create new byproduct sale
export const createByproductSale = async (byproductData) => {
  try {
    const formData = new FormData();
    
    // Add basic fields
    Object.keys(byproductData).forEach(key => {
      if (key !== 'documents' && byproductData[key] !== undefined && byproductData[key] !== null) {
        formData.append(key, byproductData[key]);
      }
    });
    
    // Add documents if any
    if (byproductData.documents && byproductData.documents.length > 0) {
      byproductData.documents.forEach(file => {
        formData.append('documents', file);
      });
    }
    
    const response = await apiUtils.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating byproduct sale:', error);
    throw error;
  }
};

// Update existing byproduct sale
export const updateByproductSale = async (id, byproductData) => {
  try {
    const formData = new FormData();
    
    // Add basic fields
    Object.keys(byproductData).forEach(key => {
      if (key !== 'documents' && byproductData[key] !== undefined && byproductData[key] !== null) {
        formData.append(key, byproductData[key]);
      }
    });
    
    // Add documents if any
    if (byproductData.documents && byproductData.documents.length > 0) {
      byproductData.documents.forEach(file => {
        formData.append('documents', file);
      });
    }
    
    const response = await apiUtils.put(`${BASE_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating byproduct sale:', error);
    throw error;
  }
};

// Delete byproduct sale
export const deleteByproductSale = async (id) => {
  try {
    const response = await apiUtils.delete(`${BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting byproduct sale:', error);
    throw error;
  }
};

// Get byproduct sales statistics
export const getByproductStats = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `${BASE_URL}/stats?${queryParams.toString()}`;
    const response = await apiUtils.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching byproduct stats:', error);
    throw error;
  }
};

// Health check for byproducts API
export const checkByproductsAPIHealth = async () => {
  try {
    const response = await apiUtils.get(`${BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Error checking byproducts API health:', error);
    throw error;
  }
};

// Format byproduct data for display
export const formatByproductData = (byproduct) => {
  return {
    ...byproduct,
    formattedDate: new Date(byproduct.date).toLocaleDateString('en-IN'),
    formattedTotalAmount: new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(byproduct.totalAmount),
    formattedWeight: `${byproduct.weight} ${byproduct.unit}`,
    formattedRate: `₹${byproduct.rate}`
  };
};

// Format byproduct response data
export const formatByproductResponse = (response) => {
  if (response.data && Array.isArray(response.data)) {
    return {
      ...response,
      data: response.data.map(formatByproductData)
    };
  }
  return response;
};

// Mock data for development/testing
export const getMockByproductSales = () => [
  {
    _id: '1',
    date: '2024-01-15',
    vehicleNumber: 'TN-20-BU-4006',
    material: 'Husk',
    weight: 5000,
    unit: 'kg',
    rate: 2.5,
    totalAmount: 12500,
    vendorName: 'ABC Traders',
    vendorPhone: '+91 9876543210',
    vendorEmail: 'abc@example.com',
    vendorAddress: '123 Main St, Chennai',
    vendorGstin: '33AAAAA0000A1Z5',
    vendorPan: 'ABCD1234EFGH',
    paymentMethod: 'Cash',
    paymentStatus: 'Completed',
    notes: 'Monthly husk supply',
    branch_id: 'branch1',
    createdBy: 'user1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: '2',
    date: '2024-01-16',
    vehicleNumber: 'TN-21-CD-5678',
    material: 'Broken Rice',
    weight: 2000,
    unit: 'kg',
    rate: 35,
    totalAmount: 70000,
    vendorName: 'XYZ Foods',
    vendorPhone: '+91 8765432109',
    vendorEmail: 'xyz@example.com',
    vendorAddress: '456 Market Rd, Madurai',
    vendorGstin: '33BBBBB0000B2Z6',
    vendorPan: 'EFGH5678IJKL',
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Pending',
    notes: 'Premium broken rice for animal feed',
    branch_id: 'branch1',
    createdBy: 'user1',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z'
  }
];

export default {
  getAllByproductSales,
  getByproductSaleById,
  createByproductSale,
  updateByproductSale,
  deleteByproductSale,
  getByproductStats,
  checkByproductsAPIHealth,
  formatByproductData,
  formatByproductResponse,
  getMockByproductSales
};
