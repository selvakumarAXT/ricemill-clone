const asyncHandler = require('express-async-handler');
const FinancialTransaction = require('../models/FinancialTransaction');

// @desc    Get all financial transactions
// @route   GET /api/financial-transactions
// @access  Private
const getAllTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', sortBy = 'transactionDate', sortOrder = 'desc', branch, category, transactionType, startDate, endDate } = req.query;
  
  // Build query
  const query = {};
  
  // Branch filter
  if (branch && branch !== 'all') {
    query.branch_id = branch;
  } else if (req.user.role !== 'superadmin') {
    query.branch_id = req.user.branch_id;
  }
  
  // Category filter
  if (category) {
    query.category = category;
  }
  
  // Transaction type filter
  if (transactionType) {
    query.transactionType = transactionType;
  }
  
  // Date range filter
  if (startDate && endDate) {
    query.transactionDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  // Search filter
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: 'i' } },
      { reference: { $regex: search, $options: 'i' } },
      { customer: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  // Execute query with pagination
  const skip = (page - 1) * limit;
  
  const [transactions, total] = await Promise.all([
    FinancialTransaction.find(query)
      .populate('branch_id', 'name millCode')
      .populate('createdBy', 'name email')
      .populate('vendor_id', 'vendorName vendorCode vendorType contactPerson phone')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    FinancialTransaction.countDocuments(query)
  ]);
  
  const pages = Math.ceil(total / limit);
  
  res.status(200).json({
    success: true,
    data: transactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages
    }
  });
});

// @desc    Get single financial transaction
// @route   GET /api/financial-transactions/:id
// @access  Private
const getTransaction = asyncHandler(async (req, res) => {
  const transaction = await FinancialTransaction.findById(req.params.id)
    .populate('branch_id', 'name millCode')
    .populate('createdBy', 'name email')
    .populate('vendor_id', 'vendorName vendorCode vendorType contactPerson phone');
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  
  // Check if user has access to this transaction
  if (req.user.role !== 'superadmin' && transaction.branch_id.toString() !== req.user.branch_id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }
  
  res.status(200).json({
    success: true,
    data: transaction
  });
});

// @desc    Create new financial transaction
// @route   POST /api/financial-transactions
// @access  Private
const createTransaction = asyncHandler(async (req, res) => {
  const {
    transactionDate,
    transactionType,
    category,
    description,
    amount,
    paymentMethod,
    reference,
    vendor_id,
    customer,
    status,
    remarks
  } = req.body;
  
  // Set branch_id based on user role
  const branch_id = req.user.role === 'superadmin' ? req.body.branch_id : req.user.branch_id;
  
  if (!branch_id) {
    res.status(400);
    throw new Error('Branch is required');
  }
  
  const transaction = await FinancialTransaction.create({
    transactionDate,
    transactionType,
    category,
    description,
    amount,
    paymentMethod,
    reference,
    vendor_id,
    customer,
    status,
    remarks,
    branch_id,
    createdBy: req.user.id
  });
  
  const populatedTransaction = await FinancialTransaction.findById(transaction._id)
    .populate('branch_id', 'name millCode')
    .populate('createdBy', 'name email')
    .populate('vendor_id', 'vendorName vendorCode vendorType contactPerson phone');
  
  res.status(201).json({
    success: true,
    data: populatedTransaction
  });
});

// @desc    Update financial transaction
// @route   PUT /api/financial-transactions/:id
// @access  Private
const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await FinancialTransaction.findById(req.params.id);
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  
  // Check if user has access to this transaction
  if (req.user.role !== 'superadmin' && transaction.branch_id.toString() !== req.user.branch_id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }
  
  const updatedTransaction = await FinancialTransaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('branch_id', 'name millCode')
   .populate('createdBy', 'name email')
   .populate('vendor_id', 'vendorName vendorCode vendorType contactPerson phone');
  
  res.status(200).json({
    success: true,
    data: updatedTransaction
  });
});

// @desc    Delete financial transaction
// @route   DELETE /api/financial-transactions/:id
// @access  Private
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await FinancialTransaction.findById(req.params.id);
  
  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }
  
  // Check if user has access to this transaction
  if (req.user.role !== 'superadmin' && transaction.branch_id.toString() !== req.user.branch_id.toString()) {
    res.status(403);
    throw new Error('Access denied');
  }
  
  await FinancialTransaction.findByIdAndDelete(req.params.id);
  
  res.status(200).json({
    success: true,
    message: 'Transaction deleted successfully'
  });
});

// @desc    Get financial summary
// @route   GET /api/financial-summary
// @access  Private
const getFinancialSummary = asyncHandler(async (req, res) => {
  const { branch, startDate, endDate } = req.query;
  
  let branchId = branch;
  
  // If not superadmin, use user's branch
  if (req.user.role !== 'superadmin') {
    branchId = req.user.branch_id;
  }
  
  if (!branchId) {
    res.status(400);
    throw new Error('Branch is required');
  }
  
  const summary = await FinancialTransaction.getFinancialSummary(branchId, startDate, endDate);
  
  res.status(200).json({
    success: true,
    data: summary
  });
});

// @desc    Get transactions by category
// @route   GET /api/financial-transactions/category/:category
// @access  Private
const getTransactionsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { branch } = req.query;
  
  let branchId = branch;
  
  // If not superadmin, use user's branch
  if (req.user.role !== 'superadmin') {
    branchId = req.user.branch_id;
  }
  
  if (!branchId) {
    res.status(400);
    throw new Error('Branch is required');
  }
  
  const transactions = await FinancialTransaction.getTransactionsByCategory(branchId, category);
  
  res.status(200).json({
    success: true,
    data: transactions
  });
});

// @desc    Get transactions by date range
// @route   GET /api/financial-transactions/date-range
// @access  Private
const getTransactionsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate, branch } = req.query;
  
  if (!startDate || !endDate) {
    res.status(400);
    throw new Error('Start date and end date are required');
  }
  
  let branchId = branch;
  
  // If not superadmin, use user's branch
  if (req.user.role !== 'superadmin') {
    branchId = req.user.branch_id;
  }
  
  if (!branchId) {
    res.status(400);
    throw new Error('Branch is required');
  }
  
  const transactions = await FinancialTransaction.getTransactionsByDateRange(branchId, startDate, endDate);
  
  res.status(200).json({
    success: true,
    data: transactions
  });
});

module.exports = {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getTransactionsByCategory,
  getTransactionsByDateRange
}; 