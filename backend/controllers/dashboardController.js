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
    // Extract branch_id from query parameters for optional branch filtering
    const { branch_id } = req.query;
    
    const [
      overview,
      sales,
      outstanding,
      products,
      customers,
      invoices,
      geographical,
      recentActivities,
      alerts,
      purchaseInvoices
    ] = await Promise.all([
      getOverviewData(req.query, branch_id),
      getSalesAnalyticsData(req.query, branch_id),      
      getOutstandingBalancesData(req.query, branch_id),  
      getProductAnalyticsData(req.query, branch_id),    
      getCustomerAnalyticsData(req.query, branch_id),  
      getInvoiceAnalyticsData(req.query, branch_id),  
      getGeographicalSalesData(req.query, branch_id),  
      getRecentActivities(5, branch_id),
      getSystemAlerts(),
      getPurchaseInvoiceDueData(req.query, branch_id)
    ]);

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
        alerts,
        purchaseInvoices,
        branchFilter: branch_id ? { branchId: branch_id, isFiltered: true } : { isFiltered: false }
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
  const { limit = 10, branch_id } = req.query;
  const { role, branchId: userBranchId } = req.user;

  try {
    const activities = await getRecentActivities(parseInt(limit), branch_id || userBranchId);
    
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
const getOverviewData = async (params = {}, branch_id = null) => {
  const { startDate, endDate } = params;
  
  // Use provided dates or default to all data
  let startDateObj, endDateObj;
  
  if (startDate && endDate) {
    startDateObj = new Date(startDate);
    endDateObj = new Date(endDate);
  }
  
  // Build branch filter condition
  const branchFilter = branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {};
  
  const [
    paddyStats,
    productionStats,
    gunnyStats,
    inventoryStats,
    totalBranches,
    totalUsers,
    totalPurchase,
    totalIncome,
    totalSales
  ] = await Promise.all([
    Paddy.aggregate([
      { 
        $match: (() => {
          const matchObj = { ...branchFilter };
          if (startDateObj && endDateObj) {
            matchObj.issueDate = { $gte: startDateObj, $lte: endDateObj };
          }
          return matchObj;
        })()
      },
      { $group: { _id: null, totalWeight: { $sum: '$paddy.weight' }, totalBags: { $sum: '$paddy.bags' } } }
    ]),
    Production.aggregate([
      { 
        $match: (() => {
          const matchObj = { ...branchFilter };
          if (startDateObj && endDateObj) {
            matchObj.productionDate = { $gte: startDateObj, $lte: endDateObj };
          }
          return matchObj;
        })()
      },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalItems: { $sum: 1 } } }
    ]),
    Gunny.aggregate([
      { 
        $match: (() => {
          const matchObj = { ...branchFilter };
          if (startDateObj && endDateObj) {
            matchObj.createdAt = { $gte: startDateObj, $lte: endDateObj };
          }
          return matchObj;
        })()
      },
      { $group: { _id: null, totalBags: { $sum: { $add: ['$gunny.nb', '$gunny.onb', '$gunny.ss', '$gunny.swp'] } } } }
    ]),
    Inventory.aggregate([
      { 
        $match: (() => {
          const matchObj = { ...branchFilter };
          if (startDateObj && endDateObj) {
            matchObj.createdAt = { $gte: startDateObj, $lte: endDateObj };
          }
          return matchObj;
        })()
      },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalItems: { $sum: 1 } } }
    ]),
    // For branches and users, always get total count regardless of branch filter
    Branch.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: true }),
    // Get total purchase amount from FinancialTransaction with date filter and optional branch filter
    FinancialTransaction.aggregate([
      {
        $match: (() => {
          const matchObj = {
            transactionType: 'expense',
            category: { $in: ['paddy_purchase', 'labor', 'electricity', 'maintenance'] }
          };
          
          if (startDateObj && endDateObj) {
            matchObj.transactionDate = { $gte: startDateObj, $lte: endDateObj };
          }
          
          if (branch_id) {
            matchObj.branch_id = new mongoose.Types.ObjectId(branch_id);
          }
          
          return matchObj;
        })()
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]),
    // Get total income amount from FinancialTransaction with date filter and optional branch filter
    FinancialTransaction.aggregate([
      {
        $match: (() => {
          const matchObj = {
            transactionType: 'income'
          };
          
          if (startDateObj && endDateObj) {
            matchObj.transactionDate = { $gte: startDateObj, $lte: endDateObj };
          }
          
          if (branch_id) {
            matchObj.branch_id = new mongoose.Types.ObjectId(branch_id);
          }
          
          return matchObj;
        })()
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]),
    // Get total sales amount from FinancialTransaction with date filter and optional branch filter
    FinancialTransaction.aggregate([
      {
        $match: (() => {
          const matchObj = {
            transactionType: 'income',
            category: { $in: ['rice_sales', 'paddy_sales', 'other_sales', 'sales'] }
          };
          
          if (startDateObj && endDateObj) {
            matchObj.transactionDate = { $gte: startDateObj, $lte: endDateObj };
          }
          
          if (branch_id) {
            matchObj.branch_id = new mongoose.Types.ObjectId(branch_id);
          }
          
          return matchObj;
        })()
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ])
  ]);

  const totalPaddy = paddyStats[0]?.totalWeight || 0;
  const totalRice = productionStats[0]?.totalQuantity || 0;
  const totalGunny = gunnyStats[0]?.totalBags || 0;
  const totalInventory = inventoryStats[0]?.totalItems || 0;

  // Get actual financial data
  const actualPurchase = totalPurchase[0]?.totalAmount || 0;
  const actualIncome = totalIncome[0]?.totalAmount || 0;
  const actualSales = totalSales[0]?.totalAmount || 0;

  // Use real data instead of estimated calculations
  const totalRevenue = actualSales; // Real sales from invoices
  const totalExpenses = actualPurchase; // Real expenses from transactions
  const profit = totalRevenue - totalExpenses;
  const gstAmount = Math.round(actualSales * 0.18); // 18% GST on real sales

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
    gstAmount,
    totalPurchase: actualPurchase,
    totalIncome: actualIncome
  };
};

const getSalesAnalyticsData = async (params = {}, branch_id = null) => {
  const { startDate, endDate } = params;
  
  // Use provided dates or default to last 6 months
  let startDateObj, endDateObj;
  
  if (startDate && endDate) {
    // Parse dates more robustly to avoid timezone issues
    startDateObj = new Date(startDate + 'T00:00:00.000Z');
    endDateObj = new Date(endDate + 'T23:59:59.999Z');
  } else {
    // Default to last 6 months
    endDateObj = new Date();
    startDateObj = new Date();
    startDateObj.setMonth(startDateObj.getMonth() - 6);
  }
  
  const months = [];
  const salesData = [];
  const purchaseData = [];
  const newCustomerSales = [];
  const existingCustomerSales = [];
  const invoiceCounts = { sales: [], purchases: [] };
  const invoiceAmounts = { sales: [], purchases: [] };

  // Generate monthly data based on date range
  // Calculate months more precisely
  const startYear = startDateObj.getFullYear();
  const startMonth = startDateObj.getMonth();
  const endYear = endDateObj.getFullYear();
  const endMonth = endDateObj.getMonth();
  
      // Calculate exact months between dates - PROPER FIX
    const calculateMonthsBetween = (startDate, endDate) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const endYear = end.getFullYear();
      const endMonth = end.getMonth();
      
      // Calculate month difference
      let monthDiff = (endYear - startYear) * 12 + (endMonth - startMonth);
      
      // If end date is in the same month but later day, count it
      if (end.getDate() > start.getDate()) {
        monthDiff += 1;
      }
      
      // Ensure minimum 1 month
      return Math.max(1, monthDiff);
    };

    const monthCount = calculateMonthsBetween(startDateObj, endDateObj);

    // Add validation to prevent extra months
    if (monthCount > 12) {
      monthCount = 12;
    }


    for (let i = 0; i < monthCount; i++) {
    const monthDate = new Date(startYear, startMonth + i, 1);
    const monthName = monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months.push(monthName);

    // Get actual sales data for this month
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const [monthlySales, monthlyPurchases, monthlyFinancial] = await Promise.all([
      // Get actual sales data from SalesInvoice model
      SalesInvoice.aggregate([
        {
          $match: {
            invoiceDate: { $gte: monthStart, $lte: monthEnd }, // Use invoiceDate for SalesInvoice
            status: { $in: ['paid', 'partial'] },  // Only count paid invoices
            ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$totals.grandTotal' },
            count: { $sum: 1 }
          }
        }
      ]),
      // Get actual purchase data from FinancialTransaction model
      FinancialTransaction.aggregate([
        {
          $match: {
            transactionDate: { $gte: monthStart, $lte: monthEnd }, // Use transactionDate for FinancialTransaction
            transactionType: 'expense',
            category: { $in: ['paddy_purchase', 'labor', 'electricity', 'maintenance'] },
            ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      // Get income data from FinancialTransaction model
      FinancialTransaction.aggregate([
        {
          $match: {
            transactionDate: { $gte: monthStart, $lte: monthEnd }, // Use transactionDate for FinancialTransaction
            transactionType: 'income',
            ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const salesValue = monthlySales[0]?.totalAmount || 0;  // Real sales amount
    const purchaseValue = monthlyPurchases[0]?.totalAmount || 0;  // Real purchase amount
    const incomeValue = monthlyFinancial[0]?.totalAmount || 0;  // Real income amount
    
    // Use actual financial values
    salesData.push(Math.round(salesValue / 1000));  // Convert to thousands
    purchaseData.push(Math.round(purchaseValue / 1000));  // Convert to thousands
    
    // Get actual customer data from SalesInvoice to distinguish new vs existing customers
    const monthlyInvoices = await SalesInvoice.aggregate([
      {
        $match: {
          invoiceDate: { $gte: monthStart, $lte: monthEnd }, // Use invoiceDate instead of createdAt
          ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
        }
      },
      {
        $lookup: {
          from: 'salesinvoices',
          let: { customerName: '$customer.name' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$customer.name', '$$customerName'] },
                    { $lt: ['$invoiceDate', monthStart] } // Use invoiceDate instead of createdAt
                  ]
                },
                ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
              }
            }
          ],
          as: 'previousPurchases'
        }
      },
      {
        $addFields: {
          isNewCustomer: { $eq: [{ $size: '$previousPurchases' }, 0] }
        }
      },
      {
        $group: {
          _id: '$isNewCustomer',
          totalAmount: { $sum: '$totals.grandTotal' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate new vs existing customer sales
    let newCustomerAmount = 0;
    let existingCustomerAmount = 0;
    
    monthlyInvoices.forEach(invoice => {
      if (invoice._id === true) { // New customer
        newCustomerAmount += invoice.totalAmount;
      } else { // Existing customer
        existingCustomerAmount += invoice.totalAmount;
      }
    });
    
    newCustomerSales.push(Math.round(newCustomerAmount / 1000)); // Convert to thousands
    existingCustomerSales.push(Math.round(existingCustomerAmount / 1000)); // Convert to thousands
    
    invoiceCounts.sales.push(monthlySales[0]?.count || 0);
    invoiceCounts.purchases.push(monthlyPurchases[0]?.count || 0);
    
    // Calculate total sales amount for invoice amounts
    const totalSalesAmount = newCustomerAmount + existingCustomerAmount;
    invoiceAmounts.sales.push(Math.round(totalSalesAmount / 1000)); // Convert to thousands
    invoiceAmounts.purchases.push(Math.round(purchaseValue / 1000)); // Convert to thousands
  }

  return {
    months,  // Add month labels for frontend charts
    salesData,
    purchaseData,
    newCustomerSales,
    existingCustomerSales,
    invoiceCounts,
    invoiceAmounts
  };
};

const getOutstandingBalancesData = async (params = {}, branch_id = null) => {
  const { startDate, endDate } = params;
  
  // Use provided dates or default to all data
  let startDateObj, endDateObj;
  
  if (startDate && endDate) {
    startDateObj = new Date(startDate);
    endDateObj = new Date(endDate);
  }
  
  const now = new Date();

  try {
    // Get sales outstanding from SalesInvoice (customer receivables)
    const salesOutstandingData = await SalesInvoice.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'partial', 'overdue'] }, // Unpaid invoices
          dueDate: { $exists: true }, // Removed invoiceDate filter - show all outstanding regardless of creation date
          ...(startDateObj && endDateObj ? { invoiceDate: { $gte: startDateObj, $lte: endDateObj } } : {}),
          ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
        }
      },
      {
        $addFields: {
          outstandingAmount: {
            $subtract: ['$totals.grandTotal', { $ifNull: ['$paidAmount', 0] }]
          },
          daysOverdue: {
            $floor: {
              $divide: [
                { $subtract: [now, '$dueDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          current: {
            $sum: {
              $cond: [
                { $lte: ['$daysOverdue', 0] },
                '$outstandingAmount',
                0
              ]
            }
          },
          overdue_1_15: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$daysOverdue', 0] }, { $lte: ['$daysOverdue', 15] }] },
                '$outstandingAmount',
                0
              ]
            }
          },
          overdue_16_30: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$daysOverdue', 15] }, { $lte: ['$daysOverdue', 30] }] },
                '$outstandingAmount',
                0
              ]
            }
          },
          overdue_30_plus: {
            $sum: {
              $cond: [
                { $gt: ['$daysOverdue', 30] },
                '$outstandingAmount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          current: 1,
          overdue_1_15: 1,
          overdue_16_30: 1,
          overdue_30_plus: 1
        }
      }
    ]);

    const salesOutstanding = salesOutstandingData[0] || {
      current: 0,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_30_plus: 0
    };

    // Get purchase outstanding from FinancialTransaction expense transactions
    const purchaseOutstandingData = await FinancialTransaction.aggregate([
      {
        $match: {
          transactionType: 'expense',
          category: { $in: ['paddy_purchase', 'labor', 'electricity', 'maintenance', 'transport', 'rent', 'utilities', 'insurance', 'taxes'] },
          ...(startDateObj && endDateObj ? { transactionDate: { $gte: startDateObj, $lte: endDateObj } } : {}),
          ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
        }
      },
      {
        $addFields: {
          // Calculate days overdue from transaction date
          daysOverdue: {
            $floor: {
              $divide: [
                { $subtract: [now, '$transactionDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          current: {
            $sum: {
              $cond: [
                { $lte: ['$daysOverdue', 0] },
                '$amount',
                0
              ]
            }
          },
          overdue_1_15: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$daysOverdue', 0] }, { $lte: ['$daysOverdue', 15] }] },
                '$amount',
                0
              ]
            }
          },
          overdue_16_30: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$daysOverdue', 15] }, { $lte: ['$daysOverdue', 30] }] },
                '$amount',
                0
              ]
            }
          },
          overdue_30_plus: {
            $sum: {
              $cond: [
                { $gt: ['$daysOverdue', 30] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          current: 1,
          overdue_1_15: 1,
          overdue_16_30: 1,
          overdue_30_plus: 1
        }
      }
    ]);

    const purchaseOutstanding = purchaseOutstandingData[0] || {
      current: 0,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_30_plus: 0
    };

    return {
      salesOutstanding,
      purchaseOutstanding
    };
  } catch (error) {
    console.error('Error fetching outstanding balances:', error);
    // Return default values if there's an error
    return {
      salesOutstanding: {
        current: 0,
        overdue_1_15: 0,
        overdue_16_30: 0,
        overdue_30_plus: 0
      },
      purchaseOutstanding: {
        current: 0,
        overdue_1_15: 0,
        overdue_16_30: 0,
        overdue_30_plus: 0
      }
    };
  }
};

const getProductAnalyticsData = async (params = {}, branch_id = null) => {
  try {
    const { startDate, endDate } = params;
    
    // Build date filter for Production
    const productionDateFilter = {};
    if (startDate && endDate) {
      productionDateFilter.productionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get actual product performance data from Production and Inventory models
    const [bestSelling, leastSelling, lowStock] = await Promise.all([
      // Best selling products (based on production quantity) - WITH DATE FILTER
      Production.aggregate([
        {
          $match: {
            ...(Object.keys(productionDateFilter).length > 0 ? productionDateFilter : {}),
            ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
          }
        },
        {
          $group: {
            _id: '$name', // Fixed: Production model uses 'name' field
            totalQuantity: { $sum: '$quantity' }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ]),
      
      // Least selling products (based on production quantity) - WITH DATE FILTER
      Production.aggregate([
        {
          $match: {
            ...(Object.keys(productionDateFilter).length > 0 ? productionDateFilter : {}),
            ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
          }
        },
        {
          $group: {
            _id: '$name', // Fixed: Production model uses 'name' field
            totalQuantity: { $sum: '$quantity' }
          }
        },
        { $sort: { totalQuantity: 1 } },
        { $limit: 5 }
      ]),
      
      // Low stock items (negative or low inventory) - NO DATE FILTER NEEDED (current inventory)
      Inventory.aggregate([
        {
          $match: {
            $or: [
              { quantity: { $lt: 1000 } }, // Adjusted: Show items with less than 1000 units
              { quantity: { $lt: 0 } }
            ],
            ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
          }
        },
        {
          $group: {
            _id: '$name', // Fixed: Inventory model uses 'name' field
            quantity: { $sum: '$quantity' }
          }
        },
        { $sort: { quantity: 1 } },
        { $limit: 5 }
      ])
    ]);

    const result = {
      bestSelling: bestSelling.map(item => ({
        name: item._id || 'Unknown Product',
        quantity: item.totalQuantity
      })),
      leastSelling: leastSelling.map(item => ({
        name: item._id || 'Unknown Product',
        quantity: item.totalQuantity
      })),
      lowStock: lowStock.map(item => ({
        name: item._id || 'Unknown Product',
        quantity: item.quantity
      }))
    };

    return result;
  } catch (error) {
    console.error('Error fetching product analytics:', error);
    // Return default data if there's an error
    return {
      bestSelling: [
        { name: 'HUSK', quantity: 0 },
        { name: 'BRAN', quantity: 0 },
        { name: 'RICE BROKEN', quantity: 0 }
      ],
      leastSelling: [
        { name: 'PADDY', quantity: 0 },
        { name: 'RICE NOOK', quantity: 0 }
      ],
      lowStock: [
        { name: 'HUSK', quantity: 0 },
        { name: 'RICE BROKEN', quantity: 0 }
      ]
    };
  }
};

const getCustomerAnalyticsData = async (params = {}, branch_id = null) => {
  try {
    const { startDate, endDate } = params;
    
    // Build date filter for SalesInvoice
    const salesDateFilter = {};
    if (startDate && endDate) {
      salesDateFilter.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get actual customer data from SalesInvoice model
    const [topCustomers] = await Promise.all([
      // Top customers by total purchase amount - WITH DATE FILTER
      SalesInvoice.aggregate([
        {
          $match: {
            ...(Object.keys(salesDateFilter).length > 0 ? salesDateFilter : {}),
            ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
          }
        },
        {
          $group: {
            _id: '$customer.name', // Fixed: Customer name is nested under customer.name
            totalAmount: { $sum: '$totals.grandTotal' } // Fixed: Use totals.grandTotal instead of totalAmount
          }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 }
      ])
    ]);

    // Get vendor data separately using the dedicated function
    const vendorData = await getVendorAnalyticsData(params, branch_id);

    const result = {
      topCustomers: topCustomers.map(customer => ({
        name: customer._id || 'Unknown Customer',
        amount: customer.totalAmount
      })),
      topVendors: vendorData.topVendors
    };

    return result;
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    // Return default data if there's an error
    return {
      topCustomers: [
        { name: 'No Data Available', amount: 0 }
      ],
      topVendors: [
        { name: 'No Data Available', amount: 0 }
      ]
    };
  }
};

const getVendorAnalyticsData = async (params = {}, branch_id = null) => {
  try {
    const { startDate, endDate } = params;
    
    // Build date filter for FinancialTransaction
    const vendorDateFilter = {};
    if (startDate && endDate) {
      vendorDateFilter.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build branch filter
    const branchFilter = branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {};

    // Get top vendors by total expense amount from FinancialTransaction
    const topVendors = await FinancialTransaction.aggregate([
      {
        $match: {
          transactionType: 'expense',
          ...(Object.keys(vendorDateFilter).length > 0 ? vendorDateFilter : {}),
          ...branchFilter
        }
      },
      // Group by vendor name
      {
        $group: {
          _id: '$vendor',
          totalAmount: { $sum: '$amount' }
        }
      },
      // Sort by highest amount
      { $sort: { totalAmount: -1 } },
      // Limit to top 5
      { $limit: 5 }
    ]);

    const result = {
      topVendors: topVendors.map(vendor => ({
        name: vendor._id || 'Unknown Vendor',
        amount: vendor.totalAmount
      }))
    };

    return result;
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    // Return default data if there's an error
    return {
      topVendors: [
        { name: 'No Data Available', amount: 0 }
      ]
    };
  }
};

const getInvoiceAnalyticsData = async (params = {}, branch_id = null) => {
  try {
    const { startDate, endDate } = params;
    
    // Build date filter for SalesInvoice
    const salesDateFilter = {};
    if (startDate && endDate) {
      salesDateFilter.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get actual due invoices from SalesInvoice model
    const dueInvoices = await SalesInvoice.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'partial'] },
          dueDate: { $exists: true },
          ...(salesDateFilter),
          ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
        }
      },
      {
        $addFields: {
          daysOverdue: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dueDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $project: {
          invoiceNo: '$invoiceNumber',
          companyName: '$customer.name', // Fixed: Use nested customer.name
          name: '$customer.name', // Fixed: Use nested customer.name
          dueDate: { $dateToString: { format: '%d-%b-%Y', date: '$dueDate' } },
          dueFrom: { $concat: [{ $toString: '$daysOverdue' }, ' Days'] },
          remainingPayment: { $subtract: ['$totals.grandTotal', { $ifNull: ['$paidAmount', 0] }] } // Fixed: Use totals.grandTotal
        }
      },
      { $sort: { dueDate: 1 } },
      { $limit: 5 }
    ]);

    return {
      dueInvoices: dueInvoices.length > 0 ? dueInvoices : [
        {
          invoiceNo: 'No Data',
          companyName: 'No outstanding invoices',
          name: '',
          dueDate: '',
          dueFrom: '',
          remainingPayment: 0
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching invoice analytics:', error);
    // Return default data if there's an error
    return {
      dueInvoices: [
        {
          invoiceNo: 'Error',
          companyName: 'Failed to fetch data',
          name: '',
          dueDate: '',
          dueFrom: '',
          remainingPayment: 0
        }
      ]
    };
  }
};

const getGeographicalSalesData = async (params = {}, branch_id = null) => {
  try {
    const { startDate, endDate } = params;
    
    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.invoiceDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get actual geographical sales data from SalesInvoice model
    const geographicalData = await SalesInvoice.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 ? dateFilter : {}),
          ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
        }
      },
      {
        $group: {
          _id: '$customer.placeOfSupply', // Use the correct field path
          totalSales: { $sum: '$totals.grandTotal' }
        }
      },
      { $sort: { totalSales: -1 } }
    ]);

    if (geographicalData.length > 0) {
      const topState = geographicalData[0]._id || 'Tamil Nadu';
      const totalSales = geographicalData.reduce((sum, item) => sum + item.totalSales, 0);
      
      const stateSales = {};
      geographicalData.forEach(item => {
        stateSales[item._id || 'Unknown'] = item.totalSales;
      });

      return {
        topState,
        totalSales,
        stateSales
      };
    } else {
      // Return default data if no geographical data available
      return {
        topState: 'Tamil Nadu',
        totalSales: 0,
        stateSales: {
          'Tamil Nadu': 0,
          'Karnataka': 0,
          'Andhra Pradesh': 0
        }
      };
    }
  } catch (error) {
    console.error('Error fetching geographical sales data:', error);
    // Return default data if there's an error
    return {
      topState: 'Tamil Nadu',
      totalSales: 0,
      stateSales: {
        'Tamil Nadu': 0,
        'Karnataka': 0,
        'Andhra Pradesh': 0
      }
    };
  }
};

const getFinancialSummaryData = async (params = {}) => {
  try {
    // Get actual financial data from various models
    const [paddyValue, productionValue, expenses] = await Promise.all([
      // Paddy value (input cost)
      Paddy.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$paddy.weight', 25] } } // Assuming ₹25 per kg
          }
        }
      ]),
      
      // Production value (output revenue)
      Production.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ['$quantity', 40] } } // Assuming ₹40 per kg
          }
        }
      ]),
      
      // Expenses (for now, using estimated expenses)
      Promise.resolve([{ totalValue: 0 }])
    ]);

    const totalRevenue = productionValue[0]?.totalValue || 0;
    const totalExpenses = paddyValue[0]?.totalValue || 0;
    const profit = totalRevenue - totalExpenses;
    const gstAmount = Math.round(totalRevenue * 0.18);

    return {
      totalRevenue,
      totalExpenses,
      profit,
      gstAmount
    };
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    // Return default data if there's an error
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      profit: 0,
      gstAmount: 0
    };
  }
};

const getPurchaseInvoiceDueData = async (params = {}, branch_id = null) => {
  try {
    const { startDate, endDate } = params;
    
    // Build date filter for FinancialTransaction
    const purchaseDateFilter = {};
    if (startDate && endDate) {
      purchaseDateFilter.transactionDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get pending expense transactions (purchase invoices due)
    const pendingPurchases = await FinancialTransaction.aggregate([
      {
        $match: {
          transactionType: 'expense',
          status: 'pending',
          category: { $in: ['paddy_purchase', 'labor', 'electricity', 'maintenance', 'transport', 'rent', 'utilities', 'insurance', 'taxes', 'other'] },
          ...(purchaseDateFilter),
          ...(branch_id ? { branch_id: new mongoose.Types.ObjectId(branch_id) } : {})
        }
      },
      {
        $addFields: {
          daysOverdue: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$transactionDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $project: {
          invoiceNo: '$reference',
          companyName: '$vendor',
          name: '$vendor',
          dueDate: { $dateToString: { format: '%d-%b-%Y', date: '$transactionDate' } },
          dueFrom: { $concat: [{ $toString: '$daysOverdue' }, ' Days'] },
          remainingPayment: '$amount',
          category: '$category',
          description: '$description'
        }
      },
      { $sort: { transactionDate: 1 } },
      { $limit: 5 }
    ]);

    return pendingPurchases.length > 0 ? pendingPurchases : [
      {
        invoiceNo: 'No Data',
        companyName: 'No pending purchases',
        name: '',
        dueDate: '',
        dueFrom: '',
        remainingPayment: 0,
        category: '',
        description: ''
      }
    ];
  } catch (error) {
    console.error('Error fetching purchase invoice due data:', error);
    return [
      {
        invoiceNo: 'Error',
        companyName: 'Failed to fetch data',
        name: '',
        dueDate: '',
        dueFrom: '',
        remainingPayment: 0,
        category: '',
        description: ''
      }
    ];
  }
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
  return getSalesAnalyticsData(params, branchId);
};

const getBranchOutstandingBalances = async (branchId, params = {}) => {
  // Similar to getOutstandingBalancesData but filtered by branch
  return getOutstandingBalancesData(params, branchId);
};

const getBranchProductAnalytics = async (branchId, params = {}) => {
  // Similar to getProductAnalyticsData but filtered by branch
  return getProductAnalyticsData(params, branchId);
};

const getBranchCustomerAnalytics = async (branchId, params = {}) => {
  // Similar to getCustomerAnalyticsData but filtered by branch
  return getCustomerAnalyticsData(params, branchId);
};

const getBranchInvoiceAnalytics = async (branchId, params = {}) => {
  // Similar to getInvoiceAnalyticsData but filtered by branch
  return getInvoiceAnalyticsData(params, branchId);
};

const getRecentActivities = async (days = 7, branch_id = null) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const matchStage = {
    createdAt: { $gte: startDate }
  };

  if (branch_id) {
    matchStage.branch_id = new mongoose.Types.ObjectId(branch_id);
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
  getActivityFeed,
  getPurchaseInvoiceDueData
}; 