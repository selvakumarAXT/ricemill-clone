const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getBagWeightOptions,
  createBagWeightOption,
  updateBagWeightOption,
  deleteBagWeightOption,
  setDefaultBagWeightOption
} = require('../controllers/bagWeightOptionController');

// All routes require authentication
router.use(protect);

// Get bag weight options
router.get('/', getBagWeightOptions);

// Create new bag weight option (admin and superadmin only)
router.post('/', authorize('admin', 'superadmin'), createBagWeightOption);

// Update bag weight option (admin and superadmin only)
router.put('/:id', authorize('admin', 'superadmin'), updateBagWeightOption);

// Delete bag weight option (admin and superadmin only)
router.delete('/:id', authorize('admin', 'superadmin'), deleteBagWeightOption);

// Set default bag weight option (admin and superadmin only)
router.patch('/:id/set-default', authorize('admin', 'superadmin'), setDefaultBagWeightOption);

module.exports = router; 