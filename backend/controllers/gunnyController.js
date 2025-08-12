const Gunny = require('../models/Gunny');
const mongoose = require('mongoose');

// Get all gunny records
const getAllGunny = async (req, res) => {
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
    
    const gunnyRecords = await Gunny.find(query)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name')
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
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
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
    const { branch_id, _id: userId, isSuperAdmin } = req.user;
    
    const gunnyData = {
      ...req.body,
      createdBy: userId
    };

    // For superadmin, use the branch_id from request body if provided
    // For regular users, always use their assigned branch_id
    if (isSuperAdmin && req.body.branch_id) {
      gunnyData.branch_id = req.body.branch_id;
    } else {
      gunnyData.branch_id = branch_id;
    }

    // Handle file uploads if present
    if (req.files && req.files.documents) {
      const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      
      gunnyData.documents = uploadedFiles.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadPath: file.path
      }));
    }
    
    const newGunny = new Gunny(gunnyData);
    const savedGunny = await newGunny.save();
    
    const populatedGunny = await Gunny.findById(savedGunny._id)
      .populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
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
    
    const updateData = { ...req.body, updatedAt: Date.now() };

    // Handle file uploads if present
    if (req.files && req.files.documents) {
      const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      
      updateData.documents = uploadedFiles.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        uploadPath: file.path
      }));
    }
    
    const updatedGunny = await Gunny.findOneAndUpdate(
      { _id: id, branch_id },
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
      .populate('branch_id', 'name');
    
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
    const { branch_id, isSuperAdmin } = req.user;
    
    console.log('=== DELETE GUNNY DEBUG ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    console.log('User branch_id:', branch_id);
    console.log('User isSuperAdmin:', isSuperAdmin);
    
    // Build query - handle superadmin case
    let query = { _id: id };
    
    if (!isSuperAdmin) {
      // Regular users can only delete from their assigned branch
      query.branch_id = branch_id;
    }
    // Superadmin can delete from any branch - no branch restriction needed
    
    console.log('Final delete query:', JSON.stringify(query, null, 2));
    
    const deletedGunny = await Gunny.findOneAndDelete(query);
    
    if (!deletedGunny) {
      console.log('No gunny record found with query:', query);
      return res.status(404).json({ message: 'Gunny record not found' });
    }
    
    console.log('Successfully deleted gunny record:', deletedGunny._id);
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