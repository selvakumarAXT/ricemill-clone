const Vendor = require('../models/Vendor');
const FinancialTransaction = require('../models/FinancialTransaction');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// @desc    Get all vendors with financial summary
// @route   GET /api/vendors
// @access  Private
const getAllVendors = asyncHandler(async (req, res) => {
  const { branch_id, isSuperAdmin } = req.user;
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    vendorType = '', 
    status = '',
    balanceStatus = '',
    sortBy = 'vendorName', 
    sortOrder = 'asc' 
  } = req.query;

  // Build query
  let query = {};
  
  if (isSuperAdmin) {
    if (req.query.branch_id && req.query.branch_id !== 'all') {
      query.branch_id = req.query.branch_id;
    }
  } else {
    query.branch_id = branch_id;
  }
  
  if (search) {
    query.$or = [
      { vendorName: { $regex: search, $options: 'i' } },
      { vendorCode: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
      { gstNumber: { $regex: search, $options: 'i' } },
      { panNumber: { $regex: search, $options: 'i' } },
      { placeOfSupply: { $regex: search, $options: 'i' } }
    ];
  }

  if (vendorType) {
    query.vendorType = vendorType;
  }

  if (status) {
    query.status = status;
  }

  // Filter by balance status
  if (balanceStatus) {
    switch (balanceStatus) {
      case 'settled':
        query.currentBalance = 0;
        break;
      case 'vendor_owes_us':
        query.currentBalance = { $gt: 0 };
        break;
      case 'we_owe_vendor':
        query.currentBalance = { $lt: 0 };
        break;
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const vendors = await Vendor.find(query)
    .populate('branch_id', 'name millCode')
    .populate('createdBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  const total = await Vendor.countDocuments(query);

  // Calculate financial summary
  const financialSummary = await Vendor.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalVendors: { $sum: 1 },
        totalBalance: { $sum: '$currentBalance' },
        totalPaymentsGiven: { $sum: '$totalPaymentsGiven' },
        totalPaymentsReceived: { $sum: '$totalPaymentsReceived' },
        totalCreditLimit: { $sum: '$creditLimit' },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  res.json({
    success: true,
    data: vendors,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    },
    summary: financialSummary[0] || {
      totalVendors: 0,
      totalBalance: 0,
      totalPaymentsGiven: 0,
      totalPaymentsReceived: 0,
      totalCreditLimit: 0,
      avgRating: 0
    }
  });
});

// @desc    Get vendor by ID with financial details
// @route   GET /api/vendors/:id
// @access  Private
const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Vendor ID format');
  }

  let query = { _id: id };
  
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const vendor = await Vendor.findOne(query)
    .populate('branch_id', 'name millCode')
    .populate('createdBy', 'name email');

  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Get financial transactions for this vendor
  const transactions = await FinancialTransaction.find({
    vendor: id,
    branch_id: vendor.branch_id
  })
  .sort({ transactionDate: -1 })
  .limit(20)
  .lean();

  res.json({
    success: true,
    data: {
      ...vendor.toObject(),
      transactions
    }
  });
});

// @desc    Create new vendor
// @route   POST /api/vendors
// @access  Private
const createVendor = asyncHandler(async (req, res) => {
  const { branch_id, _id: createdBy, isSuperAdmin } = req.user;

  // Handle FormData - extract vendor data from form fields
  let vendorData = { ...req.body };
  
  // Handle nested objects if any
  if (req.body.gunny && typeof req.body.gunny === 'object') {
    vendorData.gunny = { ...req.body.gunny };
  }
  
  // Convert string values to numbers where appropriate
  if (vendorData.creditLimit) vendorData.creditLimit = parseFloat(vendorData.creditLimit) || 0;
  if (vendorData.rating) vendorData.rating = parseInt(vendorData.rating) || 5;
  
  // Prepare vendor data
  vendorData = {
    ...vendorData,
    createdBy,
    branch_id: isSuperAdmin && req.body.branch_id ? req.body.branch_id : branch_id
  };

  // Handle file uploads if any
  if (req.files && req.files.documents) {
    const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
    vendorData.documents = uploadedFiles.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      url: `${req.protocol}://${req.get('host')}/uploads/vendors/${vendorData.branch_id}/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));
  }

  const vendor = await Vendor.create(vendorData);
  
  const populatedVendor = await Vendor.findById(vendor._id)
    .populate('createdBy', 'name email')
    .populate('branch_id', 'name millCode')
    .lean();

  res.status(201).json({
    success: true,
    message: 'Vendor created successfully',
    data: populatedVendor
  });
});

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private
const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Vendor ID format');
  }

  let query = { _id: id };
  
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const existingVendor = await Vendor.findOne(query);
  if (!existingVendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Handle FormData - extract vendor data from form fields
  let updateData = { ...req.body };
  
  // Convert string values to numbers where appropriate
  if (updateData.creditLimit) updateData.creditLimit = parseFloat(updateData.creditLimit) || 0;
  if (updateData.rating) updateData.rating = parseInt(updateData.rating) || 5;

  // Handle file uploads if any
  if (req.files && req.files.documents) {
    const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
    updateData.documents = uploadedFiles.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      url: `${req.protocol}://${req.get('host')}/uploads/vendors/${existingVendor.branch_id}/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email').populate('branch_id', 'name millCode');

  res.json({
    success: true,
    message: 'Vendor updated successfully',
    data: updatedVendor
  });
});

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private
const deleteVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Vendor ID format');
  }

  let query = { _id: id };
  
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const vendor = await Vendor.findOneAndDelete(query);
  
  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  res.json({
    success: true,
    message: 'Vendor deleted successfully'
  });
});

// @desc    Add financial transaction for vendor
// @route   POST /api/vendors/:id/transaction
// @access  Private
const addVendorTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;
  const { amount, type, reference, description, remarks } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Vendor ID format');
  }

  // Validate required fields
  if (!amount || !type) {
    res.status(400);
    throw new Error('Amount and transaction type are required');
  }

  if (!['payment_given', 'payment_received', 'credit', 'debit', 'adjustment'].includes(type)) {
    res.status(400);
    throw new Error('Invalid transaction type');
  }

  let query = { _id: id };
  
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const vendor = await Vendor.findOne(query);
  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Create transaction record
  const transaction = {
    date: new Date(),
    amount: parseFloat(amount),
    type,
    reference: reference || '',
    description: description || '',
    remarks: remarks || '',
    transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };

  // Update vendor financials based on transaction type
  let updateData = {
    $push: { paymentHistory: transaction }
  };

  switch (type) {
    case 'payment_given':
      updateData.$inc = { totalPaymentsGiven: parseFloat(amount) };
      break;
    case 'payment_received':
      updateData.$inc = { totalPaymentsReceived: parseFloat(amount) };
      break;
    case 'credit':
      updateData.$inc = { totalPaymentsReceived: parseFloat(amount) };
      break;
    case 'debit':
      updateData.$inc = { totalPaymentsGiven: parseFloat(amount) };
      break;
    case 'adjustment':
      // For adjustments, we need to specify whether it's positive or negative
      if (req.body.adjustmentType === 'positive') {
        updateData.$inc = { totalPaymentsReceived: parseFloat(amount) };
      } else {
        updateData.$inc = { totalPaymentsGiven: parseFloat(amount) };
      }
      break;
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email').populate('branch_id', 'name millCode');

  res.json({
    success: true,
    message: 'Transaction added successfully',
    data: {
      vendor: updatedVendor,
      transaction
    }
  });
});

// @desc    Get vendor financial summary
// @route   GET /api/vendors/:id/financial
// @access  Private
const getVendorFinancialSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Vendor ID format');
  }

  let query = { _id: id };
  
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const vendor = await Vendor.findOne(query);
  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Get recent transactions
  const recentTransactions = vendor.paymentHistory
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // Calculate summary
  const summary = {
    currentBalance: vendor.currentBalance,
    totalPaymentsGiven: vendor.totalPaymentsGiven,
    totalPaymentsReceived: vendor.totalPaymentsReceived,
    balanceStatus: vendor.balanceStatus,
    creditLimit: vendor.creditLimit,
    creditUtilization: vendor.creditUtilization,
    recentTransactions
  };

  res.json({
    success: true,
    data: summary
  });
});

// @desc    Update vendor financial status
// @route   PUT /api/vendors/:id/financial
// @access  Private
const updateVendorFinancial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;
  const { amount, type, reference, remarks } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Vendor ID format');
  }

  let query = { _id: id };
  
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const vendor = await Vendor.findOne(query);
  if (!vendor) {
    res.status(404);
    throw new Error('Vendor not found');
  }

  // Update financial amounts based on transaction type
  if (type === 'payment') {
    vendor.totalPaid += parseFloat(amount);
  } else if (type === 'credit') {
    vendor.totalAmount += parseFloat(amount);
  } else if (type === 'adjustment') {
    vendor.totalAmount += parseFloat(amount);
  }

  // Add to payment history
  vendor.paymentHistory.push({
    date: new Date(),
    amount: parseFloat(amount),
    type,
    reference,
    remarks
  });

  // Update last payment date if it's a payment
  if (type === 'payment') {
    vendor.lastPaymentDate = new Date();
  }

  await vendor.save();

  // Create financial transaction record
  const transaction = await FinancialTransaction.create({
    transactionDate: new Date(),
    transactionType: type === 'payment' ? 'expense' : 'income',
    category: 'vendor',
    description: `${type} for vendor ${vendor.vendorName}`,
    amount: parseFloat(amount),
    paymentMethod: 'bank_transfer',
    reference,
    vendor: id,
    status: 'completed',
    remarks,
    branch_id: vendor.branch_id,
    createdBy: req.user._id
  });

  res.json({
    success: true,
    message: 'Vendor financial status updated successfully',
    data: {
      vendor: vendor.toObject(),
      transaction: transaction.toObject()
    }
  });
});

// @desc    Get vendor statistics
// @route   GET /api/vendors/stats/overview
// @access  Private
const getVendorStats = asyncHandler(async (req, res) => {
  const { branch_id, isSuperAdmin } = req.user;
  const { startDate, endDate } = req.query;

  // Build query
  let query = {};
  
  if (isSuperAdmin) {
    if (req.query.branch_id && req.query.branch_id !== 'all') {
      query.branch_id = req.query.branch_id;
    }
  } else {
    query.branch_id = branch_id;
  }

  // Add date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Get vendor statistics
  const [
    totalVendors,
    activeVendors,
    totalOutstanding,
    totalCreditLimit,
    vendorTypeStats,
    paymentStatusStats,
    topVendors
  ] = await Promise.all([
    Vendor.countDocuments(query),
    Vendor.countDocuments({ ...query, status: 'active' }),
    Vendor.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$outstandingBalance' } } }
    ]),
    Vendor.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$creditLimit' } } }
    ]),
    Vendor.aggregate([
      { $match: query },
      { $group: { _id: '$vendorType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Vendor.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$outstandingBalance', 0] },
              'paid',
              {
                $cond: [
                  { $lte: ['$outstandingBalance', { $multiply: ['$creditLimit', 0.5] }] },
                  'good',
                  {
                    $cond: [
                      { $lte: ['$outstandingBalance', { $multiply: ['$creditLimit', 0.8] }] },
                      'warning',
                      'critical'
                    ]
                  }
                ]
              }
            ]
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Vendor.find(query)
      .sort({ outstandingBalance: -1 })
      .limit(5)
      .select('vendorName vendorCode outstandingBalance totalAmount')
      .lean()
  ]);

  res.json({
    success: true,
    data: {
      totalVendors,
      activeVendors,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      totalCreditLimit: totalCreditLimit[0]?.total || 0,
      vendorTypeStats,
      paymentStatusStats,
      topVendors
    }
  });
});

module.exports = {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorFinancialSummary,
  updateVendorFinancial,
  getVendorStats,
  addVendorTransaction
};
