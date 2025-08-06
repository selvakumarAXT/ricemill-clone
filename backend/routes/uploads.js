const express = require('express');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, uploadFields, handleUploadError, getFileInfo, deleteFile } = require('../middleware/upload');

const router = express.Router();

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Upload single file
router.post('/upload/single', protect, uploadSingle('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileInfo = getFileInfo(req.file);
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading file'
    });
  }
});

// Upload multiple files
router.post('/upload/multiple', protect, uploadMultiple('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => getFileInfo(file));
    
    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading files'
    });
  }
});

// Upload files for specific module
router.post('/upload/:module', protect, uploadMultiple('files', 10), (req, res) => {
  try {
    const { module } = req.params;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const files = req.files.map(file => getFileInfo(file));
    
    res.status(200).json({
      success: true,
      message: `Files uploaded successfully for ${module}`,
      module: module,
      files: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading files'
    });
  }
});

// Delete file
router.delete('/delete/:filename', protect, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (deleteFile(filePath)) {
      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// Get file info
router.get('/info/:filename', protect, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const fileInfo = {
        filename: filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        url: `/uploads/${filename}`
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
    res.status(500).json({
      success: false,
      message: 'Error getting file info'
    });
  }
});

// List files in directory
router.get('/list/:module?', protect, (req, res) => {
  try {
    const { module } = req.params;
    const uploadDir = module ? `uploads/${module}` : 'uploads';
    const dirPath = path.join(__dirname, '..', uploadDir);
    
    if (!fs.existsSync(dirPath)) {
      return res.status(404).json({
        success: false,
        message: 'Directory not found'
      });
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
          url: `/${uploadDir}/${file}`
        };
      });
    
    res.status(200).json({
      success: true,
      files: files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error listing files'
    });
  }
});

// Error handling middleware
router.use(handleUploadError);

module.exports = router; 