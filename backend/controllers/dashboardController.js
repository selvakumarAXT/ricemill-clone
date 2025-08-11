const asyncHandler = require('express-async-handler');
const Paddy = require('../models/Paddy');
const Production = require('../models/Production');
const Gunny = require('../models/Gunny');
const Inventory = require('../models/Inventory');
const RiceDeposit = require('../models/RiceDeposit');
const Branch = require('../models/Branch');
const User = require('../models/User');
const SalesInvoice = require('../models/SalesInvoice');
const FinancialTransaction = require('../models/FinancialTransaction');
const mongoose = require('mongoose');

// @desc    Get superadmin dashboard stats
// @route   GET /api/dashboard/superadmin
// @access  Private (Superadmin only)
const getSuperadminDashboard = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Superadmin only.'
    });
  }

  try {
    console.log('Dashboard request received for user:', req.user.email);

    // Get comprehensive dashboard data
    const [
      overview,
      sales,
      outstanding,
      products,
      customers,
      invoices,
      geographical,
      recentActivities,
      alerts
    ] = await Promise.all([
      getOverviewData(),
      getSalesAnalytics(req.query),
      getOutstandingBalances(req.query),
      getProductAnalytics(req.query),
      getCustomerAnalytics(req.query),
      getInvoiceAnalytics(req.query),
      getGeographicalSales(req.query),
      getRecentActivities(5),
      getSystemAlerts()
    ]);

    console.log('Dashboard data prepared successfully');

    res.status(200).json({
      success: true,
      data: {
        overview,
        sales,
        outstanding,
        products,
        customers,
        invoices,
        geographical,
        recentActivities,
        alerts
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// @desc    Get branch-specific dashboard
// @route   GET /api/dashboard/branch/:branchId
// @access  Private
const getBranchDashboard = asyncHandler(async (req, res) => {
  const { branchId } = req.params;
  const { role, branchId: userBranchId } = req.user;

  // Check access permissions
  if (role !== 'superadmin' && branchId !== userBranchId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  try {
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }

    // Get branch-specific data
    const [
      overview,
      sales,
      outstanding,
      products,
      customers,
      invoices,
      recentActivities
    ] = await Promise.all([
      getBranchOverviewData(branchId),
      getBranchSalesAnalytics(branchId, req.query),
      getBranchOutstandingBalances(branchId, req.query),
      getBranchProductAnalytics(branchId, req.query),
      getBranchCustomerAnalytics(branchId, req.query),
      getBranchInvoiceAnalytics(branchId, req.query),
      getRecentActivities(5, branchId)
    ]);

    res.status(200).json({
      success: true,
      data: {
        branch: {
          id: branch._id,
          name: branch.name,
          millCode: branch.millCode,
          address: branch.address
        },
        overview,
        sales,
        outstanding,
        products,
        customers,
        invoices,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Branch dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching branch dashboard data'
    });
  }
});

// @desc    Get sales analytics
// @route   GET /api/dashboard/sales
// @access  Private
const getSalesAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await getSalesAnalyticsData(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales analytics'
    });
  }
});

// @desc    Get outstanding balances
// @route   GET /api/dashboard/outstanding
// @access  Private
const getOutstandingBalances = asyncHandler(async (req, res) => {
  try {
    const data = await getOutstandingBalancesData(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Outstanding balances error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching outstanding balances'
    });
  }
});

// @desc    Get product analytics
// @route   GET /api/dashboard/products
// @access  Private
const getProductAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await getProductAnalyticsData(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product analytics'
    });
  }
});

// @desc    Get customer analytics
// @route   GET /api/dashboard/customers
// @access  Private
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await getCustomerAnalyticsData(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching customer analytics'
    });
  }
});

// @desc    Get vendor analytics
// @route   GET /api/dashboard/vendors
// @access  Private
const getVendorAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await getVendorAnalyticsData(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Vendor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor analytics'
    });
  }
});

// @desc    Get invoice analytics
// @route   GET /api/dashboard/invoices
// @access  Private
const getInvoiceAnalytics = asyncHandler(async (req, res) => {
  try {
    const data = await getInvoiceAnalyticsData(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Invoice analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice analytics'
    });
  }
});

// @desc    Get geographical sales data
// @route   GET /api/dashboard/geographical
// @access  Private
const getGeographicalSales = asyncHandler(async (req, res) => {
  try {
    const data = await getGeographicalSalesData(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Geographical sales error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching geographical sales data'
    });
  }
});

// @desc    Get financial summary
// @route   GET /api/dashboard/financial
// @access  Private
const getFinancialSummary = asyncHandler(async (req, res) => {
  try {
    const data = await getFinancialSummaryData(req.query);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Financial summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching financial summary'
    });
  }
});

// @desc    Get real-time activity feed
// @route   GET /api/dashboard/activities
// @access  Private
const getActivityFeed = asyncHandler(async (req, res) => {
  const { limit = 10, branchId } = req.query;
  const { role, branchId: userBranchId } = req.user;

  try {
    const activities = await getRecentActivities(parseInt(limit), branchId || userBranchId);
    
    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity feed'
    });
  }
});

// Helper functions
const getOverviewData = async () => {
  const [
    paddyStats,
    productionStats,
    gunnyStats,
    inventoryStats,
    totalBranches,
    totalUsers
  ] = await Promise.all([
    Paddy.aggregate([
      { $group: { _id: null, totalWeight: { $sum: '$paddy.weight' }, totalBags: { $sum: '$paddy.bags' } } }
    ]),
    Production.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalItems: { $sum: 1 } } }
    ]),
    Gunny.aggregate([
      { $group: { _id: null, totalBags: { $sum: { $add: ['$gunny.nb', '$gunny.onb', '$gunny.ss', '$gunny.swp'] } } } }
    ]),
    Inventory.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalItems: { $sum: 1 } } }
    ]),
    Branch.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true })
  ]);

  const totalPaddy = paddyStats[0]?.totalWeight || 0;
  const totalRice = productionStats[0]?.totalQuantity || 0;
  const totalGunny = gunnyStats[0]?.totalBags || 0;
  const totalInventory = inventoryStats[0]?.totalItems || 0;

  // Calculate revenue and expenses
  const estimatedPricePerKg = 25;
  const totalRevenue = totalPaddy * estimatedPricePerKg;
  const totalExpenses = Math.round(totalRevenue * 0.7);
  const profit = totalRevenue - totalExpenses;
  const gstAmount = Math.round(totalRevenue * 0.18); // 18% GST

  return {
    totalPaddy,
    totalRice,
    totalGunny,
    totalInventory,
    totalBranches,
    totalUsers,
    totalRevenue,
    totalExpenses,
    profit,
    gstAmount
  };
};

const getSalesAnalyticsData = async (params = {}) => {
  const { startDate, endDate } = params;
  
  // Mock data for now - in real implementation, this would come from actual sales data
  const salesData = [60, 80, 45, 90, 70, 85];
  const purchaseData = [0, 0, 0, 40, 0, 0];
  const newCustomerSales = [0, 35, 0, 0, 0, 0];
  const existingCustomerSales = [100, 65, 100, 100, 100, 100];
  const invoiceCounts = { sales: [15, 22, 20, 18, 16, 14], purchases: [0, 0, 0, 5, 0, 0] };
  const invoiceAmounts = { sales: [1200, 2800, 2500, 1800, 2200, 2000], purchases: [0, 0, 0, 800, 0, 0] };

  return {
    salesData,
    purchaseData,
    newCustomerSales,
    existingCustomerSales,
    invoiceCounts,
    invoiceAmounts
  };
};

const getOutstandingBalancesData = async (params = {}) => {
  // Mock data for now - in real implementation, this would come from actual invoice data
  const salesOutstanding = {
    current: 595088,
    overdue_1_15: 2238008,
    overdue_16_30: 1053623,
    overdue_30_plus: 20558961.80
  };
  
  const purchaseOutstanding = {
    current: 0,
    overdue_1_15: 0,
    overdue_16_30: 0,
    overdue_30_plus: 0
  };

  return {
    salesOutstanding,
    purchaseOutstanding
  };
};

const getProductAnalyticsData = async (params = {}) => {
  // Mock data for now - in real implementation, this would come from actual production and inventory data
  const bestSelling = [
    { name: 'HUSK', quantity: 607610 },
    { name: 'BRAN', quantity: 173900 },
    { name: 'RICE BROKEN', quantity: 161330 },
    { name: 'BLACKRICE', quantity: 33250 },
    { name: 'RICE NOOK', quantity: 26140 }
  ];
  
  const leastSelling = [
    { name: 'PADDY', quantity: 1111.79 },
    { name: 'RICE NOOK', quantity: 26140 },
    { name: 'BLACKRICE', quantity: 33250 },
    { name: 'RICE BROKEN', quantity: 161330 },
    { name: 'BRAN', quantity: 173900 }
  ];
  
  const lowStock = [
    { name: 'HUSK', quantity: -1046710 },
    { name: 'RICE BROKEN', quantity: -321220 },
    { name: 'BLACKRICE', quantity: -33250 },
    { name: 'PADDY', quantity: -1515.37 }
  ];

  return {
    bestSelling,
    leastSelling,
    lowStock
  };
};

const getCustomerAnalyticsData = async (params = {}) => {
  // Mock data for now - in real implementation, this would come from actual customer data
  const topCustomers = [
    { name: 'SRI BALAMURAGAN TRADERS', amount: 4691295 },
    { name: 'Oviya Traders', amount: 3608727 },
    { name: 'HARISH UMI', amount: 1762902 },
    { name: 'PRAGYA ENTERPRISES', amount: 999999 },
    { name: 'ESWAR AND CO', amount: 520000 }
  ];
  
  const topVendors = [
    { name: 'ESWAR & CO', amount: 1750000 },
    { name: 'Priyanka', amount: 410000 },
    { name: 'Vikram Selvam', amount: 120000 },
    { name: 'Venkatesan', amount: 100000 }
  ];

  return {
    topCustomers,
    topVendors
  };
};

const getInvoiceAnalyticsData = async (params = {}) => {
  // Mock data for now - in real implementation, this would come from actual invoice data
  const dueInvoices = [
    { invoiceNo: '10', companyName: 'M/S.SVMA AGRO PRODUCTS PVT LTD', name: '', phone: '', dueDate: '08-May-24', dueFrom: '449 Days', remainingPayment: 5903.80 },
    { invoiceNo: '14', companyName: '', name: 'RAJESH', phone: '', dueDate: '08-May-24', dueFrom: '449 Days', remainingPayment: 300000 },
    { invoiceNo: '16', companyName: '', name: 'RAJESH', phone: '', dueDate: '09-May-24', dueFrom: '448 Days', remainingPayment: 100000 },
    { invoiceNo: '18', companyName: 'M/S.SVMA AGRO PRODUCTS PVT LTD', name: '', phone: '', dueDate: '15-May-24', dueFrom: '442 Days', remainingPayment: 513576 },
    { invoiceNo: '19', companyName: 'M/S.SVMA AGRO PRODUCTS PVT LTD', name: '', phone: '', dueDate: '15-May-24', dueFrom: '442 Days', remainingPayment: 50840 }
  ];

  return {
    dueInvoices
  };
};

const getGeographicalSalesData = async (params = {}) => {
  // Mock data for now - in real implementation, this would come from actual geographical sales data
  return {
    topState: 'Tamil Nadu',
    totalSales: 12500000,
    stateSales: {
      'Tamil Nadu': 12500000,
      'Karnataka': 0,
      'Andhra Pradesh': 0,
      'Kerala': 0
    }
  };
};

const getFinancialSummaryData = async (params = {}) => {
  // Mock data for now - in real implementation, this would come from actual financial data
  return {
    totalRevenue: 1480080,
    totalExpenses: 0,
    totalProfit: 1480080,
    gstAmount: 53016
  };
};

// Branch-specific helper functions
const getBranchOverviewData = async (branchId) => {
  const [
    paddyStats,
    productionStats,
    gunnyStats,
    inventoryStats
  ] = await Promise.all([
    Paddy.aggregate([
      { $match: { branch_id: new mongoose.Types.ObjectId(branchId) } },
      { $group: { _id: null, totalWeight: { $sum: '$paddy.weight' }, totalBags: { $sum: '$paddy.bags' } } }
    ]),
    Production.aggregate([
      { $match: { branch_id: new mongoose.Types.ObjectId(branchId) } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalItems: { $sum: 1 } } }
    ]),
    Gunny.aggregate([
      { $match: { branch_id: new mongoose.Types.ObjectId(branchId) } },
      { $group: { _id: null, totalBags: { $sum: { $add: ['$gunny.nb', '$gunny.onb', '$gunny.ss', '$gunny.swp'] } } } }
    ]),
    Inventory.aggregate([
      { $match: { branch_id: new mongoose.Types.ObjectId(branchId) } },
      { $group: { _id: null, totalItems: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
    ])
  ]);

  return {
    totalPaddy: paddyStats[0]?.totalWeight || 0,
    totalRice: productionStats[0]?.totalQuantity || 0,
    totalGunny: gunnyStats[0]?.totalBags || 0,
    totalInventory: inventoryStats[0]?.totalItems || 0
  };
};

const getBranchSalesAnalytics = async (branchId, params = {}) => {
  // Similar to getSalesAnalyticsData but filtered by branch
  return getSalesAnalyticsData(params);
};

const getBranchOutstandingBalances = async (branchId, params = {}) => {
  // Similar to getOutstandingBalancesData but filtered by branch
  return getOutstandingBalancesData(params);
};

const getBranchProductAnalytics = async (branchId, params = {}) => {
  // Similar to getProductAnalyticsData but filtered by branch
  return getProductAnalyticsData(params);
};

const getBranchCustomerAnalytics = async (branchId, params = {}) => {
  // Similar to getCustomerAnalyticsData but filtered by branch
  return getCustomerAnalyticsData(params);
};

const getBranchInvoiceAnalytics = async (branchId, params = {}) => {
  // Similar to getInvoiceAnalyticsData but filtered by branch
  return getInvoiceAnalyticsData(params);
};

const getRecentActivities = async (days = 7, branchId = null) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchStage = {
    createdAt: { $gte: startDate }
  };

  if (branchId) {
    matchStage.branch_id = new mongoose.Types.ObjectId(branchId);
  }

  const activities = [];

  // Get recent paddy entries
  const recentPaddy = await Paddy.aggregate([
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $project: {
        type: { $literal: 'paddy' },
        action: 'New paddy entry',
        amount: { $concat: [{ $toString: '$paddy.weight' }, ' kg'] },
        time: '$createdAt',
        status: { $literal: 'completed' },
        branch_id: 1
      }
    }
  ]);

  // Get recent production entries
  const recentProduction = await Production.aggregate([
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $project: {
        type: { $literal: 'production' },
        action: 'Rice production completed',
        amount: { $concat: [{ $toString: '$riceWeight' }, ' kg'] },
        time: '$createdAt',
        status: { $literal: 'completed' },
        branch_id: 1
      }
    }
  ]);

  // Get recent inventory changes
  const recentInventory = await Inventory.aggregate([
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    { $limit: 5 },
    {
      $project: {
        type: { $literal: 'inventory' },
        action: 'Inventory updated',
        amount: { $concat: ['$name', ' - ', { $toString: '$quantity' }, ' units'] },
        time: '$createdAt',
        status: { $literal: 'completed' },
        branch_id: 1
      }
    }
  ]);

  // Combine and sort all activities
  activities.push(...recentPaddy, ...recentProduction, ...recentInventory);
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Add branch names
  const branchIds = [...new Set(activities.map(a => a.branch_id))];
  const branches = await Branch.find({ _id: { $in: branchIds } }, 'name');
  const branchMap = branches.reduce((map, branch) => {
    map[branch._id.toString()] = branch.name;
    return map;
  }, {});

  return activities.slice(0, 10).map(activity => ({
    ...activity,
    branchName: branchMap[activity.branch_id?.toString()] || 'Unknown Branch',
    timeAgo: getTimeAgo(activity.time)
  }));
};

const getSystemAlerts = async () => {
  const alerts = [];

  // Check for low inventory
  const lowInventory = await Inventory.find({ quantity: { $lt: 100 } });
  if (lowInventory.length > 0) {
    alerts.push({
      type: 'warning',
      message: `${lowInventory.length} items are running low on stock`,
      count: lowInventory.length
    });
  }

  // Check for inactive branches
  const inactiveBranches = await Branch.find({ isActive: false });
  if (inactiveBranches.length > 0) {
    alerts.push({
      type: 'info',
      message: `${inactiveBranches.length} branches are currently inactive`,
      count: inactiveBranches.length
    });
  }

  // Check for pending production
  const pendingProduction = await Production.countDocuments({ status: 'Pending' });
  if (pendingProduction > 0) {
    alerts.push({
      type: 'info',
      message: `${pendingProduction} production entries are pending`,
      count: pendingProduction
    });
  }

  // Check for recent activities (if no recent activity, show alert)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
  const recentActivity = await Promise.all([
    Paddy.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    Production.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    Inventory.countDocuments({ createdAt: { $gte: oneDayAgo } })
  ]);
  
  const totalRecentActivity = recentActivity.reduce((sum, count) => sum + count, 0);
  
  if (totalRecentActivity === 0) {
    alerts.push({
      type: 'warning',
      message: 'No recent activity detected in the last 24 hours',
      count: 0
    });
  }

  // If no alerts, add a positive message
  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      message: 'System is running smoothly',
      count: 0
    });
  }

  return alerts;
};

const getTimeAgo = (date) => {
  const now = new Date();
  const diffInHours = Math.floor((now - new Date(date)) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks} weeks ago`;
};

module.exports = {
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
}; 