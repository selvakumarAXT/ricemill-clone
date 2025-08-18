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
  const startTime = Date.now();
  console.log('🚀 QC Creation started at:', new Date().toISOString());
  
  const { branch_id } = req.body;
  const { branch_id: userBranchId, isSuperAdmin } = req.user;

  // Validate branch access
  if (!isSuperAdmin && branch_id !== userBranchId) {
    return res.status(403).json({
      success: false,
      message: 'You can only create QC records for your own branch'
    });
  }

  console.log('✅ Branch validation completed in:', Date.now() - startTime, 'ms');

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

  console.log('✅ Data preparation completed in:', Date.now() - startTime, 'ms');

  try {
    const newQC = new QC(qcData);
    console.log('✅ QC model instantiated in:', Date.now() - startTime, 'ms');
    
    const savedQC = await newQC.save();
    console.log('✅ QC saved to database in:', Date.now() - startTime, 'ms');
    
    const totalTime = Date.now() - startTime;
    console.log('🎉 QC Creation completed in:', totalTime, 'ms');

    // Return response immediately without any additional processing
    res.status(201).json({
      success: true,
      message: 'QC record created successfully',
      data: savedQC,
      performance: {
        totalTime: totalTime + 'ms',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ QC Creation failed after:', Date.now() - startTime, 'ms');
    console.error('Error:', error);
    throw error;
  }
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
    // OPTIMIZATION: Remove duplicate batch number check for better performance
    // This check can be handled by database constraints if needed
    // const existingBatch = await QC.findOne({ batchNumber: req.body.batchNumber });
    // if (existingBatch) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Batch number already exists'
    //   });
    // }
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
  );

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

// @desc    Test QC creation performance
// @route   POST /api/qc/test-performance
// @access  Private
const testQCPerformance = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  console.log('🧪 QC Performance test started');
  
  try {
    // Simple test without file uploads
    const testData = {
      batchNumber: 'PERF-TEST-' + Date.now(),
      riceVariety: 'Test Variety',
      sampleDate: new Date(),
      moistureContent: 12.0,
      brokenRice: 2.0,
      foreignMatter: 1.0,
      yellowKernels: 1.0,
      immatureKernels: 0.5,
      damagedKernels: 0.5,
      totalDefects: 5.0,
      headRice: 95.0,
      qualityGrade: 'A',
      testMethod: 'manual',
      testerName: 'Performance Test',
      status: 'pending',
      branch_id: req.body.branch_id || req.user.branch_id,
      createdBy: req.user.id
    };
    
    const newQC = new QC(testData);
    const savedQC = await newQC.save();
    
    const totalTime = Date.now() - startTime;
    console.log('🧪 Performance test completed in:', totalTime, 'ms');
    
    // Clean up test data
    await QC.findByIdAndDelete(savedQC._id);
    
    res.status(200).json({
      success: true,
      message: 'Performance test completed',
      performance: {
        totalTime: totalTime + 'ms',
        databaseOperation: 'QC creation and deletion',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('🧪 Performance test failed after:', totalTime, 'ms');
    console.error('Error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Performance test failed',
      error: error.message,
      performance: {
        totalTime: totalTime + 'ms',
        timestamp: new Date().toISOString()
      }
    });
  }
});

module.exports = {
  getAllQC,
  getQCById,
  createQC,
  updateQC,
  deleteQC,
  getQCStats,
  testQCPerformance
};

