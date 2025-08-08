const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories with branch-based structure
const createUploadDirectories = (branchId = null) => {
  const baseDir = 'uploads';
  const modules = [
    'users',
    'branches',
    'production',
    'inventory',
    'paddy',
    'rice',
    'gunny',
    'batches',
    'reports',
    'documents',
    'images',
    'sales',
    'financial',
    'qc',
    'vendor'
  ];

  // Create base uploads directory
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir);
  }

  // Create module directories
  modules.forEach(module => {
    const modulePath = path.join(baseDir, module);
    if (!fs.existsSync(modulePath)) {
      fs.mkdirSync(modulePath, { recursive: true });
    }

    // If branchId is provided, create branch-specific subdirectories
    if (branchId) {
      const branchPath = path.join(modulePath, branchId.toString());
      if (!fs.existsSync(branchPath)) {
        fs.mkdirSync(branchPath, { recursive: true });
      }
    }
  });
};

// Call this function to ensure base directories exist
createUploadDirectories();

// Configure storage with branch-based organization
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Extract module and branch information
    const module = req.body.module || req.params.module || req.query.module || 'documents';
    const branchId = req.body.branchId || req.params.branchId || req.query.branchId || req.user?.branchId;
    
    // Determine the upload directory based on module and branch
    let uploadDir = 'uploads/documents'; // default directory
    
    // Map module names to directories
    const moduleMap = {
      'users': 'users',
      'user': 'users',
      'branches': 'branches',
      'branch': 'branches',
      'production': 'production',
      'inventory': 'inventory',
      'paddy': 'paddy',
      'rice': 'rice',
      'ricedeposits': 'rice',
      'gunny': 'gunny',
      'batches': 'batches',
      'batch': 'batches',
      'reports': 'reports',
      'sales': 'sales',
      'salesdispatch': 'sales',
      'financial': 'financial',
      'financialledger': 'financial',
      'qc': 'qc',
      'qcdataentry': 'qc',
      'vendor': 'vendor',
      'vendormanagement': 'vendor',
      'documents': 'documents',
      'general': 'documents',
      'images': 'images'
    };
    
    const moduleDir = moduleMap[module.toLowerCase()] || 'documents';
    
    // Create directory structure: uploads/module/branchId/
    if (branchId) {
      uploadDir = path.join('uploads', moduleDir, branchId.toString());
    } else {
      uploadDir = path.join('uploads', moduleDir);
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Add module prefix for better organization
    const module = req.body.module || req.params.module || req.query.module || 'doc';
    const modulePrefix = module.toLowerCase().substring(0, 3);
    
    cb(null, `${modulePrefix}_${sanitizedName}_${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  
  const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files per request
  }
});

// Single file upload middleware
const uploadSingle = (fieldName) => {
  return upload.single(fieldName);
};

// Multiple files upload middleware
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// Multiple fields upload middleware
const uploadFields = (fields) => {
  return upload.fields(fields);
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 10 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to get file info with branch context
const getFileInfo = (file, branchId = null) => {
  if (!file) return null;
  
  // Extract module from file path
  const pathParts = file.path.split(path.sep);
  const uploadsIndex = pathParts.indexOf('uploads');
  const module = uploadsIndex !== -1 && pathParts[uploadsIndex + 1] ? pathParts[uploadsIndex + 1] : 'documents';
  
  // Build URL based on branch structure
  let url;
  if (branchId) {
    url = `/uploads/${module}/${branchId}/${file.filename}`;
  } else {
    url = `/uploads/${module}/${file.filename}`;
  }
  
  return {
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    module: module,
    branchId: branchId,
    url: url,
    uploadedAt: new Date()
  };
};

// Utility function to get file path by module and branch
const getFilePath = (module, branchId = null, filename = null) => {
  // Map module names to directories (same as in storage)
  const moduleMap = {
    'users': 'users',
    'user': 'users',
    'branches': 'branches',
    'branch': 'branches',
    'production': 'production',
    'inventory': 'inventory',
    'paddy': 'paddy',
    'rice': 'rice',
    'ricedeposits': 'rice',
    'gunny': 'gunny',
    'batches': 'batches',
    'batch': 'batches',
    'reports': 'reports',
    'sales': 'sales',
    'salesdispatch': 'sales',
    'financial': 'financial',
    'financialledger': 'financial',
    'qc': 'qc',
    'qcdataentry': 'qc',
    'vendor': 'vendor',
    'vendormanagement': 'vendor',
    'documents': 'documents',
    'general': 'documents',
    'images': 'images'
  };
  
  const moduleDir = moduleMap[module.toLowerCase()] || 'documents';
  
  if (branchId) {
    return filename ? path.join('uploads', moduleDir, branchId.toString(), filename) : path.join('uploads', moduleDir, branchId.toString());
  }
  return filename ? path.join('uploads', moduleDir, filename) : path.join('uploads', moduleDir);
};

// Utility function to list files by module and branch
const listFilesByModule = (module, branchId = null) => {
  try {
    const dirPath = getFilePath(module, branchId);
    
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    const files = fs.readdirSync(dirPath)
      .filter(file => {
        const filePath = path.join(dirPath, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: branchId ? `/uploads/${module}/${branchId}/${file}` : `/uploads/${module}/${file}`,
          module: module,
          branchId: branchId
        };
      });
    
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
  deleteFile,
  getFileInfo,
  getFilePath,
  listFilesByModule,
  createUploadDirectories
}; 