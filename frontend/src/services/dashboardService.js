import { createAxiosInstance } from '../utils/apiUtils';

const BASE_URL = '/dashboard';

// Create axios instance for API calls
const api = createAxiosInstance();

export const dashboardService = {
  // Get comprehensive dashboard data
  getDashboardData: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/superadmin?${queryParams.toString()}` : `${BASE_URL}/superadmin`;
    const response = await api.get(url);
    return response.data;
  },

  // Get branch-specific dashboard data
  getBranchDashboard: async (branchId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/branch/${branchId}?${queryParams.toString()}` : `${BASE_URL}/branch/${branchId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Get sales analytics
  getSalesAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/sales?${queryParams.toString()}` : `${BASE_URL}/sales`;
    const response = await api.get(url);
    return response.data;
  },

  // Get purchase analytics
  getPurchaseAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/purchases?${queryParams.toString()}` : `${BASE_URL}/purchases`;
    const response = await api.get(url);
    return response.data;
  },

  // Get outstanding balances
  getOutstandingBalances: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/outstanding?${queryParams.toString()}` : `${BASE_URL}/outstanding`;
    const response = await api.get(url);
    return response.data;
  },

  // Get product analytics
  getProductAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/products?${queryParams.toString()}` : `${BASE_URL}/products`;
    const response = await api.get(url);
    return response.data;
  },

  // Get customer analytics
  getCustomerAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/customers?${queryParams.toString()}` : `${BASE_URL}/customers`;
    const response = await api.get(url);
    return response.data;
  },

  // Get vendor analytics
  getVendorAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/vendors?${queryParams.toString()}` : `${BASE_URL}/vendors`;
    const response = await api.get(url);
    return response.data;
  },

  // Get invoice analytics
  getInvoiceAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/invoices?${queryParams.toString()}` : `${BASE_URL}/invoices`;
    const response = await api.get(url);
    return response.data;
  },

  // Get geographical sales data
  getGeographicalSales: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/geographical?${queryParams.toString()}` : `${BASE_URL}/geographical`;
    const response = await api.get(url);
    return response.data;
  },

  // Get financial summary
  getFinancialSummary: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/financial?${queryParams.toString()}` : `${BASE_URL}/financial`;
    const response = await api.get(url);
    return response.data;
  },

  // Get inventory analytics
  getInventoryAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/inventory?${queryParams.toString()}` : `${BASE_URL}/inventory`;
    const response = await api.get(url);
    return response.data;
  },

  // Get production analytics
  getProductionAnalytics: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/production?${queryParams.toString()}` : `${BASE_URL}/production`;
    const response = await api.get(url);
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/activities?${queryParams.toString()}` : `${BASE_URL}/activities`;
    const response = await api.get(url);
    return response.data;
  },

  // Get system alerts
  getSystemAlerts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/alerts?${queryParams.toString()}` : `${BASE_URL}/alerts`;
    const response = await api.get(url);
    return response.data;
  },

  // Get dashboard widgets data
  getWidgetsData: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/widgets?${queryParams.toString()}` : `${BASE_URL}/widgets`;
    const response = await api.get(url);
    return response.data;
  },

  // Export dashboard data
  exportDashboardData: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/export?${queryParams.toString()}` : `${BASE_URL}/export`;
    const response = await api.get(url, { responseType: 'blob' });
    return response.data;
  },

  // Get dashboard settings
  getDashboardSettings: async () => {
    const response = await api.get(`${BASE_URL}/settings`);
    return response.data;
  },

  // Update dashboard settings
  updateDashboardSettings: async (settings) => {
    const response = await api.put(`${BASE_URL}/settings`, settings);
    return response.data;
  },

  // Get dashboard themes
  getDashboardThemes: async () => {
    const response = await api.get(`${BASE_URL}/themes`);
    return response.data;
  },

  // Get dashboard layout
  getDashboardLayout: async () => {
    const response = await api.get(`${BASE_URL}/layout`);
    return response.data;
  },

  // Update dashboard layout
  updateDashboardLayout: async (layout) => {
    const response = await api.put(`${BASE_URL}/layout`, layout);
    return response.data;
  },

  // Helper functions for data formatting
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  formatNumber: (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  },

  formatPercentage: (value) => {
    return `${value.toFixed(1)}%`;
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  },

  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-IN');
  },

  // Helper functions for chart data
  getChartColors: () => ({
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    light: '#F3F4F6',
    dark: '#1F2937'
  }),

  // Helper functions for status colors
  getStatusColor: (status) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'overdue':
      case 'warning':
        return 'text-orange-600 bg-orange-100';
      case 'cancelled':
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'inactive':
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  },

  // Helper functions for trend indicators
  getTrendIndicator: (value) => {
    if (value > 0) return { icon: '↗️', color: 'text-green-600', text: 'Up' };
    if (value < 0) return { icon: '↘️', color: 'text-red-600', text: 'Down' };
    return { icon: '→', color: 'text-gray-600', text: 'Stable' };
  },

  // Helper functions for data aggregation
  aggregateData: (data, groupBy, valueField) => {
    return data.reduce((acc, item) => {
      const key = item[groupBy];
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item[valueField] || 0;
      return acc;
    }, {});
  },

  // Helper functions for sorting
  sortByValue: (data, field, order = 'desc') => {
    return [...data].sort((a, b) => {
      const aVal = a[field] || 0;
      const bVal = b[field] || 0;
      return order === 'desc' ? bVal - aVal : aVal - bVal;
    });
  },

  // Helper functions for filtering
  filterByDateRange: (data, startDate, endDate, dateField = 'createdAt') => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return data.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= start && itemDate <= end;
    });
  }
};

export default dashboardService; 