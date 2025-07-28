const Production = require('../models/Production');
const { applyBranchFilter } = require('../middleware/branchFilter');

// GET /api/production
exports.getAllProduction = async (req, res) => {
  let query = Production.find({});
  let branchFilter = {};

  if (req.user.isSuperAdmin && req.query.branch_id) {
    branchFilter = { branch_id: req.query.branch_id };
  } else if (!req.user.isSuperAdmin && req.user.branch_id) {
    branchFilter = { branch_id: req.user.branch_id };
  }

  query = applyBranchFilter(query, branchFilter);

  const items = await query.sort({ createdAt: -1 });
  res.json({ success: true, items });
}; 