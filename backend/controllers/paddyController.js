const { KG_PER_BAG } = require('../../frontend/src/utils/calculations');
const Paddy = require('../models/Paddy');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// @desc    Get all paddy records
// @route   GET /api/paddy
// @access  Private
const getAllPaddy = asyncHandler(async (req, res) => {
  const { branch_id, isSuperAdmin } = req.user;
  const { page = 1, limit = 10, search = '', sortBy = 'issueDate', sortOrder = 'desc', branch_id: queryBranchId, variety, source, startDate, endDate } = req.query;

  // Build query - handle "all branches" case for superadmin
  let query = {};
  
  if (isSuperAdmin) {
    // For superadmin, if queryBranchId is 'all' or not provided, show all branches
    if (queryBranchId && queryBranchId !== 'all') {
      query.branch_id = queryBranchId;
    }
    // If queryBranchId is 'all' or not provided, don't filter by branch (show all)
  } else {
    // For regular users, always filter by their assigned branch
    query.branch_id = branch_id;
  }
  
  if (search) {
    query.$or = [
      { issueMemo: { $regex: search, $options: 'i' } },
      { lorryNumber: { $regex: search, $options: 'i' } },
      { paddyFrom: { $regex: search, $options: 'i' } },
      { paddyVariety: { $regex: search, $options: 'i' } },
    ];
  }

  // Add variety filter
  if (variety) {
    query.paddyVariety = variety;
  }

  // Add source filter
  if (source) {
    query.paddyFrom = source;
  }

  // Add date range filter
  if (startDate || endDate) {
    query.issueDate = {};
    if (startDate) {
      query.issueDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.issueDate.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [paddies, total] = await Promise.all([
    Paddy.find(query)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Paddy.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: paddies,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get paddy by ID
// @route   GET /api/paddy/:id
// @access  Private
const getPaddyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id } = req.user;

  const paddy = await Paddy.findOne({ _id: id, branch_id })
    .populate('createdBy', 'name email')
    .populate('branch_id', 'name')
    .lean();

  if (!paddy) {
    res.status(404);
    throw new Error('Paddy record not found');
  }

  res.json({
    success: true,
    data: paddy
  });
});

// @desc    Create new paddy record
// @route   POST /api/paddy
// @access  Private
const createPaddy = asyncHandler(async (req, res) => {
  const { branch_id, _id: createdBy, isSuperAdmin } = req.user;

  
  // Prepare paddy data
  const paddyData = {
    ...req.body,
    createdBy,
  };

  // For superadmin, use the branch_id from request body if provided
  // For regular users, always use their assigned branch_id
  if (isSuperAdmin && req.body.branch_id) {
    paddyData.branch_id = req.body.branch_id;
  } else {
    paddyData.branch_id = branch_id;
  }

  // Auto-calculate bags from gunny total
  const totalGunny = (paddyData.gunny?.nb || 0) + 
                     (paddyData.gunny?.onb || 0) + 
                     (paddyData.gunny?.ss || 0) + 
                     (paddyData.gunny?.swp || 0);
  
  // Use provided bagWeight or default to KG_PER_BAG
  const bagWeight = paddyData.bagWeight || KG_PER_BAG;
  
  paddyData.paddy = {
    ...paddyData.paddy,
    bags: totalGunny,
    weight: paddyData.paddy?.weight || (totalGunny * bagWeight)
  };
  
  // Set the bagWeight field
  paddyData.bagWeight = bagWeight;

  const paddy = await Paddy.create(paddyData);
  
  const populatedPaddy = await Paddy.findById(paddy._id)
    .populate('createdBy', 'name email')
    .lean();

  res.status(201).json({
    success: true,
    message: 'Paddy record created successfully',
    data: populatedPaddy
  });
});

// @desc    Update paddy record
// @route   PUT /api/paddy/:id
// @access  Private
const updatePaddy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id } = req.user;

  // Check if paddy exists and belongs to user's branch
  const existingPaddy = await Paddy.findOne({ _id: id, branch_id });
  if (!existingPaddy) {
    res.status(404);
    throw new Error('Paddy record not found');
  }

  // Prepare update data
  const updateData = { ...req.body };
  
  // Auto-calculate bags from gunny total
  const totalGunny = (updateData.gunny?.nb || 0) + 
                     (updateData.gunny?.onb || 0) + 
                     (updateData.gunny?.ss || 0) + 
                     (updateData.gunny?.swp || 0);
  
  // Use provided bagWeight or existing bagWeight or default to KG_PER_BAG
  const bagWeight = updateData.bagWeight || existingPaddy.bagWeight || KG_PER_BAG;
  
  updateData.paddy = {
    ...updateData.paddy,
    bags: totalGunny,
    weight: updateData.paddy?.weight || (totalGunny * bagWeight)
  };
  
  // Set the bagWeight field
  updateData.bagWeight = bagWeight;

  const updatedPaddy = await Paddy.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Paddy record updated successfully',
    data: updatedPaddy
  });
});

// @desc    Delete paddy record
// @route   DELETE /api/paddy/:id
// @access  Private
const deletePaddy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id } = req.user;

  const paddy = await Paddy.findOneAndDelete({ _id: id, branch_id });
  
  if (!paddy) {
    res.status(404);
    throw new Error('Paddy record not found');
  }

  res.json({
    success: true,
    message: 'Paddy record deleted successfully'
  });
});

// @desc    Get paddy statistics
// @route   GET /api/paddy/stats
// @access  Private
const getPaddyStats = asyncHandler(async (req, res) => {
  const { branch_id } = req.user;
  const { startDate, endDate } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.issueDate = {};
    if (startDate) dateFilter.issueDate.$gte = new Date(startDate);
    if (endDate) dateFilter.issueDate.$lte = new Date(endDate);
  }

  const query = { branch_id, ...dateFilter };

  // Create aggregation query with ObjectId for branch_id
  const aggregationQuery = { 
    branch_id: new mongoose.Types.ObjectId(branch_id), 
    ...dateFilter 
  };

  // Get statistics
  const [
    totalRecords,
    totalGunny,
    totalBags,
    totalWeight,
    varietyStats,
    sourceStats
  ] = await Promise.all([
    Paddy.countDocuments(query),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: null, total: { $sum: { $add: ['$gunny.nb', '$gunny.onb', '$gunny.ss', '$gunny.swp'] } } } }
    ]),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: null, total: { $sum: '$paddy.bags' } } }
    ]),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: null, total: { $sum: '$paddy.weight' } } }
    ]),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: '$paddyVariety', count: { $sum: 1 } } }
    ]),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: '$paddyFrom', count: { $sum: 1 } } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      totalRecords,
      totalGunny: totalGunny[0]?.total || 0,
      totalBags: totalBags[0]?.total || 0,
      totalWeight: totalWeight[0]?.total || 0,
      varietyStats,
      sourceStats
    }
  });
});

module.exports = {
  getAllPaddy,
  getPaddyById,
  createPaddy,
  updatePaddy,
  deletePaddy,
  getPaddyStats
}; 