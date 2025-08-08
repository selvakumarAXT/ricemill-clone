const express = require('express');
const {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentStats,
  getDocumentsByModule
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Document routes
router.route('/')
  .get(getDocuments)
  .post(createDocument);

router.route('/stats/overview')
  .get(getDocumentStats);

router.route('/module/:module')
  .get(getDocumentsByModule);

router.route('/:id')
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

router.route('/:id/download')
  .get(downloadDocument);

module.exports = router; 