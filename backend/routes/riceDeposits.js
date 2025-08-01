const express = require('express');
const router = express.Router();
const riceDepositController = require('../controllers/riceDepositController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Get all rice deposit records
router.get('/', riceDepositController.getAllRiceDeposits);

// Get rice deposit statistics
router.get('/stats', riceDepositController.getRiceDepositStats);

// Get single rice deposit record
router.get('/:id', riceDepositController.getRiceDepositById);

// Create new rice deposit record
router.post('/', riceDepositController.createRiceDeposit);

// Update rice deposit record
router.put('/:id', riceDepositController.updateRiceDeposit);

// Delete rice deposit record
router.delete('/:id', riceDepositController.deleteRiceDeposit);

module.exports = router; 