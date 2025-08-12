const asyncHandler = require('express-async-handler');
const QC = require('../models/QC');

// @desc    Get all QC records
// @route   GET /api/qc
// @access  Private
const getAllQC = asyncHandler(async (req, res) => {
  const { branch_id } = req.query;
  const { branch_id: userBranchId, isSuperAdmin } = req.user;

  let query = {};

  // If user is not superadmin, filter by their branch
  if (!isSuperAdmin) {
    query.branch_id = userBranchId;
  } else if (branch_id && branch_id !== 'all') {
    // If superadmin and specific branch is requested
    query.branch_id = branch_id;
  }

  const qcRecords = await QC.find(query)
    .populate('branch_id', 'name')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: qcRecords.length,
    data: qcRecords
  });
});

// @desc    Get single QC record
// @route   GET /api/qc/:id
// @access  Private
const getQCById = asyncHandler(async (req, res) => {
  const qcRecord = await QC.findById(req.params.id)
    .populate('branch_id', 'name')
    .populate('createdBy', 'name email');

  if (!qcRecord) {
    return res.status(404).json({
      success: false,
      message: 'QC record not found'
    });
  }

  // Check if user has access to this QC record
  const { branch_id: userBranchId, isSuperAdmin } = req.user;
  if (!isSuperAdmin && qcRecord.branch_id._id.toString() !== userBranchId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: qcRecord
  });
});

// @desc    Create new QC record
// @route   POST /api/qc
// @access  Private
const createQC = asyncHandler(async (req, res) => {
  const { branch_id } = req.body;
  const { branch_id: userBranchId, isSuperAdmin } = req.user;

  // Validate branch access
  if (!isSuperAdmin && branch_id !== userBranchId) {
    return res.status(403).json({
      success: false,
      message: 'You can only create QC records for your own branch'
    });
  }

  // Check if batch number already exists
  const existingBatch = await QC.findOne({ batchNumber: req.body.batchNumber });
  if (existingBatch) {
    return res.status(400).json({
      success: false,
      message: 'Batch number already exists'
    });
  }

  const qcData = {
    ...req.body,
    branch_id: isSuperAdmin ? branch_id : userBranchId,
    createdBy: req.user.id
  };

  // Handle file uploads if present
  if (req.files && req.files.documents) {
    const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
    qcData.documents = uploadedFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadPath: file.path
    }));
  }

  const newQC = new QC(qcData);
  const savedQC = await newQC.save();

  const populatedQC = await QC.findById(savedQC._id)
    .populate('branch_id', 'name')
    .populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'QC record created successfully',
    data: populatedQC
  });
});

// @desc    Update QC record
// @route   PUT /api/qc/:id
// @access  Private
const updateQC = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id: userBranchId, isSuperAdmin } = req.user;

  // Check if QC record exists and user has access
  const existingQC = await QC.findById(id);
  if (!existingQC) {
    return res.status(404).json({
      success: false,
      message: 'QC record not found'
    });
  }

  if (!isSuperAdmin && existingQC.branch_id.toString() !== userBranchId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if batch number is being changed and if it already exists
  if (req.body.batchNumber && req.body.batchNumber !== existingQC.batchNumber) {
    const existingBatch = await QC.findOne({ batchNumber: req.body.batchNumber });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Batch number already exists'
      });
    }
  }

  const updateData = {
    ...req.body,
    updatedAt: Date.now()
  };

  // Handle file uploads if present
  if (req.files && req.files.documents) {
    const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
    updateData.documents = uploadedFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
      uploadPath: file.path
    }));
  }

  const updatedQC = await QC.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('branch_id', 'name')
   .populate('createdBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'QC record updated successfully',
    data: updatedQC
  });
});

// @desc    Delete QC record
// @route   DELETE /api/qc/:id
// @access  Private
const deleteQC = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id: userBranchId, isSuperAdmin } = req.user;

  console.log('=== DELETE QC DEBUG ===');
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

  const deletedQC = await QC.findOneAndDelete(query);

  if (!deletedQC) {
    console.log('No QC record found with query:', query);
    return res.status(404).json({
      success: false,
      message: 'QC record not found'
    });
  }

  console.log('Successfully deleted QC record:', deletedQC._id);

  res.status(200).json({
    success: true,
    message: 'QC record deleted successfully'
  });
});

// @desc    Get QC statistics
// @route   GET /api/qc/stats
// @access  Private
const getQCStats = asyncHandler(async (req, res) => {
  const { branch_id } = req.query;
  const { branch_id: userBranchId, isSuperAdmin } = req.user;

  // Build match query
  let matchQuery = {};
  
  if (!isSuperAdmin) {
    matchQuery.branch_id = userBranchId;
  } else if (branch_id && branch_id !== 'all') {
    matchQuery.branch_id = branch_id;
  }

  const stats = await QC.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        avgMoistureContent: { $avg: '$moistureContent' },
        avgBrokenRice: { $avg: '$brokenRice' },
        avgForeignMatter: { $avg: '$foreignMatter' },
        avgYellowKernels: { $avg: '$yellowKernels' },
        avgImmatureKernels: { $avg: '$immatureKernels' },
        avgDamagedKernels: { $avg: '$damagedKernels' },
        avgHeadRice: { $avg: '$headRice' },
        avgTotalDefects: { $avg: '$totalDefects' },
        gradeDistribution: {
          A: { $sum: { $cond: [{ $eq: ['$qualityGrade', 'A'] }, 1, 0] } },
          B: { $sum: { $cond: [{ $eq: ['$qualityGrade', 'B'] }, 1, 0] } },
          C: { $sum: { $cond: [{ $eq: ['$qualityGrade', 'C'] }, 1, 0] } },
          D: { $sum: { $cond: [{ $eq: ['$qualityGrade', 'D'] }, 1, 0] } },
          Rejected: { $sum: { $cond: [{ $eq: ['$qualityGrade', 'Rejected'] }, 1, 0] } }
        },
        statusDistribution: {
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          under_review: { $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] } }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalRecords: 0,
      avgMoistureContent: 0,
      avgBrokenRice: 0,
      avgForeignMatter: 0,
      avgYellowKernels: 0,
      avgImmatureKernels: 0,
      avgDamagedKernels: 0,
      avgHeadRice: 0,
      avgTotalDefects: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, Rejected: 0 },
      statusDistribution: { pending: 0, approved: 0, rejected: 0, under_review: 0 }
    }
  });
});

module.exports = {
  getAllQC,
  getQCById,
  createQC,
  updateQC,
  deleteQC,
  getQCStats
};
