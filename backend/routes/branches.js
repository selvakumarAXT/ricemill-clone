const express = require('express');
const {
  getAllBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch,
  getMyBranch
} = require('../controllers/branchController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Only superadmin can access any branch management
router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
  .get(getAllBranches)
  .post(createBranch);

router.route('/:id')
  .get(getBranch)
  .put(updateBranch)
  .delete(deleteBranch);

// Current user's branch (for all roles, if needed)
router.get('/my-branch', protect, getMyBranch);

module.exports = router; 