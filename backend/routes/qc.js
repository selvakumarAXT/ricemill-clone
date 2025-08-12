const express = require('express');
const router = express.Router();
const {
  getAllQC,
  getQCById,
  createQC,
  updateQC,
  deleteQC,
  getQCStats
} = require('../controllers/qcController');
const { protect } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(getAllQC)
  .post(uploadMultiple, createQC);

router.route('/stats')
  .get(getQCStats);

router.route('/:id')
  .get(getQCById)
  .put(uploadMultiple, updateQC)
  .delete(deleteQC);

module.exports = router;
