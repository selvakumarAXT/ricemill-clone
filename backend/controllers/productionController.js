const Production = require('../models/Production');
const { applyBranchFilter } = require('../middleware/branchFilter');

// GET /api/production
exports.getAllProduction = async (req, res) => {
  let query = Production.find({});
  let branchFilter = {};

  if (req.user.isSuperAdmin) {
    // For superadmin, if branch_id is 'all' or not provided, show all branches
    if (req.query.branch_id && req.query.branch_id !== 'all') {
      branchFilter = { branch_id: req.query.branch_id };
    }
    // If branch_id is 'all' or not provided, don't filter by branch (show all)
  } else if (req.user.branch_id) {
    // For regular users, always filter by their assigned branch
    branchFilter = { branch_id: req.user.branch_id };
  }

  query = applyBranchFilter(query, branchFilter);

  const items = await query.sort({ createdAt: -1 });
  res.json({ success: true, items });
}; 