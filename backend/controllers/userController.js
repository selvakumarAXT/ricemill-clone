const User = require('../models/User');
const Branch = require('../models/Branch');
const { applyBranchFilter } = require('../middleware/branchFilter');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    let query = User.find({});

    // Apply branch filter if user is not super admin
    if (!req.user.isSuperAdmin && req.branchFilter) {
      query = applyBranchFilter(query, req.branchFilter);
    }

    const users = await query
      .select('-password')
      .populate('branch_id', 'name code')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const { name, email, password, role, branch_id } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Validate branch if provided
    let userBranchId = branch_id;
    
    // If user is not super admin, use their branch
    if (!req.user.isSuperAdmin) {
      userBranchId = req.user.branch_id;
    }

    // Validate branch exists and is active
    if (userBranchId) {
      const branch = await Branch.findById(userBranchId);
      if (!branch || !branch.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or inactive branch'
        });
      }
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      branch_id: userBranchId
    });
    
    // Get populated user data
    const populatedUser = await User.findById(user._id)
      .select('-password')
      .populate('branch_id', 'name code');
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: populatedUser
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const { name, password, role, isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    
    // If password is provided, it will be hashed by the pre-save middleware
    if (password && password.trim() !== '') {
      user.password = password;
    }
    
    await user.save();
    
    // Remove password from response
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    await user.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 