const express = require('express');
const {
  getAllProduction,
  getProduction,
  createProduction,
  updateProduction,
  deleteProduction,
  getProductionStats
} = require('../controllers/productionController');

const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);
router.use(authorize('superadmin', 'admin', 'manager'));

// Routes
router.route('/')
  .get(getAllProduction)
  .post(uploadMultiple('documents', 10), createProduction);

router.route('/stats')
  .get(getProductionStats);

router.route('/:id')
  .get(getProduction)
  .put(uploadMultiple('documents', 10), updateProduction)
  .delete(deleteProduction);

// Error handling for uploads
router.use(handleUploadError);

module.exports = router; 