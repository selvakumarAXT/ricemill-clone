const express = require('express');
const {
  getSalesInvoices,
  getSalesInvoice,
  createSalesInvoice,
  updateSalesInvoice,
  deleteSalesInvoice,
  generateInvoiceNumber,
  printSalesInvoice,
  sendInvoiceEmail,
  getInvoiceStats,
  approveInvoice,
  rejectInvoice,
  markAsPaid,
  calculateTotals,
  validateInvoice
} = require('../controllers/salesInvoiceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Main CRUD routes
router.route('/')
  .get(getSalesInvoices)
  .post(createSalesInvoice);

router.route('/:id')
  .get(getSalesInvoice)
  .put(updateSalesInvoice)
  .delete(deleteSalesInvoice);

// Utility routes
router.route('/generate-number')
  .get(generateInvoiceNumber);

router.route('/stats')
  .get(getInvoiceStats);

router.route('/calculate-totals')
  .post(calculateTotals);

router.route('/validate')
  .post(validateInvoice);

// Action routes
router.route('/:id/print')
  .get(printSalesInvoice);

router.route('/:id/send-email')
  .post(sendInvoiceEmail);

router.route('/:id/approve')
  .post(approveInvoice);

router.route('/:id/reject')
  .post(rejectInvoice);

router.route('/:id/mark-paid')
  .post(markAsPaid);

module.exports = router; 