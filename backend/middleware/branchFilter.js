const asyncHandler = require('express-async-handler');
const Branch = require('../models/Branch');

// Middleware to add branch filter to queries
const addBranchFilter = asyncHandler(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  // Super admins can access all branches
  if (user.isSuperAdmin) {
    req.branchFilter = {}; // No filter for super admins
    return next();
  }

  // Regular users are filtered by their branch
  if (!user.branch_id) {
    return res.status(400).json({
      success: false,
      message: 'User must be assigned to a branch'
    });
  }

  // Verify branch exists and is active
  const branch = await Branch.findById(user.branch_id);
  if (!branch || !branch.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or inactive branch'
    });
  }

  // Add branch filter to request
  req.branchFilter = { branch_id: user.branch_id };
  req.userBranch = branch;
  
  next();
});

// Middleware to ensure created documents have branch_id
const addBranchToData = (req, res, next) => {
  const user = req.user;

  // Skip for super admins creating branch-specific data
  if (user && !user.isSuperAdmin && user.branch_id) {
    if (req.body) {
      req.body.branch_id = user.branch_id;
    }
  }

  next();
};

// Helper function to apply branch filter to mongoose queries
const applyBranchFilter = (query, branchFilter) => {
  if (branchFilter && Object.keys(branchFilter).length > 0) {
    return query.find(branchFilter);
  }
  return query;
};

// Middleware for admin operations (can access multiple branches with proper permissions)
const requireBranchAccess = (allowedRoles = ['admin']) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Super admins have access to everything
    if (user.isSuperAdmin) {
      return next();
    }

    // Check if user has required role
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // If branch_id is specified in request, verify access
    const requestedBranchId = req.params.branchId || req.query.branchId || req.body.branch_id;
    
    if (requestedBranchId && requestedBranchId !== user.branch_id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to specified branch'
      });
    }

    next();
  });
};

module.exports = {
  addBranchFilter,
  addBranchToData,
  applyBranchFilter,
  requireBranchAccess
}; 