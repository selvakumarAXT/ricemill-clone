const { RiceDeposit } = require('../models/RiceDeposit');
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

    // Validate that paddyReference is provided
    if (!riceDepositData.paddyReference) {
      return res.status(400).json({ 
        message: 'Paddy reference is required. Please select a paddy record to link this rice deposit.' 
      });
    }
    
    const newRiceDeposit = new RiceDeposit(riceDepositData);
    
    // Calculate bill amount if rate is provided
    if (req.body.billRate && req.body.billRate > 0) {
      newRiceDeposit.calculateBillAmount(req.body.billRate);
    }
    
    const savedRiceDeposit = await newRiceDeposit.save();
    
    const populatedRiceDeposit = await RiceDeposit.findById(savedRiceDeposit._id)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name')
      .populate('paddyReference', 'issueMemo lorryNumber paddyFrom paddyVariety gunny');
    
    res.status(201).json(populatedRiceDeposit);
  } catch (error) {
    console.error('Error creating rice deposit:', error);
    if (error.code === 11000) {
      // Handle duplicate key errors
      const keyPattern = error.keyPattern;
      if (keyPattern && keyPattern.date && keyPattern.branch_id) {
        return res.status(400).json({ message: 'A record for this date already exists in this branch' });
      } else if (keyPattern && keyPattern.month && keyPattern.branch_id) {
        return res.status(400).json({ message: 'A record for this month already exists in this branch' });
      } else {
        return res.status(400).json({ message: 'A duplicate record already exists' });
      }
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    // Handle custom gunny validation errors
    if (error.message && error.message.includes('Gunny count')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message && error.message.includes('Total gunny usage')) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message && error.message.includes('Referenced paddy record')) {
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
    const { branch_id, isSuperAdmin } = req.user;
    
    // Build query - handle superadmin case
    let query = { _id: id };
    
    if (!isSuperAdmin) {
      // Regular users can only delete from their assigned branch
      query.branch_id = branch_id;
    }
    // Superadmin can delete from any branch - no branch restriction needed
    
    console.log('=== DELETE RICE DEPOSIT DEBUG ===');
    console.log('Request params:', req.params);
    console.log('User info:', { branch_id, isSuperAdmin });
    console.log('Final delete query:', JSON.stringify(query, null, 2));
    
    const deletedRiceDeposit = await RiceDeposit.findOneAndDelete(query);
    
    if (!deletedRiceDeposit) {
      console.log('No rice deposit record found with query:', query);
      return res.status(404).json({ message: 'Rice deposit record not found' });
    }
    
    console.log('Successfully deleted rice deposit record:', deletedRiceDeposit._id);
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
    const { branch_id: queryBranchId, startDate, endDate } = req.query;
    
    // Build match query
    let matchQuery = {};
    
    if (isSuperAdmin) {
      if (queryBranchId && queryBranchId !== 'all') {
        matchQuery.branch_id = new mongoose.Types.ObjectId(queryBranchId);
      }
    } else {
      matchQuery.branch_id = new mongoose.Types.ObjectId(branch_id);
    }
    
    // Add date range filter if provided
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
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
          count: { $sum: 1 },
          // Rice output calculation stats
          totalRiceOutputBags: { $sum: '$riceOutputCalculation.totalRiceBags' },
          totalRiceOutputWeight: { $sum: '$riceOutputCalculation.totalRiceWeight' },
          totalBillAmount: { $sum: '$riceOutputCalculation.billAmount' },
          totalBillRate: { $sum: '$riceOutputCalculation.billRate' },
          depositsWithRate: {
            $sum: {
              $cond: [
                { $gt: ['$riceOutputCalculation.billRate', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalONB: 0,
      totalSS: 0,
      totalRiceBags: 0,
      totalRiceWeight: 0,
      totalRiceDeposit: 0,
      totalGunnyBags: 0,
      totalGunnyWeight: 0,
      count: 0,
      totalRiceOutputBags: 0,
      totalRiceOutputWeight: 0,
      totalBillAmount: 0,
      totalBillRate: 0,
      depositsWithRate: 0
    };
    
    // Calculate average bill rate
    result.averageBillRate = result.depositsWithRate > 0 ? result.totalBillRate / result.depositsWithRate : 0;
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching rice deposit stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Calculate bill amount for rice deposit
const calculateBillAmount = async (req, res) => {
  try {
    const { id } = req.params;
    const { billRate } = req.body;
    const { branch_id, isSuperAdmin } = req.user;
    
    if (!billRate || billRate <= 0) {
      return res.status(400).json({ message: 'Valid bill rate is required' });
    }
    
    // Build query - handle superadmin case
    let query = { _id: id };
    
    if (!isSuperAdmin) {
      // Regular users can only update from their assigned branch
      query.branch_id = branch_id;
    }
    
    const riceDeposit = await RiceDeposit.findOne(query);
    
    if (!riceDeposit) {
      return res.status(404).json({ message: 'Rice deposit record not found' });
    }
    
    // Calculate bill amount
    const billAmount = riceDeposit.calculateBillAmount(billRate);
    await riceDeposit.save();
    
    const populatedRiceDeposit = await RiceDeposit.findById(riceDeposit._id)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name')
      .populate('paddyReference', 'issueMemo lorryNumber paddyFrom paddyVariety gunny');
    
    res.json({
      message: 'Bill amount calculated successfully',
      riceDeposit: populatedRiceDeposit,
      billAmount: billAmount
    });
  } catch (error) {
    console.error('Error calculating bill amount:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get total bill amount for all rice deposits
const getTotalBillAmount = async (req, res) => {
  try {
    const { branch_id, isSuperAdmin } = req.user;
    const { branch_id: queryBranchId, startDate, endDate } = req.query;
    
    let branchId = null;
    
    if (isSuperAdmin) {
      if (queryBranchId && queryBranchId !== 'all') {
        branchId = queryBranchId;
      }
    } else {
      branchId = branch_id;
    }
    
    const result = await RiceDeposit.getTotalBillAmount(branchId, startDate, endDate);
    
    res.json(result);
  } catch (error) {
    console.error('Error getting total bill amount:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllRiceDeposits,
  getRiceDepositById,
  createRiceDeposit,
  updateRiceDeposit,
  deleteRiceDeposit,
  getRiceDepositStats,
  calculateBillAmount,
  getTotalBillAmount
}; 