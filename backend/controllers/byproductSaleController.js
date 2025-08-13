const asyncHandler = require('express-async-handler');
const ByproductSale = require('../models/ByproductSale');

// @desc    Get all byproduct sales
// @route   GET /api/byproducts
// @access  Private
const getAllByproductSales = asyncHandler(async (req, res) => {
  const { branch_id, isSuperAdmin } = req.user;
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    sortBy = 'date', 
    sortOrder = 'desc', 
    branch_id: queryBranchId, 
    material, 
    vendor, 
    startDate, 
    endDate,
    paymentStatus 
  } = req.query;

  console.log('getAllByproductSales called with:', { 
    page, limit, search, sortBy, sortOrder, queryBranchId, material, vendor, startDate, endDate, paymentStatus 
  });

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
      { vehicleNumber: { $regex: search, $options: 'i' } },
      { vendorName: { $regex: search, $options: 'i' } },
      { material: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  // Add material filter
  if (material) {
    query.material = material;
  }

  // Add vendor filter
  if (vendor) {
    query.vendorName = { $regex: vendor, $options: 'i' };
  }

  // Add payment status filter
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  // Add date range filter
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  console.log('Final query:', JSON.stringify(query, null, 2));

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    // Get total count
    const total = await ByproductSale.countDocuments(query);
    
    // Get paginated results
    const byproducts = await ByproductSale.find(query)
      .populate('branch_id', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Calculate pagination info
    const pages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < pages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: byproducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error in getAllByproductSales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch byproduct sales',
      error: error.message
    });
  }
});

// @desc    Get single byproduct sale by ID
// @route   GET /api/byproducts/:id
// @access  Private
const getByproductSaleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  try {
    let query = { _id: id };
    
    if (!isSuperAdmin) {
      query.branch_id = branch_id;
    }

    const byproduct = await ByproductSale.findOne(query)
      .populate('branch_id', 'name')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!byproduct) {
      return res.status(404).json({
        success: false,
        message: 'Byproduct sale not found'
      });
    }

    res.json({
      success: true,
      data: byproduct
    });
  } catch (error) {
    console.error('Error in getByproductSaleById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch byproduct sale',
      error: error.message
    });
  }
});

// @desc    Create new byproduct sale
// @route   POST /api/byproducts
// @access  Private
const createByproductSale = asyncHandler(async (req, res) => {
  const { branch_id, isSuperAdmin } = req.user;
  const { createdBy } = req.user;

  console.log('=== CREATE BYPRODUCT SALE START ===');
  console.log('User info:', { branch_id, createdBy, isSuperAdmin });

  try {
    // Handle FormData - extract byproduct data from form fields
    let byproductData = { ...req.body };
    
    console.log('Raw request body:', byproductData);
    console.log('Files received:', req.files);

    // Prepare byproduct data
    byproductData = {
      ...byproductData,
      createdBy,
    };

    // For superadmin, use the branch_id from request body if provided
    // For regular users, always use their assigned branch_id
    if (isSuperAdmin && req.body.branch_id) {
      byproductData.branch_id = req.body.branch_id;
    } else {
      byproductData.branch_id = branch_id;
    }

    // Convert string values to numbers where appropriate
    if (byproductData.weight) byproductData.weight = parseFloat(byproductData.weight) || 0;
    if (byproductData.rate) byproductData.rate = parseFloat(byproductData.rate) || 0;
    
    // Auto-calculate total amount
    if (byproductData.weight && byproductData.rate) {
      byproductData.totalAmount = byproductData.weight * byproductData.rate;
    }

    // Handle file uploads if any
    if (req.files && req.files.documents) {
      console.log('Files received in createByproductSale:', req.files.documents);
      const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      byproductData.documents = uploadedFiles.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        url: `${req.protocol}://${req.get('host')}/uploads/byproducts/${byproductData.branch_id}/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      }));
      console.log('Processed documents:', byproductData.documents);
    } else {
      console.log('No files received in createByproductSale');
      console.log('req.files:', req.files);
    }

    console.log('Final byproduct data before save:', byproductData);

    // Validate required fields
    if (!byproductData.date || !byproductData.vehicleNumber || !byproductData.material || 
        !byproductData.weight || !byproductData.rate || !byproductData.vendorName || !byproductData.vendorPhone) {
      throw new Error('Missing required fields: date, vehicleNumber, material, weight, rate, vendorName, vendorPhone');
    }

    const byproduct = await ByproductSale.create(byproductData);
    console.log('Byproduct sale created successfully with ID:', byproduct._id);
    
    const populatedByproduct = await ByproductSale.findById(byproduct._id)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name')
      .lean();

    console.log('=== CREATE BYPRODUCT SALE SUCCESS ===');
    res.status(201).json({
      success: true,
      message: 'Byproduct sale created successfully',
      data: populatedByproduct
    });
  } catch (error) {
    console.error('=== CREATE BYPRODUCT SALE ERROR ===');
    console.error('Error in createByproductSale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create byproduct sale',
      error: error.message
    });
  }
});

// @desc    Update byproduct sale
// @route   PUT /api/byproducts/:id
// @access  Private
const updateByproductSale = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  console.log('Raw request body for update:', req.body);
  console.log('Files received for update:', req.files);

  try {
    // Handle FormData - extract byproduct data from form fields
    let updateData = { ...req.body };
    
    // Convert string values to numbers where appropriate
    if (updateData.weight) updateData.weight = parseFloat(updateData.weight) || 0;
    if (updateData.rate) updateData.rate = parseFloat(updateData.rate) || 0;
    
    // Auto-calculate total amount
    if (updateData.weight && updateData.rate) {
      updateData.totalAmount = updateData.weight * updateData.rate;
    }

    console.log('Processed update data:', updateData);

    // Check if byproduct exists and belongs to user's branch
    let query = { _id: id };
    if (!isSuperAdmin) {
      query.branch_id = branch_id;
    }

    const existingByproduct = await ByproductSale.findOne(query);
    if (!existingByproduct) {
      res.status(404);
      throw new Error('Byproduct sale not found');
    }

    // Handle file uploads if any
    if (req.files && req.files.documents) {
      console.log('Files received in updateByproductSale:', req.files.documents);
      const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      updateData.documents = uploadedFiles.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        url: `${req.protocol}://${req.get('host')}/uploads/byproducts/${branch_id}/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      }));
      console.log('Processed documents:', updateData.documents);
    } else {
      console.log('No files received in updateByproductSale');
      console.log('req.files:', req.files);
    }

    // Add updatedBy field
    updateData.updatedBy = req.user.id;

    const updatedByproduct = await ByproductSale.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email')
     .populate('branch_id', 'name');

    console.log('=== UPDATE BYPRODUCT SALE SUCCESS ===');
    res.json({
      success: true,
      message: 'Byproduct sale updated successfully',
      data: updatedByproduct
    });
  } catch (error) {
    console.error('=== UPDATE BYPRODUCT SALE ERROR ===');
    console.error('Error in updateByproductSale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update byproduct sale',
      error: error.message
    });
  }
});

// @desc    Delete byproduct sale
// @route   DELETE /api/byproducts/:id
// @access  Private
const deleteByproductSale = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  try {
    // Build query - handle superadmin case
    let query = { _id: id };
    
    if (!isSuperAdmin) {
      // Regular users can only delete from their assigned branch
      query.branch_id = branch_id;
    }
    // Superadmin can delete from any branch - no branch restriction needed

    const byproduct = await ByproductSale.findOneAndDelete(query);
    
    if (!byproduct) {
      res.status(404);
      throw new Error('Byproduct sale not found');
    }

    console.log('=== DELETE BYPRODUCT SALE SUCCESS ===');
    res.json({
      success: true,
      message: 'Byproduct sale deleted successfully'
    });
  } catch (error) {
    console.error('=== DELETE BYPRODUCT SALE ERROR ===');
    console.error('Error in deleteByproductSale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete byproduct sale',
      error: error.message
    });
  }
});

// @desc    Get byproduct sales statistics
// @route   GET /api/byproducts/stats
// @access  Private
const getByproductStats = asyncHandler(async (req, res) => {
  const { branch_id } = req.user;
  const { startDate, endDate } = req.query;

  try {
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate);
      if (endDate) dateFilter.date.$lte = new Date(endDate);
    }

    const query = { branch_id, ...dateFilter };

    // Get statistics
    const [
      totalRecords,
      totalWeight,
      totalAmount,
      materialStats,
      vendorStats,
      paymentStatusStats
    ] = await Promise.all([
      ByproductSale.countDocuments(query),
      ByproductSale.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$weight' } } }
      ]),
      ByproductSale.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      ByproductSale.getByproductStats(branch_id, startDate, endDate),
      ByproductSale.getVendorStats(branch_id, startDate, endDate),
      ByproductSale.aggregate([
        { $match: query },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalRecords,
        totalWeight: totalWeight[0]?.total || 0,
        totalAmount: totalAmount[0]?.total || 0,
        materialStats,
        vendorStats,
        paymentStatusStats
      }
    });
  } catch (error) {
    console.error('Error in getByproductStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch byproduct statistics',
      error: error.message
    });
  }
});

module.exports = {
  getAllByproductSales,
  getByproductSaleById,
  createByproductSale,
  updateByproductSale,
  deleteByproductSale,
  getByproductStats
};
