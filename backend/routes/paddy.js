const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validatePaddyData } = require('../middleware/validation');
const {
  getAllPaddy,
  getPaddyById,
  createPaddy,
  updatePaddy,
  deletePaddy,
  getPaddyStats
} = require('../controllers/paddyController');

// Apply authentication middleware to all routes
router.use(protect);

// Paddy routes
router.route('/')
  .get(getAllPaddy)
  .post(validatePaddyData, createPaddy);

router.route('/stats')
  .get(getPaddyStats);

router.route('/:id')
  .get(getPaddyById)
  .put(validatePaddyData, updatePaddy)
  .delete(deletePaddy);

module.exports = router; 