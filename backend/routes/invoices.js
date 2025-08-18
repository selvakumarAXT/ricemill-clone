const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const invoiceController = require('../controllers/invoiceController');

// Generate invoice
router.post('/generate', protect, invoiceController.generateInvoice);

// Preview invoice
router.post('/preview', protect, invoiceController.previewInvoice);

// Download invoice as PDF
router.post('/download', protect, invoiceController.downloadInvoice);

// Get invoice by ID
router.get('/:id', protect, invoiceController.getInvoice);

// Get all invoices
router.get('/', protect, invoiceController.getAllInvoices);

module.exports = router;
