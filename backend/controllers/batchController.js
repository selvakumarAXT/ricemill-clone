const Batch = require('../models/Batch');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all batches for a branch
// @route   GET /api/batches
// @access  Private
const getAllBatches = asyncHandler(async (req, res) => {
  const { branch_id } = req.user;
  const { isActive } = req.query;

  // Build query
  const query = { branch_id };
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  const batches = await Batch.find(query)
    .populate('createdBy', 'name email')
    .sort({ startDate: -1 })
    .lean();

  res.json({
    success: true,
    data: batches
  });
});

// @desc    Get batch by ID
// @route   GET /api/batches/:id
// @access  Private
const getBatchById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id } = req.user;

  const batch = await Batch.findOne({ _id: id, branch_id })
    .populate('createdBy', 'name email')
    .lean();

  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }

  res.json({
    success: true,
    data: batch
  });
});

// @desc    Create new batch
// @route   POST /api/batches
// @access  Private
const createBatch = asyncHandler(async (req, res) => {
  const { branch_id, _id: createdBy } = req.user;
  const { name, description, startDate, endDate } = req.body;

  // Validate required fields
  if (!name || !startDate) {
    res.status(400);
    throw new Error('name and startDate are required');
  }

  const batch = await Batch.create({
    name,
    description,
    startDate,
    endDate,
    branch_id,
    createdBy
  });

  const populatedBatch = await Batch.findById(batch._id)
    .populate('createdBy', 'name email')
    .lean();

  res.status(201).json({
    success: true,
    message: 'Batch created successfully',
    data: populatedBatch
  });
});

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private
const updateBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id } = req.user;
  const { name, description, startDate, endDate, isActive } = req.body;

  // Check if batch exists and belongs to user's branch
  const existingBatch = await Batch.findOne({ _id: id, branch_id });
  if (!existingBatch) {
    res.status(404);
    throw new Error('Batch not found');
  }

  const updatedBatch = await Batch.findByIdAndUpdate(
    id,
    { name, description, startDate, endDate, isActive },
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  res.json({
    success: true,
    message: 'Batch updated successfully',
    data: updatedBatch
  });
});

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private
const deleteBatch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Build query - handle superadmin case
  let query = { _id: id };
  
  if (!isSuperAdmin) {
    // Regular users can only delete from their assigned branch
    query.branch_id = branch_id;
  }
  // Superadmin can delete from any branch - no branch restriction needed

  const batch = await Batch.findOneAndDelete(query);
  
  if (!batch) {
    res.status(404);
    throw new Error('Batch not found');
  }

  res.json({
    success: true,
    message: 'Batch deleted successfully'
  });
});

// @desc    Get active batches for a branch
// @route   GET /api/batches/active
// @access  Private
const getActiveBatches = asyncHandler(async (req, res) => {
  const { branch_id } = req.user;

  const batches = await Batch.find({ branch_id, isActive: true })
    .sort({ startDate: -1 })
    .lean();

  res.json({
    success: true,
    data: batches
  });
});

module.exports = {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getActiveBatches
}; 