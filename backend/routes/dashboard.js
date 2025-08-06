const express = require('express');
const router = express.Router();
const {
  getSuperadminDashboard,
  getBranchDashboard,
  getActivityFeed
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Routes
router.get('/superadmin', getSuperadminDashboard);
router.get('/branch/:branchId', getBranchDashboard);
router.get('/activities', getActivityFeed);

module.exports = router; 