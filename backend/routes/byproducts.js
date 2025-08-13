const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadMultiple, handleUploadError } = require('../middleware/upload');
const {
  getAllByproductSales,
  getByproductSaleById,
  createByproductSale,
  updateByproductSale,
  deleteByproductSale,
  getByproductStats
} = require('../controllers/byproductSaleController');

// Apply authentication middleware to all routes
router.use(protect);

// Debug middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - User: ${req.user?._id}, Branch: ${req.user?.branch_id}`);
  console.log('Request headers:', req.headers);
  console.log('Request body keys:', Object.keys(req.body || {}));
  console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
  next();
});

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Byproducts API is healthy',
    timestamp: new Date().toISOString(),
    user: req.user ? { id: req.user._id, branch_id: req.user.branch_id } : 'No user'
  });
});

// Byproduct sales routes
router.route('/')
  .get(getAllByproductSales)
  .post(uploadMultiple('documents', 5), handleUploadError, createByproductSale);

router.route('/stats')
  .get(getByproductStats);

router.route('/:id')
  .get(getByproductSaleById)
  .put(uploadMultiple('documents', 5), handleUploadError, updateByproductSale)
  .delete(deleteByproductSale);

module.exports = router;
