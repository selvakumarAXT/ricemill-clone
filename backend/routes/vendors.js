const express = require('express');
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorFinancialSummary,
  updateVendorFinancial,
  getVendorStats,
  addVendorTransaction
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');
const { validateVendorData } = require('../middleware/validation');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// Vendor routes
router.route('/')
  .get(getAllVendors)
  .post(uploadMultiple('documents', 10), handleUploadError, validateVendorData, createVendor);

router.route('/stats/overview')
  .get(getVendorStats);

router.route('/:id')
  .get(getVendorById)
  .put(uploadMultiple('documents', 10), handleUploadError, validateVendorData, updateVendor)
  .delete(deleteVendor);

router.route('/:id/financial')
  .get(getVendorFinancialSummary)
  .put(updateVendorFinancial);

router.route('/:id/transaction')
  .post(addVendorTransaction);

module.exports = router;
