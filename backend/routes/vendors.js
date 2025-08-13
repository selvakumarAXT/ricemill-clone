const express = require('express');
const {
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  getVendorFinancialSummary,
  updateVendorFinancial,
  getVendorStats
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Vendor routes
router.route('/')
  .get(getAllVendors)
  .post(createVendor);

router.route('/stats/overview')
  .get(getVendorStats);

router.route('/:id')
  .get(getVendorById)
  .put(updateVendor)
  .delete(deleteVendor);

router.route('/:id/financial')
  .get(getVendorFinancialSummary)
  .put(updateVendorFinancial);

module.exports = router;
