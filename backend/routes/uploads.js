const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { 
  uploadSingle, 
  uploadMultiple, 
  uploadFields, 
  handleUploadError, 
  getFileInfo, 
  deleteFile,
  getFilePath,
  listFilesByModule
} = require('../middleware/upload');

const router = express.Router();

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Upload single file with module and branch context
router.post('/upload/single', protect, uploadSingle('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const branchId = req.body.branchId || req.user?.branchId;
    const fileInfo = getFileInfo(req.file, branchId);
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
});

// Upload multiple files with module and branch context
router.post('/upload/multiple', protect, uploadMultiple('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const branchId = req.body.branchId || req.user?.branchId;
    const files = req.files.map(file => getFileInfo(file, branchId));
    
    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files'
    });
  }
});

// Upload files for specific module with branch context
router.post('/upload/:module', protect, uploadMultiple('files', 10), (req, res) => {
  try {
    const { module } = req.params;
    const branchId = req.body.branchId || req.user?.branchId;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => getFileInfo(file, branchId));
    
    res.status(200).json({
      success: true,
      message: `Files uploaded successfully for ${module}`,
      module: module,
      branchId: branchId,
      files: files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files'
    });
  }
});

// Upload files for specific module and branch
router.post('/upload/:module/:branchId', protect, uploadMultiple('files', 10), (req, res) => {
  try {
    const { module, branchId } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => getFileInfo(file, branchId));
    
    res.status(200).json({
      success: true,
      message: `Files uploaded successfully for ${module} in branch ${branchId}`,
      module: module,
      branchId: branchId,
      files: files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files'
    });
  }
});

// Delete file with module and branch context
router.delete('/delete/:module/:filename', protect, (req, res) => {
  try {
    const { module, filename } = req.params;
    const branchId = req.query.branchId || req.user?.branchId;
    
    const filePath = getFilePath(module, branchId, filename);
    
    if (deleteFile(filePath)) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        module: module,
        branchId: branchId,
        filename: filename
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// Delete file with explicit branch
router.delete('/delete/:module/:branchId/:filename', protect, (req, res) => {
  try {
    const { module, branchId, filename } = req.params;
    
    const filePath = getFilePath(module, branchId, filename);
    
    if (deleteFile(filePath)) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
        module: module,
        branchId: branchId,
        filename: filename
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// Get file info with module and branch context
router.get('/info/:module/:filename', protect, (req, res) => {
  try {
    const { module, filename } = req.params;
    const branchId = req.query.branchId || req.user?.branchId;
    
    const filePath = getFilePath(module, branchId, filename);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const fileInfo = {
        filename: filename,
        module: module,
        branchId: branchId,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: branchId ? `/uploads/${module}/${branchId}/${filename}` : `/uploads/${module}/${filename}`
      };
      
      res.status(200).json({
        success: true,
        file: fileInfo
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('File info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting file info'
    });
  }
});

// List files by module with branch context
router.get('/list/:module', protect, (req, res) => {
  try {
    const { module } = req.params;
    const branchId = req.query.branchId || req.user?.branchId;
    
    const files = listFilesByModule(module, branchId);
    
    res.status(200).json({
      success: true,
      module: module,
      branchId: branchId,
      files: files,
      count: files.length
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing files'
    });
  }
});

// List files by module and branch
router.get('/list/:module/:branchId', protect, (req, res) => {
  try {
    const { module, branchId } = req.params;
    
    const files = listFilesByModule(module, branchId);
    
    res.status(200).json({
      success: true,
      module: module,
      branchId: branchId,
      files: files,
      count: files.length
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing files'
    });
  }
});

// List all modules for a branch
router.get('/modules/:branchId', protect, (req, res) => {
  try {
    const { branchId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        modules: [],
        branchId: branchId
      });
    }
    
    const modules = fs.readdirSync(uploadsDir)
      .filter(item => {
        const itemPath = path.join(uploadsDir, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .map(module => {
        const modulePath = path.join(uploadsDir, module);
        const branchPath = path.join(modulePath, branchId);
        const hasBranchFiles = fs.existsSync(branchPath);
        
        return {
          name: module,
          hasBranchFiles: hasBranchFiles,
          fileCount: hasBranchFiles ? fs.readdirSync(branchPath).filter(file => {
            const filePath = path.join(branchPath, file);
            return fs.statSync(filePath).isFile();
          }).length : 0
        };
      });
    
    res.status(200).json({
      success: true,
      modules: modules,
      branchId: branchId
    });
  } catch (error) {
    console.error('List modules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error listing modules'
    });
  }
});

// Get upload statistics for a branch
router.get('/stats/:branchId', protect, (req, res) => {
  try {
    const { branchId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(200).json({
        success: true,
        stats: {
          totalFiles: 0,
          totalSize: 0,
          modules: {}
        },
        branchId: branchId
      });
    }
    
    const modules = fs.readdirSync(uploadsDir)
      .filter(item => {
        const itemPath = path.join(uploadsDir, item);
        return fs.statSync(itemPath).isDirectory();
      });
    
    let totalFiles = 0;
    let totalSize = 0;
    const moduleStats = {};
    
    modules.forEach(module => {
      const branchPath = path.join(uploadsDir, module, branchId);
      
      if (fs.existsSync(branchPath)) {
        const files = fs.readdirSync(branchPath)
          .filter(file => {
            const filePath = path.join(branchPath, file);
            return fs.statSync(filePath).isFile();
          });
        
        const moduleFileCount = files.length;
        const moduleSize = files.reduce((size, file) => {
          const filePath = path.join(branchPath, file);
          return size + fs.statSync(filePath).size;
        }, 0);
        
        moduleStats[module] = {
          fileCount: moduleFileCount,
          totalSize: moduleSize
        };
        
        totalFiles += moduleFileCount;
        totalSize += moduleSize;
      } else {
        moduleStats[module] = {
          fileCount: 0,
          totalSize: 0
        };
      }
    });
    
    res.status(200).json({
      success: true,
      stats: {
        totalFiles: totalFiles,
        totalSize: totalSize,
        modules: moduleStats
      },
      branchId: branchId
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting upload statistics'
    });
  }
});

// Error handling middleware
router.use(handleUploadError);

module.exports = router; 