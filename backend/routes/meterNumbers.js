const express = require('express');
const router = express.Router();
const meterNumberController = require('../controllers/meterNumberController');
const { protect, authorize } = require('../middleware/auth');

// Apply authentication to all routes
router.use(protect);

// Get all meter numbers (with filtering)
router.get('/', authorize(['admin', 'manager', 'superadmin']), meterNumberController.getMeterNumbers);

// Get active meter numbers for dropdown (used in EB Meter form)
router.get('/active', meterNumberController.getActiveMeterNumbers);

// Get meter number by ID
router.get('/:id', authorize(['admin', 'manager', 'superadmin']), meterNumberController.getMeterNumberById);

// Create new meter number
router.post('/', authorize(['admin', 'manager', 'superadmin']), meterNumberController.createMeterNumber);

// Update meter number
router.put('/:id', authorize(['admin', 'manager', 'superadmin']), meterNumberController.updateMeterNumber);

// Delete meter number
router.delete('/:id', authorize(['admin', 'manager', 'superadmin']), meterNumberController.deleteMeterNumber);

module.exports = router;
