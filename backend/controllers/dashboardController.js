const asyncHandler = require('express-async-handler');
const Paddy = require('../models/Paddy');
const Production = require('../models/Production');
const Gunny = require('../models/Gunny');
const Inventory = require('../models/Inventory');
const RiceDeposit = require('../models/RiceDeposit');
const Branch = require('../models/Branch');
const User = require('../models/User');
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

    // Data collection with actual totals
    const [
      paddyStats,
      productionStats,
      gunnyStats,
      inventoryStats,
      totalBranches,
      totalUsers
    ] = await Promise.all([
      // Total Paddy - sum of weights
      Paddy.aggregate([
        { $group: { _id: null, totalWeight: { $sum: '$paddy.weight' }, totalBags: { $sum: '$paddy.bags' } } }
      ]),
      
      // Total Production - sum of quantities
      Production.aggregate([
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalItems: { $sum: 1 } } }
      ]),
      
      // Total Gunny - sum of bags
      Gunny.aggregate([
        { $group: { _id: null, totalBags: { $sum: { $add: ['$gunny.nb', '$gunny.onb', '$gunny.ss', '$gunny.swp'] } } } }
      ]),
      
      // Total Inventory - sum of quantities
      Inventory.aggregate([
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' }, totalItems: { $sum: 1 } } }
      ]),
      
      // Total Branches
      Branch.countDocuments({ isActive: true }),
      
      // Total Users
      User.countDocuments({ isActive: true })
    ]);

    const totalPaddy = paddyStats[0]?.totalWeight || 0;
    const totalRice = productionStats[0]?.totalQuantity || 0;
    const totalGunny = gunnyStats[0]?.totalBags || 0;
    const totalInventory = inventoryStats[0]?.totalItems || 0;

    console.log('Basic counts collected:', { totalPaddy, totalRice, totalGunny, totalInventory, totalBranches, totalUsers });

    // Calculate dynamic revenue based on paddy weight and estimated price per kg
    const estimatedPricePerKg = 25; // Estimated price per kg of paddy
    const totalRevenue = totalPaddy * estimatedPricePerKg;
    
    // Calculate expenses (assuming 70% of revenue as expenses for rice mill operations)
    const totalExpenses = Math.round(totalRevenue * 0.7);
    const profit = totalRevenue - totalExpenses;
    
    // Calculate dynamic efficiency based on production vs paddy ratio
    const efficiency = totalPaddy > 0 ? Math.round((totalRice / totalPaddy) * 100 * 10) / 10 : 0;
    
    // Calculate dynamic quality score based on production quality
    const qualityData = await Production.aggregate([
      { 
        $group: { 
          _id: null, 
          excellentCount: { $sum: { $cond: [{ $eq: ['$quality', 'Excellent'] }, 1, 0] } },
          goodCount: { $sum: { $cond: [{ $eq: ['$quality', 'Good'] }, 1, 0] } },
          totalCount: { $sum: 1 }
        } 
      }
    ]);
    const qualityScore = qualityData[0]?.totalCount > 0 
      ? Math.round(((qualityData[0].excellentCount * 100 + qualityData[0].goodCount * 80) / qualityData[0].totalCount) * 10) / 10 
      : 0;

    // Calculate dynamic growth based on recent data
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const [recentPaddy, recentProduction] = await Promise.all([
      Paddy.aggregate([
        { $match: { createdAt: { $gte: oneWeekAgo } } },
        { $group: { _id: null, totalWeight: { $sum: '$paddy.weight' } } }
      ]),
      Production.aggregate([
        { $match: { createdAt: { $gte: oneWeekAgo } } },
        { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
      ])
    ]);
    
    const recentPaddyWeight = recentPaddy[0]?.totalWeight || 0;
    const recentProductionQuantity = recentProduction[0]?.totalQuantity || 0;
    
    const growth = {
      paddy: totalPaddy > 0 ? Math.round(((recentPaddyWeight / totalPaddy) * 100) * 10) / 10 : 0,
      rice: totalRice > 0 ? Math.round(((recentProductionQuantity / totalRice) * 100) * 10) / 10 : 0,
      revenue: totalRevenue > 0 ? Math.round(((recentPaddyWeight * 25) / totalRevenue) * 100 * 10) / 10 : 0,
      profit: totalRevenue > 0 ? Math.round(((profit / totalRevenue) * 100) * 10) / 10 : 0
    };

    // Get dynamic branch statistics
    const branchStats = await getBranchStatistics();

    // Get dynamic recent activities
    const recentActivities = await getRecentActivities(5);

    // Get dynamic system alerts
    const alerts = await getSystemAlerts();

    console.log('Dashboard data prepared successfully');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalPaddy: totalPaddy, // Actual weight in kg
          totalRice: totalRice, // Actual quantity in kg
          totalGunny: totalGunny, // Actual bags count
          totalInventory: totalInventory,
          totalBranches,
          totalUsers,
          totalRevenue,
          totalExpenses,
          profit,
          efficiency,
          qualityScore
        },
        growth,
        branchStats,
        recentActivities,
        qualityMetrics: await getQualityMetrics(),
        efficiencyMetrics: await getEfficiencyMetrics(),
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
      paddyStats,
      riceStats,
      gunnyStats,
      inventoryStats,
      recentActivities
    ] = await Promise.all([
      Paddy.aggregate([
        { $match: { branch_id: new mongoose.Types.ObjectId(branchId) } },
        { $group: { _id: null, totalWeight: { $sum: '$paddy.weight' }, totalBags: { $sum: '$paddy.bags' } } }
      ]),
      Production.aggregate([
        { $match: { branch_id: new mongoose.Types.ObjectId(branchId) } },
        { $group: { _id: null, totalWeight: { $sum: '$riceWeight' }, totalBags: { $sum: '$riceBags' } } }
      ]),
      Gunny.aggregate([
        { $match: { branch_id: new mongoose.Types.ObjectId(branchId) } },
        { $group: { _id: null, totalBags: { $sum: { $add: ['$gunny.nb', '$gunny.onb', '$gunny.ss', '$gunny.swp'] } } } }
      ]),
      Inventory.aggregate([
        { $match: { branch_id: new mongoose.Types.ObjectId(branchId) } },
        { $group: { _id: null, totalItems: { $sum: 1 }, totalQuantity: { $sum: '$quantity' } } }
      ]),
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
        stats: {
          totalPaddy: paddyStats[0]?.totalWeight || 0,
          totalRice: riceStats[0]?.totalWeight || 0,
          totalGunny: gunnyStats[0]?.totalBags || 0,
          totalInventory: inventoryStats[0]?.totalItems || 0
        },
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

const getBranchStatistics = async () => {
  const branches = await Branch.find({ isActive: true });
  
  const branchStats = await Promise.all(
    branches.map(async (branch) => {
      const [paddyCount, productionCount, userCount] = await Promise.all([
        Paddy.countDocuments({ branch_id: branch._id }),
        Production.countDocuments({ branch_id: branch._id }),
        User.countDocuments({ branch_id: branch._id, isActive: true })
      ]);

      return {
        id: branch._id,
        name: branch.name,
        millCode: branch.millCode,
        paddyCount,
        productionCount,
        userCount,
        isActive: branch.isActive
      };
    })
  );

  return branchStats;
};

const getQualityMetrics = async () => {
  // Get actual quality metrics from production data
  const qualityData = await Production.aggregate([
    { 
      $group: { 
        _id: null, 
        excellentCount: { $sum: { $cond: [{ $eq: ['$quality', 'Excellent'] }, 1, 0] } },
        goodCount: { $sum: { $cond: [{ $eq: ['$quality', 'Good'] }, 1, 0] } },
        averageCount: { $sum: { $cond: [{ $eq: ['$quality', 'Average'] }, 1, 0] } },
        poorCount: { $sum: { $cond: [{ $eq: ['$quality', 'Poor'] }, 1, 0] } },
        totalCount: { $sum: 1 }
      } 
    }
  ]);

  const data = qualityData[0] || { excellentCount: 0, goodCount: 0, averageCount: 0, poorCount: 0, totalCount: 0 };
  
  const averageQuality = data.totalCount > 0 
    ? Math.round(((data.excellentCount * 100 + data.goodCount * 80 + data.averageCount * 60 + data.poorCount * 40) / data.totalCount) * 10) / 10 
    : 0;

  // Determine quality trend based on recent vs older data
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentQualityData = await Production.aggregate([
    { $match: { createdAt: { $gte: oneWeekAgo } } },
    { 
      $group: { 
        _id: null, 
        excellentCount: { $sum: { $cond: [{ $eq: ['$quality', 'Excellent'] }, 1, 0] } },
        goodCount: { $sum: { $cond: [{ $eq: ['$quality', 'Good'] }, 1, 0] } },
        totalCount: { $sum: 1 }
      } 
    }
  ]);

  const recentData = recentQualityData[0] || { excellentCount: 0, goodCount: 0, totalCount: 0 };
  const recentQuality = recentData.totalCount > 0 
    ? Math.round(((recentData.excellentCount * 100 + recentData.goodCount * 80) / recentData.totalCount) * 10) / 10 
    : 0;

  const qualityTrend = recentQuality > averageQuality ? 'improving' : recentQuality < averageQuality ? 'declining' : 'stable';

  // Get top quality branches
  const branchQualityData = await Production.aggregate([
    {
      $lookup: {
        from: 'branches',
        localField: 'branch_id',
        foreignField: '_id',
        as: 'branch'
      }
    },
    {
      $group: {
        _id: '$branch_id',
        branchName: { $first: { $arrayElemAt: ['$branch.name', 0] } },
        averageQuality: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ['$quality', 'Excellent'] }, then: 100 },
                { case: { $eq: ['$quality', 'Good'] }, then: 80 },
                { case: { $eq: ['$quality', 'Average'] }, then: 60 },
                { case: { $eq: ['$quality', 'Poor'] }, then: 40 }
              ],
              default: 0
            }
          }
        }
      }
    },
    { $sort: { averageQuality: -1 } },
    { $limit: 3 }
  ]);

  const topQualityBranches = branchQualityData.map(branch => branch.branchName || 'Unknown Branch');

  return {
    averageQuality,
    qualityTrend,
    topQualityBranches,
    qualityIssues: data.poorCount + data.averageCount
  };
};

const getEfficiencyMetrics = async () => {
  // Calculate production efficiency based on actual production vs paddy data
  const [totalPaddy, totalProduction] = await Promise.all([
    Paddy.aggregate([
      { $group: { _id: null, totalWeight: { $sum: '$paddy.weight' } } }
    ]),
    Production.aggregate([
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
    ])
  ]);

  const paddyWeight = totalPaddy[0]?.totalWeight || 0;
  const productionQuantity = totalProduction[0]?.totalQuantity || 0;
  
  const overallEfficiency = paddyWeight > 0 ? Math.round((productionQuantity / paddyWeight) * 100 * 10) / 10 : 0;

  // Calculate efficiency trend based on recent data
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const [recentPaddy, recentProduction] = await Promise.all([
    Paddy.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $group: { _id: null, totalWeight: { $sum: '$paddy.weight' } } }
    ]),
    Production.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      { $group: { _id: null, totalQuantity: { $sum: '$quantity' } } }
    ])
  ]);

  const recentPaddyWeight = recentPaddy[0]?.totalWeight || 0;
  const recentProductionQuantity = recentProduction[0]?.totalQuantity || 0;
  
  const recentEfficiency = recentPaddyWeight > 0 ? Math.round((recentProductionQuantity / recentPaddyWeight) * 100 * 10) / 10 : 0;

  const efficiencyTrend = recentEfficiency > overallEfficiency ? 'improving' : recentEfficiency < overallEfficiency ? 'declining' : 'stable';

  // Calculate max and min efficiency from individual production entries
  const efficiencyData = await Production.aggregate([
    {
      $addFields: {
        efficiency: { $multiply: [{ $divide: ['$quantity', 1000] }, 100] } // Assuming 70% conversion rate as baseline
      }
    },
    {
      $group: {
        _id: null,
        maxEfficiency: { $max: '$efficiency' },
        minEfficiency: { $min: '$efficiency' }
      }
    }
  ]);

  return {
    overallEfficiency,
    maxEfficiency: efficiencyData[0]?.maxEfficiency || 75.0,
    minEfficiency: efficiencyData[0]?.minEfficiency || 60.0,
    efficiencyTrend
  };
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

const calculateGrowth = (oldValue, newValue) => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
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
  getActivityFeed
}; 