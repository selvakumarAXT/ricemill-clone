const MeterNumber = require('../models/MeterNumber');
const Branch = require('../models/Branch');

// Get all meter numbers with optional filtering
exports.getMeterNumbers = async (req, res) => {
  try {
    const { search, branch_id, status, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$or = [
        { meterNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Branch filter
    if (branch_id && branch_id !== 'all') {
      query.branch_id = branch_id;
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const skip = (page - 1) * limit;
    
    const [meterNumbers, total] = await Promise.all([
      MeterNumber.find(query)
        .populate('branch_id', 'name')
        .populate('createdBy', 'name')
        .sort({ meterNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      MeterNumber.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: meterNumbers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching meter numbers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meter numbers',
      error: error.message
    });
  }
};

// Get meter number by ID
exports.getMeterNumberById = async (req, res) => {
  try {
    const meterNumber = await MeterNumber.findById(req.params.id)
      .populate('branch_id', 'name')
      .populate('createdBy', 'name');
    
    if (!meterNumber) {
      return res.status(404).json({
        success: false,
        message: 'Meter number not found'
      });
    }
    
    res.json({
      success: true,
      data: meterNumber
    });
  } catch (error) {
    console.error('Error fetching meter number:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching meter number',
      error: error.message
    });
  }
};

// Create new meter number
exports.createMeterNumber = async (req, res) => {
  try {
    const { meterNumber, description, branch_id, status } = req.body;
    
    // Check if meter number already exists
    const existingMeter = await MeterNumber.findOne({ 
      meterNumber: meterNumber.toUpperCase(),
      branch_id 
    });
    
    if (existingMeter) {
      return res.status(400).json({
        success: false,
        message: 'Meter number already exists in this branch'
      });
    }
    
    // Verify branch exists
    const branch = await Branch.findById(branch_id);
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch'
      });
    }
    
    const newMeterNumber = new MeterNumber({
      meterNumber: meterNumber.toUpperCase(),
      description,
      branch_id,
      status: status || 'active',
      createdBy: req.user.id
    });
    
    const savedMeterNumber = await newMeterNumber.save();
    
    const populatedMeterNumber = await MeterNumber.findById(savedMeterNumber._id)
      .populate('branch_id', 'name')
      .populate('createdBy', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Meter number created successfully',
      data: populatedMeterNumber
    });
  } catch (error) {
    console.error('Error creating meter number:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating meter number',
      error: error.message
    });
  }
};

// Update meter number
exports.updateMeterNumber = async (req, res) => {
  try {
    const { meterNumber, description, branch_id, status } = req.body;
    
    // Check if meter number already exists (excluding current record)
    if (meterNumber) {
      const existingMeter = await MeterNumber.findOne({
        meterNumber: meterNumber.toUpperCase(),
        branch_id,
        _id: { $ne: req.params.id }
      });
      
      if (existingMeter) {
        return res.status(400).json({
          success: false,
          message: 'Meter number already exists in this branch'
        });
      }
    }
    
    const updateData = {
      ...(meterNumber && { meterNumber: meterNumber.toUpperCase() }),
      ...(description !== undefined && { description }),
      ...(branch_id && { branch_id }),
      ...(status && { status }),
      updatedBy: req.user.id
    };
    
    const updatedMeterNumber = await MeterNumber.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('branch_id', 'name')
     .populate('createdBy', 'name');
    
    if (!updatedMeterNumber) {
      return res.status(404).json({
        success: false,
        message: 'Meter number not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Meter number updated successfully',
      data: updatedMeterNumber
    });
  } catch (error) {
    console.error('Error updating meter number:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating meter number',
      error: error.message
    });
  }
};

// Delete meter number
exports.deleteMeterNumber = async (req, res) => {
  try {
    const meterNumber = await MeterNumber.findByIdAndDelete(req.params.id);
    
    if (!meterNumber) {
      return res.status(404).json({
        success: false,
        message: 'Meter number not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Meter number deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meter number:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting meter number',
      error: error.message
    });
  }
};

// Get active meter numbers for dropdown (used in EB Meter form)
exports.getActiveMeterNumbers = async (req, res) => {
  try {
    const { branch_id } = req.query;
    
    const query = { status: 'active' };
    if (branch_id && branch_id !== 'all') {
      query.branch_id = branch_id;
    }
    
    const meterNumbers = await MeterNumber.find(query)
      .select('meterNumber description')
      .sort({ meterNumber: 1 });
    
    res.json({
      success: true,
      data: meterNumbers
    });
  } catch (error) {
    console.error('Error fetching active meter numbers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active meter numbers',
      error: error.message
    });
  }
};
