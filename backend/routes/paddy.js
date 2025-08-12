const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validatePaddyData } = require('../middleware/validation');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const {
  getAllPaddy,
  getPaddyById,
  createPaddy,
  updatePaddy,
  deletePaddy,
  getPaddyStats,
  testPaddyCreation,
  getPaddyCount,
  testPaddyCreate
} = require('../controllers/paddyController');

// Apply authentication middleware to all routes
router.use(protect);

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User: ${req.user?._id}, Branch: ${req.user?.branch_id}`);
  console.log('Request headers:', req.headers);
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
  next();
});

// Test route
router.post('/test', testPaddyCreation);

// Test create route
router.post('/test-create', testPaddyCreate);

// Simple test route without middleware
router.post('/simple-test', (req, res) => {
  console.log('Simple test - Request body:', req.body);
  console.log('Simple test - Files:', req.files);
  
  res.json({
    success: true,
    message: 'Simple test endpoint working',
    body: req.body,
    files: req.files ? Object.keys(req.files) : 'No files',
    headers: req.headers
  });
});

// Fast count route
router.get('/count', getPaddyCount);

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Paddy API is healthy',
    timestamp: new Date().toISOString(),
    user: req.user ? { id: req.user._id, branch_id: req.user.branch_id } : 'No user'
  });
});

// Paddy routes
router.route('/')
  .get(getAllPaddy)
  .post(uploadMultiple('documents', 10), handleUploadError, validatePaddyData, createPaddy);

router.route('/stats')
  .get(getPaddyStats);

router.route('/:id')
  .get(getPaddyById)
  .put(uploadMultiple('documents', 10), handleUploadError, validatePaddyData, updatePaddy)
  .delete(deletePaddy);

module.exports = router; 