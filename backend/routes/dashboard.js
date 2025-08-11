const express = require('express');
const router = express.Router();
const {
  getSuperadminDashboard,
  getBranchDashboard,
  getSalesAnalytics,
  getOutstandingBalances,
  getProductAnalytics,
  getCustomerAnalytics,
  getVendorAnalytics,
  getInvoiceAnalytics,
  getGeographicalSales,
  getFinancialSummary,
  getActivityFeed
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Main dashboard routes
router.get('/superadmin', getSuperadminDashboard);
router.get('/branch/:branchId', getBranchDashboard);

// Analytics endpoints
router.get('/sales', getSalesAnalytics);
router.get('/outstanding', getOutstandingBalances);
router.get('/products', getProductAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/vendors', getVendorAnalytics);
router.get('/invoices', getInvoiceAnalytics);
router.get('/geographical', getGeographicalSales);
router.get('/financial', getFinancialSummary);

// Activity feed
router.get('/activities', getActivityFeed);

module.exports = router; 