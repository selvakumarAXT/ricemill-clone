const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private
const getAllInventory = asyncHandler(async (req, res) => {
  const { branch_id } = req.query;
  const { role, branch_id: userBranchId, isSuperAdmin } = req.user;

  let query = {};

  // If user is not superadmin, filter by their branch
  if (!isSuperAdmin) {
    query.branch_id = userBranchId;
  } else if (branch_id && branch_id !== 'all') {
    // If superadmin and specific branch is requested
    query.branch_id = branch_id;
  }

  const inventory = await Inventory.find(query)
    .populate('branch_id', 'name')
    .populate('created_by', 'name')
    .populate('updated_by', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: inventory.length,
    items: inventory
  });
});

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryById = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id)
    .populate('branch_id', 'name')
    .populate('created_by', 'name')
    .populate('updated_by', 'name');

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  // Check if user has access to this inventory item
  const { role, branch_id: userBranchId, isSuperAdmin } = req.user;
  if (!isSuperAdmin && inventory.branch_id.toString() !== userBranchId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    item: inventory
  });
});

// @desc    Create new inventory item
// @route   POST /api/inventory
// @access  Private
const createInventory = asyncHandler(async (req, res) => {
  const { name, quantity, description, branch_id } = req.body;
  const { role, branch_id: userBranchId, isSuperAdmin } = req.user;

  // Validate branch access
  if (!isSuperAdmin && branch_id !== userBranchId) {
    return res.status(403).json({
      success: false,
      message: 'You can only create inventory for your own branch'
    });
  }

  const inventory = await Inventory.create({
    name,
    quantity,
    description,
    branch_id: isSuperAdmin ? branch_id : userBranchId,
    created_by: req.user.id
  });

  const populatedInventory = await Inventory.findById(inventory._id)
    .populate('branch_id', 'name')
    .populate('created_by', 'name');

  res.status(201).json({
    success: true,
    item: populatedInventory
  });
});

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
const updateInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.findById(req.params.id);

  if (!inventory) {
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  // Check if user has access to this inventory item
  const { role, branch_id: userBranchId, isSuperAdmin } = req.user;
  if (!isSuperAdmin && inventory.branch_id.toString() !== userBranchId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const updatedInventory = await Inventory.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      updated_by: req.user.id
    },
    {
      new: true,
      runValidators: true
    }
  ).populate('branch_id', 'name')
   .populate('created_by', 'name')
   .populate('updated_by', 'name');

  res.status(200).json({
    success: true,
    item: updatedInventory
  });
});

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
const deleteInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id: userBranchId, isSuperAdmin } = req.user;

  console.log('=== DELETE INVENTORY DEBUG ===');
  console.log('Request params:', req.params);
  console.log('User info:', { userBranchId, isSuperAdmin });

  // Build query - handle superadmin case
  let query = { _id: id };
  
  if (!isSuperAdmin) {
    // Regular users can only delete from their assigned branch
    query.branch_id = userBranchId;
  }
  // Superadmin can delete from any branch - no branch restriction needed

  console.log('Final delete query:', JSON.stringify(query, null, 2));

  const deletedInventory = await Inventory.findOneAndDelete(query);

  if (!deletedInventory) {
    console.log('No inventory record found with query:', query);
    return res.status(404).json({
      success: false,
      message: 'Inventory item not found'
    });
  }

  console.log('Successfully deleted inventory record:', deletedInventory._id);

  res.status(200).json({
    success: true,
    message: 'Inventory item deleted successfully'
  });
});

module.exports = {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
}; 