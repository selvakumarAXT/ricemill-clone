const Paddy = require('../models/Paddy');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// @desc    Get all paddy records
// @route   GET /api/paddy
// @access  Private
const getAllPaddy = asyncHandler(async (req, res) => {
  const { branch_id } = req.user;
  const { page = 1, limit = 10, search = '', sortBy = 'issueDate', sortOrder = 'desc' } = req.query;

  // Build query
  const query = { branch_id };
  
  if (search) {
    query.$or = [
      { issueMemo: { $regex: search, $options: 'i' } },
      { lorryNumber: { $regex: search, $options: 'i' } },
      { paddyFrom: { $regex: search, $options: 'i' } },
      { paddyVariety: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [paddies, total] = await Promise.all([
    Paddy.find(query)
      .populate('createdBy', 'name email')
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
  const { branch_id, _id: createdBy } = req.user;

  
  // Prepare paddy data
  const paddyData = {
    ...req.body,
    branch_id,
    createdBy,
  };

  // Auto-calculate bags from gunny total
  const totalGunny = (paddyData.gunny?.nb || 0) + 
                     (paddyData.gunny?.onb || 0) + 
                     (paddyData.gunny?.ss || 0) + 
                     (paddyData.gunny?.swp || 0);
  
  paddyData.paddy = {
    ...paddyData.paddy,
    bags: totalGunny,
    weight: paddyData.paddy?.weight || (totalGunny * 500) // 1 bag = 500kg
  };

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
  
  updateData.paddy = {
    ...updateData.paddy,
    bags: totalGunny,
    weight: updateData.paddy?.weight || (totalGunny * 500)
  };

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