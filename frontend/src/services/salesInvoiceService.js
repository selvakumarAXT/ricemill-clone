import { createAxiosInstance } from '../utils/apiUtils';

const BASE_URL = '/sales-invoices';

// Create axios instance for API calls
const api = createAxiosInstance();

export const salesInvoiceService = {
  // Get all sales invoices with filtering and pagination
  getSalesInvoices: async (params = {}) => {
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

  // Get single sales invoice
  getSalesInvoice: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create new sales invoice
  createSalesInvoice: async (invoiceData) => {
    const response = await api.post(BASE_URL, invoiceData);
    return response.data;
  },

  // Update sales invoice
  updateSalesInvoice: async (id, invoiceData) => {
    const response = await api.put(`${BASE_URL}/${id}`, invoiceData);
    return response.data;
  },

  // Delete sales invoice
  deleteSalesInvoice: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Generate invoice number
  generateInvoiceNumber: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/generate-number?${queryParams.toString()}` : `${BASE_URL}/generate-number`;
    const response = await api.get(url);
    return response.data;
  },

  // Print sales invoice
  printSalesInvoice: async (id, format = 'pdf') => {
    const response = await api.get(`${BASE_URL}/${id}/print?format=${format}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Send invoice via email
  sendInvoiceEmail: async (id, emailData) => {
    const response = await api.post(`${BASE_URL}/${id}/send-email`, emailData);
    return response.data;
  },

  // Get invoice statistics
  getInvoiceStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `${BASE_URL}/stats?${queryParams.toString()}` : `${BASE_URL}/stats`;
    const response = await api.get(url);
    return response.data;
  },

  // Get customers for invoice
  getCustomers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `/customers?${queryParams.toString()}` : '/customers';
    const response = await api.get(url);
    return response.data;
  },

  // Get products for invoice
  getProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = queryParams.toString() ? `/products?${queryParams.toString()}` : '/products';
    const response = await api.get(url);
    return response.data;
  },

  // Calculate invoice totals
  calculateTotals: async (items) => {
    const response = await api.post(`${BASE_URL}/calculate-totals`, { items });
    return response.data;
  },

  // Validate invoice data
  validateInvoice: async (invoiceData) => {
    const response = await api.post(`${BASE_URL}/validate`, invoiceData);
    return response.data;
  },

  // Get invoice templates
  getInvoiceTemplates: async () => {
    const response = await api.get(`${BASE_URL}/templates`);
    return response.data;
  },

  // Save invoice as template
  saveAsTemplate: async (id, templateData) => {
    const response = await api.post(`${BASE_URL}/${id}/save-template`, templateData);
    return response.data;
  },

  // Duplicate invoice
  duplicateInvoice: async (id) => {
    const response = await api.post(`${BASE_URL}/${id}/duplicate`);
    return response.data;
  },

  // Get invoice history
  getInvoiceHistory: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/history`);
    return response.data;
  },

  // Approve invoice
  approveInvoice: async (id, approvalData) => {
    const response = await api.post(`${BASE_URL}/${id}/approve`, approvalData);
    return response.data;
  },

  // Reject invoice
  rejectInvoice: async (id, rejectionData) => {
    const response = await api.post(`${BASE_URL}/${id}/reject`, rejectionData);
    return response.data;
  },

  // Mark invoice as paid
  markAsPaid: async (id, paymentData) => {
    const response = await api.post(`${BASE_URL}/${id}/mark-paid`, paymentData);
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await api.get(`${BASE_URL}/payment-methods`);
    return response.data;
  },

  // Get delivery modes
  getDeliveryModes: async () => {
    const response = await api.get(`${BASE_URL}/delivery-modes`);
    return response.data;
  },

  // Get invoice types
  getInvoiceTypes: async () => {
    const response = await api.get(`${BASE_URL}/invoice-types`);
    return response.data;
  },

  // Helper functions for data formatting
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  formatNumber: (number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  },

  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-IN');
  },

  // Helper function to convert number to words
  numberToWords: (num) => {
    const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
    const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

    if (num === 0) return 'ZERO RUPEES ONLY';
    if (num < 10) return ones[num] + ' RUPEES ONLY';
    if (num < 20) return teens[num - 10] + ' RUPEES ONLY';
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '') + ' RUPEES ONLY';
    if (num < 1000) return ones[Math.floor(num / 100)] + ' HUNDRED' + (num % 100 ? ' AND ' + salesInvoiceService.numberToWords(num % 100) : ' RUPEES ONLY');
    if (num < 100000) return salesInvoiceService.numberToWords(Math.floor(num / 1000)) + ' THOUSAND' + (num % 1000 ? ' ' + salesInvoiceService.numberToWords(num % 1000) : ' RUPEES ONLY');
    if (num < 10000000) return salesInvoiceService.numberToWords(Math.floor(num / 100000)) + ' LAKH' + (num % 100000 ? ' ' + salesInvoiceService.numberToWords(num % 100000) : ' RUPEES ONLY');
    return salesInvoiceService.numberToWords(Math.floor(num / 10000000)) + ' CRORE' + (num % 10000000 ? ' ' + salesInvoiceService.numberToWords(num % 10000000) : ' RUPEES ONLY');
  },

  // Helper function to calculate GST
  calculateGST: (amount, gstRate) => {
    return (amount * gstRate) / 100;
  },

  // Helper function to calculate total with GST
  calculateTotalWithGST: (amount, gstRate) => {
    const gst = salesInvoiceService.calculateGST(amount, gstRate);
    return amount + gst;
  },

  // Helper function to validate GSTIN
  validateGSTIN: (gstin) => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  },

  // Helper function to validate PAN
  validatePAN: (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  },

  // Helper function to get invoice status color
  getStatusColor: (status) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'paid':
        return 'text-blue-600 bg-blue-100';
      case 'overdue':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  },

  // Helper function to get payment type options
  getPaymentTypeOptions: () => [
    { value: 'CREDIT', label: 'Credit' },
    { value: 'CASH', label: 'Cash' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'ONLINE', label: 'Online' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'UPI', label: 'UPI' }
  ],

  // Helper function to get delivery mode options
  getDeliveryModeOptions: () => [
    { value: 'road', label: 'Road' },
    { value: 'rail', label: 'Rail' },
    { value: 'air', label: 'Air' },
    { value: 'ship', label: 'Ship' },
    { value: 'pickup', label: 'Pickup' }
  ],

  // Helper function to get invoice type options
  getInvoiceTypeOptions: () => [
    { value: 'regular', label: 'Regular' },
    { value: 'export', label: 'Export' },
    { value: 'deemed', label: 'Deemed Export' },
    { value: 'sez', label: 'SEZ' },
    { value: 'reverse_charge', label: 'Reverse Charge' }
  ]
};

export default salesInvoiceService; 