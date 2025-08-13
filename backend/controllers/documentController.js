const Document = require('../models/Document');
const { asyncHandler } = require('../utils/asyncHandler');
const { deleteFile } = require('../middleware/upload');

// @desc    Get all documents with filtering and pagination
// @route   GET /api/documents
// @access  Private
exports.getDocuments = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    module,
    category,
    fileType,
    status,
    uploadedBy,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  // Branch filter
  if (!req.user.isSuperAdmin) {
    query.branch_id = req.user.branch_id;
  } else if (req.query.branch_id) {
    query.branch_id = req.query.branch_id;
  }

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { remarks: { $regex: search, $options: 'i' } },
      { originalName: { $regex: search, $options: 'i' } },
      { uploadedBy_name: { $regex: search, $options: 'i' } }
    ];
  }

  // Module filter
  if (module) {
    query.module = module;
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // File type filter
  if (fileType) {
    query.fileType = fileType;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Uploaded by filter
  if (uploadedBy) {
    query.uploadedBy = uploadedBy;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let documents = await Document.find(query)
    .populate('branch_id', 'name millCode')
    .populate('uploadedBy', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  // Get total count for pagination
  let total = await Document.countDocuments(query);

  // If searching for specific module or no module filter, also include files from other collections
  if (!module || module === 'all') {
    try {
      // Import models dynamically to avoid circular dependencies
      const Paddy = require('../models/Paddy');
      const Inventory = require('../models/Inventory');
      const Production = require('../models/Production');
      const Rice = require('../models/Rice');
      const Gunny = require('../models/Gunny');
      
      // Get files from Paddy records
      const paddyQuery = { branch_id: query.branch_id || req.user.branch_id };
      if (search) {
        paddyQuery.$or = [
          { issueMemo: { $regex: search, $options: 'i' } },
          { paddyFrom: { $regex: search, $options: 'i' } }
        ];
      }
      
      const paddyFiles = await Paddy.find(paddyQuery)
        .populate('branch_id', 'name millCode')
        .populate('createdBy', 'name email')
        .lean();
      
      // Transform Paddy files to document format
      const paddyDocuments = paddyFiles.flatMap(paddy => 
        (paddy.documents || []).map(doc => ({
          _id: `paddy_${paddy._id}_${doc.filename}`,
          title: doc.originalName || 'Paddy Document',
          description: `Document from Paddy entry: ${paddy.issueMemo}`,
          module: 'paddy',
          category: 'paddy',
          originalName: doc.originalName,
          filename: doc.filename,
          path: doc.path,
          url: doc.url,
          size: doc.size,
          mimetype: doc.mimetype,
          branch_id: paddy.branch_id,
          uploadedBy: paddy.createdBy,
          uploadedBy_name: paddy.createdBy?.name || 'Unknown',
          createdAt: doc.uploadedAt || paddy.createdAt,
          updatedAt: paddy.updatedAt,
          status: 'active',
          source: 'paddy',
          sourceId: paddy._id
        }))
      );
      
      // Add Paddy files to results
      documents = [...documents, ...paddyDocuments];
      total += paddyDocuments.length;
      
      // Sort combined results
      documents.sort((a, b) => {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      });
      
      // Apply pagination to combined results
      documents = documents.slice(skip, skip + parseInt(limit));
      
    } catch (error) {
      console.error('Error fetching files from other modules:', error);
      // Continue with only Document collection results
    }
  }

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.status(200).json({
    success: true,
    data: documents,
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

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id)
    .populate('branch_id', 'name millCode')
    .populate('uploadedBy', 'name email')
    .populate('relatedRecord');

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check branch access
  if (!req.user.isSuperAdmin && document.branch_id._id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: document
  });
});

// @desc    Create new document
// @route   POST /api/documents
// @access  Private
exports.createDocument = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    module,
    category,
    fileType,
    fileName,
    originalName,
    filePath,
    fileUrl,
    fileSize,
    mimeType,
    version,
    remarks,
    tags,
    metadata,
    relatedRecord,
    relatedRecordModel
  } = req.body;

  // Validate required fields
  if (!title || !module || !fileName || !originalName || !filePath || !fileUrl || !fileSize || !mimeType) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields',
      missing: {
        title: !title,
        module: !module,
        fileName: !fileName,
        originalName: !originalName,
        filePath: !filePath,
        fileUrl: !fileUrl,
        fileSize: !fileSize,
        mimeType: !mimeType
      }
    });
  }

  // Set branch_id based on user role
  let branchId = req.body.branch_id;
  if (!req.user.isSuperAdmin) {
    branchId = req.user.branch_id;
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const fileSizeFormatted = formatFileSize(parseInt(fileSize));

  // Create document
  const document = await Document.create({
    title,
    description,
    module,
    category,
    fileType,
    fileName,
    originalName,
    filePath,
    fileUrl,
    fileSize: parseInt(fileSize),
    fileSizeFormatted,
    mimeType,
    version,
    remarks,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    metadata,
    branch_id: branchId,
    uploadedBy: req.user._id,
    uploadedBy_name: req.user.name,
    relatedRecord,
    relatedRecordModel
  });

  // Populate references
  await document.populate('branch_id', 'name millCode');
  await document.populate('uploadedBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    data: document
  });
});

// @desc    Update document
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check branch access
  if (!req.user.isSuperAdmin && document.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Update fields
  const updateFields = [
    'title', 'description', 'category', 'version', 'status', 'remarks', 'tags', 'metadata'
  ];

  updateFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'tags' && typeof req.body[field] === 'string') {
        document[field] = req.body[field].split(',').map(tag => tag.trim());
      } else {
        document[field] = req.body[field];
      }
    }
  });

  // Only superadmin can change module and branch
  if (req.user.isSuperAdmin) {
    if (req.body.module !== undefined) document.module = req.body.module;
    if (req.body.branch_id !== undefined) document.branch_id = req.body.branch_id;
  }

  await document.save();

  // Populate references
  await document.populate('branch_id', 'name millCode');
  await document.populate('uploadedBy', 'name email');

  res.status(200).json({
    success: true,
    message: 'Document updated successfully',
    data: document
  });
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check branch access
  if (!req.user.isSuperAdmin && document.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Delete physical file
  try {
    await deleteFile(document.filePath);
  } catch (error) {
    console.error('Error deleting physical file:', error);
  }

  // Delete from database
  await Document.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Document deleted successfully'
  });
});

// @desc    Download document (increment download count)
// @route   GET /api/documents/:id/download
// @access  Private
exports.downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return res.status(404).json({
      success: false,
      message: 'Document not found'
    });
  }

  // Check branch access
  if (!req.user.isSuperAdmin && document.branch_id.toString() !== req.user.branch_id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Increment download count
  document.downloadCount += 1;
  document.lastDownloadedAt = new Date();
  await document.save();

  res.status(200).json({
    success: true,
    message: 'Download count updated',
    data: {
      downloadUrl: document.fileUrl,
      fileName: document.originalName,
      downloadCount: document.downloadCount
    }
  });
});

// @desc    Get documents by module (including files from other collections)
// @route   GET /api/documents/module/:module
// @access  Private
exports.getDocumentsByModule = asyncHandler(async (req, res) => {
  const { module } = req.params;
  const {
    page = 1,
    limit = 10,
    search,
    category,
    fileType,
    status,
    uploadedBy,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  // Branch filter
  if (!req.user.isSuperAdmin) {
    query.branch_id = req.user.branch_id;
  } else if (req.query.branch_id) {
    query.branch_id = req.query.branch_id;
  }

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { remarks: { $regex: search, $options: 'i' } },
      { originalName: { $regex: search, $options: 'i' } },
      { uploadedBy_name: { $regex: search, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // File type filter
  if (fileType) {
    query.fileType = fileType;
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  // Uploaded by filter
  if (uploadedBy) {
    query.uploadedBy = uploadedBy;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$gte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let documents = [];
  let total = 0;

  // Get documents from Document collection
  if (module === 'all' || !module) {
    const docQuery = { ...query };
    documents = await Document.find(docQuery)
      .populate('branch_id', 'name millCode')
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    total = await Document.countDocuments(docQuery);
  } else if (module === 'paddy') {
    // Get files from Paddy records
    try {
      const Paddy = require('../models/Paddy');
      
      const paddyQuery = { branch_id: query.branch_id || req.user.branch_id };
      if (search) {
        paddyQuery.$or = [
          { issueMemo: { $regex: search, $options: 'i' } },
          { paddyFrom: { $regex: search, $options: 'i' } }
        ];
      }
      
      const paddyFiles = await Paddy.find(paddyQuery)
        .populate('branch_id', 'name millCode')
        .populate('createdBy', 'name email')
        .lean();
      
      // Transform Paddy files to document format
      documents = paddyFiles.flatMap(paddy => 
        (paddy.documents || []).map(doc => ({
          _id: `paddy_${paddy._id}_${doc.filename}`,
          title: doc.originalName || 'Paddy Document',
          description: `Document from Paddy entry: ${paddy.issueMemo}`,
          module: 'paddy',
          category: 'paddy',
          originalName: doc.originalName,
          filename: doc.filename,
          path: doc.path,
          url: doc.url,
          size: doc.size,
          mimetype: doc.mimetype,
          branch_id: paddy.branch_id,
          uploadedBy: paddy.createdBy,
          uploadedBy_name: paddy.createdBy?.name || 'Unknown',
          createdAt: doc.uploadedAt || paddy.createdAt,
          updatedAt: paddy.updatedAt,
          status: 'active',
          source: 'paddy',
          sourceId: paddy._id
        }))
      );
      
      total = documents.length;
      
      // Sort and paginate
      documents.sort((a, b) => {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      });
      
      documents = documents.slice(skip, skip + parseInt(limit));
      
    } catch (error) {
      console.error('Error fetching Paddy files:', error);
      documents = [];
      total = 0;
    }
  } else {
    // Get documents from Document collection for specific module
    query.module = module;
    documents = await Document.find(query)
      .populate('branch_id', 'name millCode')
      .populate('uploadedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    total = await Document.countDocuments(query);
  }

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));

  res.status(200).json({
    success: true,
    data: documents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    }
  });
});

// @desc    Get document statistics
// @route   GET /api/documents/stats/overview
// @access  Private
exports.getDocumentStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, module } = req.query;

  // Build query
  const query = {};

  // Branch filter
  if (!req.user.isSuperAdmin) {
    query.branch_id = req.user.branch_id;
  } else if (req.query.branch_id) {
    query.branch_id = req.query.branch_id;
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Module filter
  if (module) {
    query.module = module;
  }

  // Get statistics
  const [
    totalDocuments,
    totalSize,
    totalDownloads,
    activeDocuments,
    moduleStats,
    categoryStats,
    recentUploads
  ] = await Promise.all([
    Document.countDocuments(query),
    Document.aggregate([
      { $match: query },
      { $group: { _id: null, totalSize: { $sum: '$fileSize' } } }
    ]),
    Document.aggregate([
      { $match: query },
      { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
    ]),
    Document.countDocuments({ ...query, status: 'active' }),
    Document.aggregate([
      { $match: query },
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Document.aggregate([
      { $match: query },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Document.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title module category createdAt uploadedBy_name')
      .lean()
  ]);

  // Format file size
  const totalSizeBytes = totalSize[0]?.totalSize || 0;
  const totalSizeFormatted = formatFileSize(totalSizeBytes);

  res.status(200).json({
    success: true,
    data: {
      totalDocuments,
      totalSize: totalSizeFormatted,
      totalSizeBytes,
      totalDownloads: totalDownloads[0]?.totalDownloads || 0,
      activeDocuments,
      moduleStats,
      categoryStats,
      recentUploads
    }
  });
});



// Helper function to format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
} 