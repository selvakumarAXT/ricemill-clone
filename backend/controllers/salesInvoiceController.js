const SalesInvoice = require('../models/SalesInvoice');
const { asyncHandler } = require('../utils/asyncHandler');
const { deleteFile } = require('../middleware/upload');

// @desc    Get all sales invoices with filtering and pagination
// @route   GET /api/sales-invoices
// @access  Private
exports.getSalesInvoices = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    customerName,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    paymentType,
    productType,  // ← Add productType filter
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { isActive: true, isDeleted: false };

  // Branch filter
  if (req.user.role !== 'superadmin') {
    query.branch_id = req.user.branch_id;
  } else if (req.query.branch_id) {
    query.branch_id = req.query.branch_id;
  }

  // Product type filter (NEW)
  if (productType) {
    query.productType = productType;
  }

  // Delivery status filter (NEW)
  if (req.query.deliveryStatus) {
    query.deliveryStatus = req.query.deliveryStatus;
  }

  // Payment status filter (NEW)
  if (req.query.paymentStatus) {
    query.paymentStatus = req.query.paymentStatus;
  }

  // Search filter
  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.contactPerson': { $regex: search, $options: 'i' } },
      { 'customer.phoneNo': { $regex: search, $options: 'i' } },
      { vehicleNumber: { $regex: search, $options: 'i' } }, 
      { productType: { $regex: search, $options: 'i' } }    
    ];
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Customer name filter
  if (customerName) {
    query['customer.name'] = { $regex: customerName, $options: 'i' };
  }

  // Date range filter
  if (startDate || endDate) {
    query.invoiceDate = {};
    if (startDate) query.invoiceDate.$gte = new Date(startDate);
    if (endDate) query.invoiceDate.$lte = new Date(endDate);
  }

  // Amount range filter
  if (minAmount || maxAmount) {
    query['totals.grandTotal'] = {};
    if (minAmount) query['totals.grandTotal'].$gte = parseFloat(minAmount);
    if (maxAmount) query['totals.grandTotal'].$lte = parseFloat(maxAmount);
  }

  // Payment type filter
  if (paymentType) {
    query['payment.paymentType'] = paymentType;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const invoices = await SalesInvoice.find(query)
    .populate('branch_id', 'name')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await SalesInvoice.countDocuments(query);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.status(200).json({
    success: true,
    data: invoices,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage,
      hasPrevPage
    }
  });
});

// @desc    Get single sales invoice
// @route   GET /api/sales-invoices/:id
// @access  Private
exports.getSalesInvoice = asyncHandler(async (req, res) => {
  const invoice = await SalesInvoice.findById(req.params.id)
    .populate('branch_id', 'name')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name');

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Sales invoice not found'
    });
  }

  // Check branch access
  if (req.user.role !== 'superadmin' && invoice.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this invoice'
    });
  }

  res.status(200).json({
    success: true,
    data: invoice
  });
});

// @desc    Create new sales invoice
// @route   POST /api/sales-invoices
// @access  Private
exports.createSalesInvoice = asyncHandler(async (req, res) => {
  // Generate invoice number if not provided
  if (!req.body.invoiceNumber) {
    const lastInvoice = await SalesInvoice.findOne({
      branch_id: req.user.branch_id || req.body.branch_id
    }).sort({ invoiceNumber: -1 });

    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber) || 0;
      nextNumber = lastNumber + 1;
    }

    req.body.invoiceNumber = nextNumber.toString().padStart(3, '0');
  }


  // Auto-set invoice prefix and postfix based on product type and year
  if (!req.body.invoicePrefix) {
    req.body.invoicePrefix = req.body.productType === 'rice' ? 'RICE' : 'BYPROD';
  }
  
  if (!req.body.invoicePostfix) {
    req.body.invoicePostfix = new Date().getFullYear().toString();
  }

  // Set creator information
  req.body.createdBy = req.user._id;
  req.body.createdBy_name = req.user.name;
  req.body.branch_id = req.user.branch_id || req.body.branch_id;

  // Set default due date if not provided
  if (!req.body.dueDate) {
    const invoiceDate = new Date(req.body.invoiceDate || Date.now());
    req.body.dueDate = new Date(invoiceDate.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days from invoice date
  }

  const invoice = await SalesInvoice.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Sales invoice created successfully',
    data: invoice
  });
});

// @desc    Update sales invoice
// @route   PUT /api/sales-invoices/:id
// @access  Private
exports.updateSalesInvoice = asyncHandler(async (req, res) => {
  let invoice = await SalesInvoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Sales invoice not found'
    });
  }

  // Check branch access
  if (req.user.role !== 'superadmin' && invoice.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this invoice'
    });
  }

  // Check if invoice can be updated
  if (invoice.status === 'approved' || invoice.status === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot update approved or paid invoice'
    });
  }

  invoice = await SalesInvoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('branch_id', 'name')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name');

  res.status(200).json({
    success: true,
    message: 'Sales invoice updated successfully',
    data: invoice
  });
});

// @desc    Delete sales invoice
// @route   DELETE /api/sales-invoices/:id
// @access  Private
exports.deleteSalesInvoice = asyncHandler(async (req, res) => {
  const invoice = await SalesInvoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Sales invoice not found'
    });
  }

  // Check branch access
  if (req.user.role !== 'superadmin' && invoice.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this invoice'
    });
  }

  // Check if invoice can be deleted
  if (invoice.status === 'approved' || invoice.status === 'paid') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete approved or paid invoice'
    });
  }

  // Soft delete
  invoice.isDeleted = true;
  invoice.isActive = false;
  await invoice.save();

  res.status(200).json({
    success: true,
    message: 'Sales invoice deleted successfully'
  });
});

// @desc    Generate invoice number
// @route   GET /api/sales-invoices/generate-number
// @access  Private
exports.generateInvoiceNumber = asyncHandler(async (req, res) => {
  const { branch_id, productType } = req.query;
  const targetBranchId = branch_id || req.user.branch_id;

  const lastInvoice = await SalesInvoice.findOne({
    branch_id: targetBranchId,
    ...(productType && { productType })
  }).sort({ invoiceNumber: -1 });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber) || 0;
    nextNumber = lastNumber + 1;
  }

  const invoiceNumber = nextNumber.toString().padStart(3, '0');
  
  // Generate prefix and postfix
  const prefix = productType === 'rice' ? 'RICE' : 'BYPROD';
  const postfix = new Date().getFullYear().toString();
  const formattedInvoiceNumber = `${prefix}${invoiceNumber}${postfix}`;

  res.status(200).json({
    success: true,
    data: { 
      invoiceNumber,
      prefix,
      postfix,
      formattedInvoiceNumber,
      branch_id: targetBranchId,
      productType: productType || 'any'
    }
  });
});

// @desc    Print sales invoice
// @route   GET /api/sales-invoices/:id/print
// @access  Private
exports.printSalesInvoice = asyncHandler(async (req, res) => {
  const { format = 'pdf' } = req.query;
  
  const invoice = await SalesInvoice.findById(req.params.id)
    .populate('branch_id', 'name address phone email')
    .populate('createdBy', 'name')
    .populate('approvedBy', 'name');

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Sales invoice not found'
    });
  }

  // Check branch access
  if (req.user.role !== 'superadmin' && invoice.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to print this invoice'
    });
  }

  try {
    if (format === 'pdf') {
      // Generate PDF
      const pdfGenerator = require('../utils/pdfGenerator');
      const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoice);
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice-${invoice.invoiceNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.send(pdfBuffer);
    } else {
      // Return JSON data for HTML preview
      res.status(200).json({
        success: true,
        message: 'Invoice print data generated successfully',
        data: {
          invoice,
          format,
          printUrl: `/api/sales-invoices/${invoice._id}/print-pdf`
        }
      });
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF'
    });
  }
});

// @desc    Send invoice via email
// @route   POST /api/sales-invoices/:id/send-email
// @access  Private
exports.sendInvoiceEmail = asyncHandler(async (req, res) => {
  const { email, subject, message } = req.body;

  const invoice = await SalesInvoice.findById(req.params.id)
    .populate('branch_id', 'name')
    .populate('createdBy', 'name');

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Sales invoice not found'
    });
  }

  // Check branch access
  if (req.user.role !== 'superadmin' && invoice.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to send this invoice'
    });
  }

  // For now, simulate email sending
  // In a real implementation, you would send email here
  res.status(200).json({
    success: true,
    message: 'Invoice sent via email successfully',
    data: {
      sentTo: email,
      subject: subject || `Invoice ${invoice.invoiceNumber} from ${invoice.branch_id.name}`,
      message: message || 'Please find attached invoice.'
    }
  });
});

// @desc    Get invoice statistics
// @route   GET /api/sales-invoices/stats
// @access  Private
exports.getInvoiceStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, branch_id } = req.query;
  
  // Build query
  const query = { isActive: true, isDeleted: false };

  // Branch filter
  if (req.user.role !== 'superadmin') {
    query.branch_id = req.user.branch_id;
  } else if (branch_id) {
    query.branch_id = branch_id;
  }

  // Date range filter
  if (startDate || endDate) {
    query.invoiceDate = {};
    if (startDate) query.invoiceDate.$gte = new Date(startDate);
    if (endDate) query.invoiceDate.$lte = new Date(endDate);
  }

  // Get basic stats
  const totalInvoices = await SalesInvoice.countDocuments(query);
  const totalAmount = await SalesInvoice.aggregate([
    { $match: query },
    { $group: { _id: null, total: { $sum: '$totals.grandTotal' } } }
  ]);

  // Get status breakdown
  const statusStats = await SalesInvoice.aggregate([
    { $match: query },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Get monthly stats
  const monthlyStats = await SalesInvoice.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          year: { $year: '$invoiceDate' },
          month: { $month: '$invoiceDate' }
        },
        count: { $sum: 1 },
        total: { $sum: '$totals.grandTotal' }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  // Get overdue invoices
  const overdueInvoices = await SalesInvoice.countDocuments({
    ...query,
    status: { $in: ['pending', 'overdue'] },
    dueDate: { $lt: new Date() }
  });

  res.status(200).json({
    success: true,
    data: {
      totalInvoices,
      totalAmount: totalAmount[0]?.total || 0,
      statusStats,
      monthlyStats,
      overdueInvoices
    }
  });
});

// @desc    Approve invoice
// @route   POST /api/sales-invoices/:id/approve
// @access  Private
exports.approveInvoice = asyncHandler(async (req, res) => {
  const { remarks } = req.body;

  const invoice = await SalesInvoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Sales invoice not found'
    });
  }

  // Check branch access
  if (req.user.role !== 'superadmin' && invoice.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to approve this invoice'
    });
  }

  // Check if invoice can be approved
  if (invoice.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending invoices can be approved'
    });
  }

  invoice.status = 'approved';
  invoice.approvedBy = req.user._id;
  invoice.approvedBy_name = req.user.name;
  invoice.approvedAt = new Date();
  await invoice.save();

  res.status(200).json({
    success: true,
    message: 'Sales invoice approved successfully',
    data: invoice
  });
});

// @desc    Reject invoice
// @route   POST /api/sales-invoices/:id/reject
// @access  Private
exports.rejectInvoice = asyncHandler(async (req, res) => {
  const { remarks } = req.body;

  const invoice = await SalesInvoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Sales invoice not found'
    });
  }

  // Check branch access
  if (req.user.role !== 'superadmin' && invoice.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to reject this invoice'
    });
  }

  // Check if invoice can be rejected
  if (invoice.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Only pending invoices can be rejected'
    });
  }

  invoice.status = 'rejected';
  invoice.approvedBy = req.user._id;
  invoice.approvedBy_name = req.user.name;
  invoice.approvedAt = new Date();
  await invoice.save();

  res.status(200).json({
    success: true,
    message: 'Sales invoice rejected successfully',
    data: invoice
  });
});

// @desc    Mark invoice as paid
// @route   POST /api/sales-invoices/:id/mark-paid
// @access  Private
exports.markAsPaid = asyncHandler(async (req, res) => {
  const { paidAmount, paymentMethod, remarks } = req.body;

  const invoice = await SalesInvoice.findById(req.params.id);

  if (!invoice) {
    return res.status(404).json({
      success: false,
      message: 'Sales invoice not found'
    });
  }

  // Check branch access
  if (req.user.role !== 'superadmin' && invoice.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to mark this invoice as paid'
    });
  }

  // Check if invoice can be marked as paid
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Invoice is already paid or cancelled'
    });
  }

  invoice.status = 'paid';
  invoice.isPaid = true;
  invoice.paidAmount = paidAmount || invoice.totals.grandTotal;
  invoice.paidDate = new Date();
  invoice.paymentStatus = 'completed';
  await invoice.save();

  res.status(200).json({
    success: true,
    message: 'Sales invoice marked as paid successfully',
    data: invoice
  });
});

// @desc    Calculate invoice totals
// @route   POST /api/sales-invoices/calculate-totals
// @access  Private
exports.calculateTotals = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      success: false,
      message: 'Items array is required'
    });
  }

  let totalQuantity = 0;
  let totalAmount = 0;
  let totalDiscount = 0;
  let totalIgst = 0;
  let totalCess = 0;

  const calculatedItems = items.map(item => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const igst = parseFloat(item.igstValue) || 0;
    const cess = parseFloat(item.cess) || 0;

    const itemTotal = (qty * price) - discount + igst + cess;

    totalQuantity += qty;
    totalAmount += qty * price;
    totalDiscount += discount;
    totalIgst += igst;
    totalCess += cess;

    return {
      ...item,
      total: itemTotal
    };
  });

  const totalTaxable = totalAmount - totalDiscount;
  const totalTax = totalIgst + totalCess;
  const grandTotal = totalTaxable + totalTax;

  res.status(200).json({
    success: true,
    data: {
      items: calculatedItems,
      totals: {
        totalQuantity,
        totalAmount,
        totalDiscount,
        totalIgst,
        totalCess,
        totalTaxable,
        totalTax,
        grandTotal
      }
    }
  });
});

// @desc    Validate invoice data
// @route   POST /api/sales-invoices/validate
// @access  Private
exports.validateInvoice = asyncHandler(async (req, res) => {
  const errors = [];

  // Validate required fields
  if (!req.body.customer?.name) {
    errors.push('Customer name is required');
  }

  if (!req.body.customer?.placeOfSupply) {
    errors.push('Place of supply is required');
  }

  if (!req.body.payment?.paymentType) {
    errors.push('Payment type is required');
  }

  if (!req.body.items || req.body.items.length === 0) {
    errors.push('At least one item is required');
  } else {
    req.body.items.forEach((item, index) => {
      if (!item.productName) {
        errors.push(`Product name is required for item ${index + 1}`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Valid quantity is required for item ${index + 1}`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`Valid price is required for item ${index + 1}`);
      }
    });
  }

  res.status(200).json({
    success: errors.length === 0,
    message: errors.length === 0 ? 'Invoice data is valid' : 'Invoice data has errors',
    errors
  });
}); 