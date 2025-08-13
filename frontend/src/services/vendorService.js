import { createAxiosInstance } from '../utils/apiUtils';

const BASE_URL = '/vendors';

// Create axios instance for API calls
const api = createAxiosInstance();

export const vendorService = {
  // Get all vendors with filtering and pagination
  getAllVendors: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}?${queryParams.toString()}` : BASE_URL;
    const response = await api.get(url);
    return response.data;
  },

  // Get single vendor
  getVendor: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new vendor
  createVendor: async (vendorData, files = []) => {
    try {
      if (files && files.length > 0) {
        // If files are provided, use FormData
        const formData = new FormData();
        
        // Add all vendor data as individual fields
        Object.keys(vendorData).forEach(key => {
          if (vendorData[key] !== undefined && vendorData[key] !== null) {
            formData.append(key, vendorData[key]);
          }
        });
        
        // Add files
        files.forEach((file, index) => {
          formData.append('documents', file);
        });
        
        const response = await api.post(BASE_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // No files, send as regular JSON
        const response = await api.post(BASE_URL, vendorData);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create vendor' };
    }
  },

  // Update vendor
  updateVendor: async (id, vendorData, files = []) => {
    try {
      if (files && files.length > 0) {
        // If files are provided, use FormData
        const formData = new FormData();
        
        // Add all vendor data as individual fields
        Object.keys(vendorData).forEach(key => {
          if (vendorData[key] !== undefined && vendorData[key] !== null) {
            formData.append(key, vendorData[key]);
          }
        });
        
        // Add files
        files.forEach((file, index) => {
          formData.append('documents', file);
        });
        
        const response = await api.put(`${BASE_URL}/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } else {
        // No files, send as regular JSON
        const response = await api.put(`${BASE_URL}/${id}`, vendorData);
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update vendor' };
    }
  },

  // Delete vendor
  deleteVendor: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Get vendor financial summary
  getVendorFinancial: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/financial`);
    return response.data;
  },

  // Update vendor financial status
  updateVendorFinancial: async (id, financialData) => {
    const response = await api.put(`${BASE_URL}/${id}/financial`, financialData);
    return response.data;
  },

  // Get vendor statistics
  getVendorStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/stats/overview?${queryParams.toString()}` : `${BASE_URL}/stats/overview`;
    const response = await api.get(url);
    return response.data;
  },

  // Get vendor options for dropdowns
  getVendorOptions: () => [
    { value: 'supplier', label: 'Supplier' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'service_provider', label: 'Service Provider' },
    { value: 'other', label: 'Other' }
  ],

  // Get payment terms options
  getPaymentTermsOptions: () => [
    { value: 'immediate', label: 'Immediate' },
    { value: '7_days', label: '7 Days' },
    { value: '15_days', label: '15 Days' },
    { value: '30_days', label: '30 Days' },
    { value: '45_days', label: '45 Days' },
    { value: '60_days', label: '60 Days' }
  ],

  // Get status options
  getStatusOptions: () => [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ],

  // Get payment status options
  getPaymentStatusOptions: () => [
    { value: 'paid', label: 'Paid' },
    { value: 'due', label: 'Due' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'critical', label: 'Critical' }
  ],

  // Get rating options
  getRatingOptions: () => [
    { value: 1, label: '1 - Poor' },
    { value: 2, label: '2 - Fair' },
    { value: 3, label: '3 - Good' },
    { value: 4, label: '4 - Very Good' },
    { value: 5, label: '5 - Excellent' }
  ],

  // Format vendor data for API
  formatVendorData: (formData) => {
    return {
      vendorCode: formData.vendorCode,
      vendorName: formData.vendorName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      gstNumber: formData.gstNumber,
      panNumber: formData.panNumber,
      vendorType: formData.vendorType,
      creditLimit: parseFloat(formData.creditLimit) || 0,
      paymentTerms: formData.paymentTerms,
      rating: parseInt(formData.rating) || 5,
      status: formData.status,
      remarks: formData.remarks
    };
  },

  // Format API response for frontend
  formatVendorResponse: (vendorData) => {
    return {
      id: vendorData._id,
      vendorCode: vendorData.vendorCode,
      vendorName: vendorData.vendorName,
      contactPerson: vendorData.contactPerson,
      phone: vendorData.phone,
      email: vendorData.email,
      address: vendorData.address,
      city: vendorData.city,
      state: vendorData.state,
      pincode: vendorData.pincode,
      gstNumber: vendorData.gstNumber,
      panNumber: vendorData.panNumber,
      vendorType: vendorData.vendorType,
      creditLimit: vendorData.creditLimit || 0,
      paymentTerms: vendorData.paymentTerms,
      rating: vendorData.rating || 5,
      status: vendorData.status,
      remarks: vendorData.remarks,
      totalOrders: vendorData.totalOrders || 0,
      totalAmount: vendorData.totalAmount || 0,
      totalPaid: vendorData.totalPaid || 0,
      totalDue: vendorData.totalDue || 0,
      outstandingBalance: vendorData.outstandingBalance || 0,
      lastOrderDate: vendorData.lastOrderDate,
      lastPaymentDate: vendorData.lastPaymentDate,
      documents: vendorData.documents || [],
      branch_id: vendorData.branch_id,
      createdBy: vendorData.createdBy,
      createdAt: vendorData.createdAt,
      updatedAt: vendorData.updatedAt
    };
  },

  // Calculate payment status
  getPaymentStatus: (vendor) => {
    if (vendor.outstandingBalance === 0) return 'paid';
    if (vendor.outstandingBalance <= vendor.creditLimit * 0.5) return 'good';
    if (vendor.outstandingBalance <= vendor.creditLimit * 0.8) return 'warning';
    return 'critical';
  },

  // Get payment status color
  getPaymentStatusColor: (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  // Get payment status label
  getPaymentStatusLabel: (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'good': return 'Good';
      case 'warning': return 'Warning';
      case 'critical': return 'Critical';
      default: return 'Unknown';
    }
  },

  // Format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format date
  formatDate: (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  }
};

export default vendorService;
