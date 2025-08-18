const express = require('express');
const router = express.Router();
const {
  getAllQC,
  getQCById,
  createQC,
  updateQC,
  deleteQC,
  getQCStats,
  testQCPerformance
} = require('../controllers/qcController');
const { protect } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(getAllQC)
  .post(createQC); // Remove uploadMultiple middleware for better performance

router.route('/test-performance')
  .post(testQCPerformance);

router.route('/stats')
  .get(getQCStats);

router.route('/:id')
  .get(getQCById)
  .put(uploadMultiple, updateQC) // Keep upload for updates
  .delete(deleteQC);

module.exports = router;

