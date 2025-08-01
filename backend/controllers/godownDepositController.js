const GodownDeposit = require('../models/GodownDeposit');
const mongoose = require('mongoose');

// Get all godown deposit records
const getAllGodownDeposits = async (req, res) => {
  try {
    const { branch_id, isSuperAdmin } = req.user;
    const { branch_id: queryBranchId } = req.query;
    
    // Build query - handle "all branches" case for superadmin
    let query = {};
    
    if (isSuperAdmin) {
      // For superadmin, if queryBranchId is 'all' or not provided, show all branches
      if (queryBranchId && queryBranchId !== 'all') {
        query.branch_id = queryBranchId;
      }
      // If queryBranchId is 'all' or not provided, don't filter by branch (show all)
    } else {
      // For regular users, always filter by their assigned branch
      query.branch_id = branch_id;
    }
    
    const godownDeposits = await GodownDeposit.find(query)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name')
      .sort({ date: -1 });
    
    res.json(godownDeposits);
  } catch (error) {
    console.error('Error fetching godown deposits:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single godown deposit record
const getGodownDepositById = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const godownDeposit = await GodownDeposit.findOne({ _id: id, branch_id })
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
    if (!godownDeposit) {
      return res.status(404).json({ message: 'Godown deposit record not found' });
    }
    
    res.json(godownDeposit);
  } catch (error) {
    console.error('Error fetching godown deposit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new godown deposit record
const createGodownDeposit = async (req, res) => {
  try {
    const { branch_id, _id: userId, isSuperAdmin } = req.user;
    
    const godownDepositData = {
      ...req.body,
      createdBy: userId
    };

    // For superadmin, use the branch_id from request body if provided
    // For regular users, always use their assigned branch_id
    if (isSuperAdmin && req.body.branch_id) {
      godownDepositData.branch_id = req.body.branch_id;
    } else {
      godownDepositData.branch_id = branch_id;
    }
    
    const newGodownDeposit = new GodownDeposit(godownDepositData);
    const savedGodownDeposit = await newGodownDeposit.save();
    
    const populatedGodownDeposit = await GodownDeposit.findById(savedGodownDeposit._id)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
    res.status(201).json(populatedGodownDeposit);
  } catch (error) {
    console.error('Error creating godown deposit:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A record for this date already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update godown deposit record
const updateGodownDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const updatedGodownDeposit = await GodownDeposit.findOneAndUpdate(
      { _id: id, branch_id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
    if (!updatedGodownDeposit) {
      return res.status(404).json({ message: 'Godown deposit record not found' });
    }
    
    res.json(updatedGodownDeposit);
  } catch (error) {
    console.error('Error updating godown deposit:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete godown deposit record
const deleteGodownDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const deletedGodownDeposit = await GodownDeposit.findOneAndDelete({ _id: id, branch_id });
    
    if (!deletedGodownDeposit) {
      return res.status(404).json({ message: 'Godown deposit record not found' });
    }
    
    res.json({ message: 'Godown deposit record deleted successfully' });
  } catch (error) {
    console.error('Error deleting godown deposit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get godown deposit statistics
const getGodownDepositStats = async (req, res) => {
  try {
    const { branch_id, isSuperAdmin } = req.user;
    const { branch_id: queryBranchId } = req.query;
    
    // Build match query
    let matchQuery = {};
    
    if (isSuperAdmin) {
      if (queryBranchId && queryBranchId !== 'all') {
        matchQuery.branch_id = new mongoose.Types.ObjectId(queryBranchId);
      }
    } else {
      matchQuery.branch_id = new mongoose.Types.ObjectId(branch_id);
    }
    
    const stats = await GodownDeposit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalONB: { $sum: '$gunny.onb' },
          totalSS: { $sum: '$gunny.ss' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(stats[0] || {
      totalONB: 0,
      totalSS: 0,
      count: 0
    });
  } catch (error) {
    console.error('Error fetching godown deposit stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllGodownDeposits,
  getGodownDepositById,
  createGodownDeposit,
  updateGodownDeposit,
  deleteGodownDeposit,
  getGodownDepositStats
}; 