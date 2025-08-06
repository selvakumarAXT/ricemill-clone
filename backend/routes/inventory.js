const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(getAllInventory)
  .post(createInventory);

router.route('/:id')
  .get(getInventoryById)
  .put(updateInventory)
  .delete(deleteInventory);

module.exports = router; 