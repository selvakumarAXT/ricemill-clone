const Gunny = require('../models/Gunny');
const mongoose = require('mongoose');

// Get all gunny records
const getAllGunny = async (req, res) => {
  try {
    const { branch_id } = req.user;
    
    // Build query
    const query = { branch_id };
    
    const gunnyRecords = await Gunny.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(gunnyRecords);
  } catch (error) {
    console.error('Error fetching gunny records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single gunny record
const getGunnyById = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const gunnyRecord = await Gunny.findOne({ _id: id, branch_id })
      .populate('createdBy', 'name email');
    
    if (!gunnyRecord) {
      return res.status(404).json({ message: 'Gunny record not found' });
    }
    
    res.json(gunnyRecord);
  } catch (error) {
    console.error('Error fetching gunny record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new gunny record
const createGunny = async (req, res) => {
  try {
    const { branch_id, _id: userId } = req.user;
    
    const gunnyData = {
      ...req.body,
      branch_id,
      createdBy: userId
    };
    
    const newGunny = new Gunny(gunnyData);
    const savedGunny = await newGunny.save();
    
    const populatedGunny = await Gunny.findById(savedGunny._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedGunny);
  } catch (error) {
    console.error('Error creating gunny record:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update gunny record
const updateGunny = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const updatedGunny = await Gunny.findOneAndUpdate(
      { _id: id, branch_id },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');
    
    if (!updatedGunny) {
      return res.status(404).json({ message: 'Gunny record not found' });
    }
    
    res.json(updatedGunny);
  } catch (error) {
    console.error('Error updating gunny record:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete gunny record
const deleteGunny = async (req, res) => {
  try {
    const { id } = req.params;
    const { branch_id } = req.user;
    
    const deletedGunny = await Gunny.findOneAndDelete({ _id: id, branch_id });
    
    if (!deletedGunny) {
      return res.status(404).json({ message: 'Gunny record not found' });
    }
    
    res.json({ message: 'Gunny record deleted successfully' });
  } catch (error) {
    console.error('Error deleting gunny record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get gunny statistics
const getGunnyStats = async (req, res) => {
  try {
    const { branch_id } = req.user;
    
    // Build match query - convert branch_id to ObjectId for aggregation
    const matchQuery = { branch_id: new mongoose.Types.ObjectId(branch_id) };
    
    const stats = await Gunny.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalNB: { $sum: '$gunny.nb' },
          totalONB: { $sum: '$gunny.onb' },
          totalSS: { $sum: '$gunny.ss' },
          totalSWP: { $sum: '$gunny.swp' },
          totalBags: { $sum: '$paddy.bags' },
          totalWeight: { $sum: '$paddy.weight' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(stats[0] || {
      totalNB: 0,
      totalONB: 0,
      totalSS: 0,
      totalSWP: 0,
      totalBags: 0,
      totalWeight: 0,
      count: 0
    });
  } catch (error) {
    console.error('Error fetching gunny stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllGunny,
  getGunnyById,
  createGunny,
  updateGunny,
  deleteGunny,
  getGunnyStats
}; 