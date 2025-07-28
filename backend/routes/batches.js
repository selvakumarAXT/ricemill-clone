const express = require('express');
const router = express.Router();
const {
  getAllBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
  getActiveBatches
} = require('../controllers/batchController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// GET /api/batches - Get all batches for a branch
router.get('/', getAllBatches);

// GET /api/batches/active - Get active batches for a branch
router.get('/active', getActiveBatches);

// GET /api/batches/:id - Get batch by ID
router.get('/:id', getBatchById);

// POST /api/batches - Create new batch
router.post('/', createBatch);

// PUT /api/batches/:id - Update batch
router.put('/:id', updateBatch);

// DELETE /api/batches/:id - Delete batch
router.delete('/:id', deleteBatch);

module.exports = router; 