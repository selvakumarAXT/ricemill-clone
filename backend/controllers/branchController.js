const Branch = require('../models/Branch');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private (Super Admin only)
exports.getAllBranches = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin' ) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this resource'
    });
  }
  const branches = await Branch.find({})
    .populate('manager', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: branches.length,
    data: branches
  });
});

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private (Super Admin or Branch Admin)
exports.getBranch = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this resource'
    });
  }
  const branch = await Branch.findById(req.params.id)
    .populate('manager', 'name email role');

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }

  res.status(200).json({
    success: true,
    data: branch
  });
});

// @desc    Create new branch
// @route   POST /api/branches
// @access  Private (Super Admin only)
exports.createBranch = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this resource'
      });
    }
  const {
    name,
    millCode,
    address,
    contactInfo,
    gstn,
    manager,
    settings
  } = req.body;

  // Check if mill code already exists
  const existingBranch = await Branch.findOne({ millCode: millCode.toUpperCase() });
  if (existingBranch) {
    return res.status(400).json({
      success: false,
      message: 'Mill code already exists'
    });
  }

  // Clean up manager field - if it's empty string, set to undefined
  const cleanManager = manager && manager.trim() !== '' ? manager : undefined;

  // Validate manager if provided
  if (cleanManager) {
    const managerUser = await User.findById(cleanManager);
    if (!managerUser) {
      return res.status(400).json({
        success: false,
        message: 'Invalid manager user ID'
      });
    }
    
    if (managerUser.role !== 'admin' && managerUser.role !== 'manager') {
      return res.status(400).json({
        success: false,
        message: 'Manager must have admin or manager role'
      });
    }
  }

  // Clean up contactInfo - ensure phone format is valid
  const cleanContactInfo = {
    ...contactInfo,
    phone: contactInfo?.phone ? contactInfo.phone.replace(/\s+/g, '') : undefined,
    email: contactInfo?.email || undefined
  };

  const branch = await Branch.create({
    name,
    millCode: millCode.toUpperCase(),
    address,
    contactInfo: cleanContactInfo,
    gstn,
    manager: cleanManager,
    settings
  });

  // If manager is assigned, update their branch_id
  if (manager) {
    await User.findByIdAndUpdate(manager, { branch_id: branch._id });
  }

  const populatedBranch = await Branch.findById(branch._id)
    .populate('manager', 'name email role');

  res.status(201).json({
    success: true,
    data: {
      ...populatedBranch.toObject(),
      id: populatedBranch._id
    }
  });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong!'
    });
  }
});

// @desc    Update branch
// @route   PUT /api/branches/:id
// @access  Private (Super Admin only)
exports.updateBranch = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin' ) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this resource'
    });
  }
  let branch = await Branch.findById(req.params.id);

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }

  const { millCode, manager, gstn } = req.body;

  // Check if new millCode conflicts with existing branch
  if (millCode && millCode.toUpperCase() !== branch.millCode) {
    const existingBranch = await Branch.findOne({ 
      millCode: millCode.toUpperCase(),
      _id: { $ne: req.params.id }
    });
    
    if (existingBranch) {
      return res.status(400).json({
        success: false,
        message: 'Mill code already exists'
      });
    }
    req.body.millCode = millCode.toUpperCase();
  }

  // Validate and update manager
  if (manager && manager !== branch.manager?.toString()) {
    // Remove old manager's branch assignment
    if (branch.manager) {
      await User.findByIdAndUpdate(branch.manager, { $unset: { branch_id: 1 } });
    }

    // Validate new manager
    if (manager) {
      const managerUser = await User.findById(manager);
      if (!managerUser) {
        return res.status(400).json({
          success: false,
          message: 'Invalid manager user ID'
        });
      }
      
      if (managerUser.role !== 'admin' && managerUser.role !== 'manager') {
        return res.status(400).json({
          success: false,
          message: 'Manager must have admin or manager role'
        });
      }

      // Assign new manager to branch
      await User.findByIdAndUpdate(manager, { branch_id: req.params.id });
    }
  }

  branch = await Branch.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('manager', 'name email role');

  res.status(200).json({
    success: true,
    data: branch
  });
});

// @desc    Delete branch
// @route   DELETE /api/branches/:id
// @access  Private (Super Admin only)
exports.deleteBranch = asyncHandler(async (req, res) => {
  if (req.user.role !== 'superadmin' ) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to access this resource'
    });
  }
  const branch = await Branch.findById(req.params.id);

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }

  // Delete all users for this branch
  await User.deleteMany({ branch_id: branch._id });

  // TODO: Delete other related data (orders, inventory, etc.) if needed

  await branch.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Branch and all related users deleted successfully'
  });
});

// @desc    Get current user's branch
// @route   GET /api/branches/my-branch
// @access  Private
exports.getMyBranch = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isSuperAdmin) {
    return res.status(200).json({
      success: true,
      message: 'Super admin has access to all branches',
      data: null
    });
  }

  if (!user.branch_id) {
    return res.status(400).json({
      success: false,
      message: 'User is not assigned to any branch'
    });
  }

  const branch = await Branch.findById(user.branch_id)
    .populate('manager', 'name email role');

  if (!branch) {
    return res.status(404).json({
      success: false,
      message: 'Branch not found'
    });
  }

  res.status(200).json({
    success: true,
    data: branch
  });
}); 