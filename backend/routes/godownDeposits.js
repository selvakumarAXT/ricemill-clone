const express = require('express');
const router = express.Router();
const godownDepositController = require('../controllers/godownDepositController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Get all godown deposit records
router.get('/', godownDepositController.getAllGodownDeposits);

// Get godown deposit statistics
router.get('/stats', godownDepositController.getGodownDepositStats);

// Get single godown deposit record
router.get('/:id', godownDepositController.getGodownDepositById);

// Create new godown deposit record
router.post('/', godownDepositController.createGodownDeposit);

// Update godown deposit record
router.put('/:id', godownDepositController.updateGodownDeposit);

// Delete godown deposit record
router.delete('/:id', godownDepositController.deleteGodownDeposit);

module.exports = router; 