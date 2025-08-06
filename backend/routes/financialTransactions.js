const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFinancialSummary,
  getTransactionsByCategory,
  getTransactionsByDateRange
} = require('../controllers/financialTransactionController');
const { protect } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Financial transactions routes
router.route('/')
  .get(getAllTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransaction)
  .put(updateTransaction)
  .delete(deleteTransaction);

// Financial summary route
router.get('/summary/financial', getFinancialSummary);

// Transactions by category route
router.get('/category/:category', getTransactionsByCategory);

// Transactions by date range route
router.get('/date-range/transactions', getTransactionsByDateRange);

module.exports = router; 