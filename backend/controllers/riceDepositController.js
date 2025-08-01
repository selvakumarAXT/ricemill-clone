const RiceDeposit = require('../models/RiceDeposit');
const mongoose = require('mongoose');

// Get all rice deposit records
const getAllRiceDeposits = async (req, res) => {
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
    
    const riceDeposits = await RiceDeposit.find(query)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name')
      .sort({ date: -1 });
    
    res.json(riceDeposits);
  } catch (error) {
    console.error('Error fetching rice deposits:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single rice deposit record
const getRiceDepositById = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const riceDeposit = await RiceDeposit.findOne({ _id: id, branch_id })
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
    if (!riceDeposit) {
      return res.status(404).json({ message: 'Rice deposit record not found' });
    }
    
    res.json(riceDeposit);
  } catch (error) {
    console.error('Error fetching rice deposit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new rice deposit record
const createRiceDeposit = async (req, res) => {
  try {
    const { branch_id, _id: userId, isSuperAdmin } = req.user;
    
    const riceDepositData = {
      ...req.body,
      createdBy: userId
    };

    // For superadmin, use the branch_id from request body if provided
    // For regular users, always use their assigned branch_id
    if (isSuperAdmin && req.body.branch_id) {
      riceDepositData.branch_id = req.body.branch_id;
    } else {
      riceDepositData.branch_id = branch_id;
    }
    
    const newRiceDeposit = new RiceDeposit(riceDepositData);
    const savedRiceDeposit = await newRiceDeposit.save();
    
    const populatedRiceDeposit = await RiceDeposit.findById(savedRiceDeposit._id)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
    res.status(201).json(populatedRiceDeposit);
  } catch (error) {
    console.error('Error creating rice deposit:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A record for this date already exists' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update rice deposit record
const updateRiceDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const updatedRiceDeposit = await RiceDeposit.findOneAndUpdate(
      { _id: id, branch_id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
    if (!updatedRiceDeposit) {
      return res.status(404).json({ message: 'Rice deposit record not found' });
    }
    
    res.json(updatedRiceDeposit);
  } catch (error) {
    console.error('Error updating rice deposit:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete rice deposit record
const deleteRiceDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const deletedRiceDeposit = await RiceDeposit.findOneAndDelete({ _id: id, branch_id });
    
    if (!deletedRiceDeposit) {
      return res.status(404).json({ message: 'Rice deposit record not found' });
    }
    
    res.json({ message: 'Rice deposit record deleted successfully' });
  } catch (error) {
    console.error('Error deleting rice deposit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get rice deposit statistics
const getRiceDepositStats = async (req, res) => {
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
    
    const stats = await RiceDeposit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalONB: { $sum: '$gunny.onb' },
          totalSS: { $sum: '$gunny.ss' },
          totalRiceBags: { $sum: '$riceBag' },
          totalRiceWeight: { $sum: '$depositWeight' },
          totalRiceDeposit: { $sum: '$totalRiceDeposit' },
          totalGunnyBags: { $sum: '$gunnyBags' },
          totalGunnyWeight: { $sum: '$gunnyWeight' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(stats[0] || {
      totalONB: 0,
      totalSS: 0,
      totalRiceBags: 0,
      totalRiceWeight: 0,
      totalRiceDeposit: 0,
      totalGunnyBags: 0,
      totalGunnyWeight: 0,
      count: 0
    });
  } catch (error) {
    console.error('Error fetching rice deposit stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllRiceDeposits,
  getRiceDepositById,
  createRiceDeposit,
  updateRiceDeposit,
  deleteRiceDeposit,
  getRiceDepositStats
}; 