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
    const branchId = req.body.branchId || req.params.branchId || req.query.branchId || req.user?.branch_id || req.user?.branchId;
    
    console.log('📁 Upload destination - Module:', module, 'Branch ID:', branchId);
    
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
    
    console.log('📁 Final upload directory:', uploadDir);
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('📁 Created directory:', uploadDir);
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename - remove all non-alphanumeric characters and limit length
    let sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Limit filename length to prevent filesystem issues
    // Maximum 50 characters for the sanitized name
    if (sanitizedName.length > 50) {
      sanitizedName = sanitizedName.substring(0, 50);
    }
    
    // Remove consecutive underscores
    sanitizedName = sanitizedName.replace(/_+/g, '_');
    
    // Remove leading/trailing underscores
    sanitizedName = sanitizedName.replace(/^_+|_+$/g, '');
    
    // If sanitized name is empty after cleaning, use a default
    if (!sanitizedName) {
      sanitizedName = 'file';
    }
    
    // Add module prefix for better organization
    const module = req.body.module || req.params.module || req.query.module || 'doc';
    const modulePrefix = module.toLowerCase().substring(0, 3);
    
    // Final filename format: modulePrefix_sanitizedName_timestamp.ext
    // This ensures the filename is never too long
    const finalFilename = `${modulePrefix}_${sanitizedName}_${uniqueSuffix}${ext}`;
    
    // Additional safety check - ensure total filename length is reasonable
    if (finalFilename.length > 150) {
      // If still too long, use a shorter version
      const shortName = sanitizedName.substring(0, 20);
      cb(null, `${modulePrefix}_${shortName}_${uniqueSuffix}${ext}`);
    } else {
      cb(null, finalFilename);
    }
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check for extremely long original filenames
  if (file.originalname && file.originalname.length > 200) {
    console.warn(`File with extremely long name rejected: ${file.originalname.substring(0, 100)}...`);
    return cb(new Error('Filename is too long. Please use a shorter filename.'), false);
  }
  
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
    files: 10, // Maximum 10 files per request
    fieldNameSize: 50, // Maximum field name size
    fieldSize: 1024 * 1024, // Maximum field value size (1MB)
    fields: 20 // Maximum number of non-file fields
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
  
  if (error.message.includes('Filename is too long')) {
    return res.status(400).json({
      success: false,
      message: 'Filename is too long. Please use a shorter filename (maximum 200 characters).'
    });
  }
  
  // Log unexpected upload errors
  console.error('Upload error:', error);
  
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
    originalname: file.originalname, // Changed from originalName to originalname to match frontend
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