const express = require('express');
const router = express.Router();
const gunnyController = require('../controllers/gunnyController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Get all gunny records
router.get('/', gunnyController.getAllGunny);

// Get gunny statistics
router.get('/stats', gunnyController.getGunnyStats);

// Get single gunny record
router.get('/:id', gunnyController.getGunnyById);

// Create new gunny record
router.post('/', gunnyController.createGunny);

// Update gunny record
router.put('/:id', gunnyController.updateGunny);

// Delete gunny record
router.delete('/:id', gunnyController.deleteGunny);

module.exports = router; 