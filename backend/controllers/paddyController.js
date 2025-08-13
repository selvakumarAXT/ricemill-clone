const { KG_PER_BAG } = require('../../frontend/src/utils/calculations');
const Paddy = require('../models/Paddy');
const Inventory = require('../models/Inventory');
const { asyncHandler } = require('../utils/asyncHandler');
const mongoose = require('mongoose');

// @desc    Get paddy count (fast)
// @route   GET /api/paddy/count
// @access  Private
const getPaddyCount = asyncHandler(async (req, res) => {
  const { branch_id, isSuperAdmin } = req.user;
  const { branch_id: queryBranchId } = req.query;

  console.log('getPaddyCount called');

  // Build simple query
  let query = {};
  
  if (isSuperAdmin) {
    if (queryBranchId && queryBranchId !== 'all') {
      query.branch_id = queryBranchId;
    }
  } else {
    query.branch_id = branch_id;
  }

  try {
    const count = await Paddy.countDocuments(query).maxTimeMS(3000); // 3 second timeout
    
    res.json({
      success: true,
      count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in getPaddyCount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get paddy count',
      error: error.message
    });
  }
});

// @desc    Get all paddy records
// @route   GET /api/paddy
// @access  Private
const getAllPaddy = asyncHandler(async (req, res) => {
  const { branch_id, isSuperAdmin } = req.user;
  const { page = 1, limit = 10, search = '', sortBy = 'issueDate', sortOrder = 'desc', branch_id: queryBranchId, variety, source, startDate, endDate } = req.query;

  console.log('getAllPaddy called with:', { page, limit, search, sortBy, sortOrder, queryBranchId, variety, source, startDate, endDate });

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
  
  if (search) {
    query.$or = [
      { issueMemo: { $regex: search, $options: 'i' } },
      { lorryNumber: { $regex: search, $options: 'i' } },
      { paddyFrom: { $regex: search, $options: 'i' } },
      { paddyVariety: { $regex: search, $options: 'i' } },
    ];
  }

  // Add variety filter
  if (variety) {
    query.paddyVariety = variety;
  }

  // Add source filter
  if (source) {
    query.paddyFrom = source;
  }

  // Add date range filter
  if (startDate || endDate) {
    query.issueDate = {};
    if (startDate) {
      query.issueDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.issueDate.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  console.log('Final query:', JSON.stringify(query, null, 2));

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination - optimize by limiting population fields
  const skip = (page - 1) * limit;
  
  console.log('Starting database query...');
  const startTime = Date.now();
  
  try {
    const [paddies, total] = await Promise.all([
      Paddy.find(query)
        .select('issueDate issueMemo lorryNumber paddyFrom paddyVariety moisture gunny paddy bagWeight branch_id createdBy createdAt updatedAt')
        .populate('createdBy', 'name email')
        .populate('branch_id', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean()
        .maxTimeMS(10000), // 10 second timeout
      Paddy.countDocuments(query)
        .maxTimeMS(5000), // 5 second timeout
    ]);

    const endTime = Date.now();
    console.log(`Database query completed in ${endTime - startTime}ms`);

    res.json({
      success: true,
      data: paddies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      queryTime: `${endTime - startTime}ms`
    });
  } catch (error) {
    console.error('Error in getAllPaddy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch paddy records',
      error: error.message
    });
  }
});

// @desc    Get paddy by ID
// @route   GET /api/paddy/:id
// @access  Private
const getPaddyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id } = req.user;

  const paddy = await Paddy.findOne({ _id: id, branch_id })
    .populate('createdBy', 'name email')
    .populate('branch_id', 'name')
    .lean();

  if (!paddy) {
    res.status(404);
    throw new Error('Paddy record not found');
  }

  res.json({
    success: true,
    data: paddy
  });
});

// @desc    Test paddy creation (simple)
// @route   POST /api/paddy/test
// @access  Private
const testPaddyCreation = asyncHandler(async (req, res) => {
  try {
    console.log('Test endpoint - Request body:', req.body);
    console.log('Test endpoint - Files:', req.files);
    
    res.json({
      success: true,
      message: 'Test endpoint working',
      body: req.body,
      files: req.files ? Object.keys(req.files) : 'No files'
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Test endpoint failed',
      error: error.message
    });
  }
});

// @desc    Test paddy creation with minimal data
// @route   POST /api/paddy/test-create
// @access  Private
const testPaddyCreate = asyncHandler(async (req, res) => {
  try {
    console.log('=== TEST PADDY CREATE ===');
    const { branch_id, _id: createdBy } = req.user;
    
    // Create minimal test paddy data
    const testPaddyData = {
      issueDate: new Date(),
      issueMemo: 'TEST-MEMO-' + Date.now(),
      lorryNumber: 'TEST-LORRY-' + Date.now(),
      paddyFrom: 'Local Farmers',
      paddyVariety: 'A',
      moisture: 12.5,
      gunny: { nb: 10, onb: 5, ss: 3, swp: 2 },
      paddy: { bags: 20, weight: 1000 },
      bagWeight: 50,
      branch_id,
      createdBy
    };
    
    console.log('Test paddy data:', testPaddyData);
    
    const paddy = await Paddy.create(testPaddyData);
    console.log('Test paddy created with ID:', paddy._id);
    
    res.json({
      success: true,
      message: 'Test paddy created successfully',
      data: paddy
    });
  } catch (error) {
    console.error('Error in test paddy create:', error);
    res.status(500).json({
      success: false,
      message: 'Test paddy create failed',
      error: error.message
    });
  }
});

// @desc    Create new paddy record
// @route   POST /api/paddy
// @access  Private
const createPaddy = asyncHandler(async (req, res) => {
  try {
    const { branch_id, _id: createdBy, isSuperAdmin } = req.user;

    console.log('=== CREATE PADDY START ===');
    console.log('User info:', { branch_id, createdBy, isSuperAdmin });
    console.log('Raw request body:', req.body);
    console.log('Files received:', req.files);
    console.log('Content-Type:', req.get('Content-Type'));

    // Handle FormData - extract paddy data from form fields
    let paddyData = { ...req.body };
    
    // Handle nested objects (gunny and paddy) - more robust parsing
    paddyData.gunny = {};
    paddyData.paddy = {};
    
    // Parse gunny data
    Object.keys(req.body).forEach(key => {
      if (key.startsWith('gunny[') && key.endsWith(']')) {
        const nestedKey = key.slice(6, -1); // Extract key from 'gunny[key]'
        paddyData.gunny[nestedKey] = req.body[key];
      } else if (key.startsWith('paddy[') && key.endsWith(']')) {
        const nestedKey = key.slice(6, -1); // Extract key from 'paddy[key]'
        paddyData.paddy[nestedKey] = req.body[key];
      }
    });
    
    // Also check for direct gunny and paddy objects (fallback)
    if (req.body.gunny && typeof req.body.gunny === 'object') {
      paddyData.gunny = { ...req.body.gunny };
    }
    if (req.body.paddy && typeof req.body.paddy === 'object') {
      paddyData.paddy = { ...req.body.paddy };
    }
    
    // Convert string values to numbers where appropriate
    if (paddyData.gunny.nb) paddyData.gunny.nb = parseInt(paddyData.gunny.nb) || 0;
    if (paddyData.gunny.onb) paddyData.gunny.onb = parseInt(paddyData.gunny.onb) || 0;
    if (paddyData.gunny.ss) paddyData.gunny.ss = parseInt(paddyData.gunny.ss) || 0;
    if (paddyData.gunny.swp) paddyData.gunny.swp = parseInt(paddyData.gunny.swp) || 0;
    
    if (paddyData.paddy.bags) paddyData.paddy.bags = parseInt(paddyData.paddy.bags) || 0;
    if (paddyData.paddy.weight) paddyData.paddy.weight = parseFloat(paddyData.paddy.weight) || 0;
    
    console.log('Processed paddy data:', paddyData);
    
    // Prepare paddy data
    paddyData = {
      ...paddyData,
      createdBy,
    };

    // For superadmin, use the branch_id from request body if provided
    // For regular users, always use their assigned branch_id
    if (isSuperAdmin && req.body.branch_id) {
      paddyData.branch_id = req.body.branch_id;
    } else {
      paddyData.branch_id = branch_id;
    }

    // Auto-calculate bags from gunny total
    const totalGunny = (paddyData.gunny?.nb || 0) + 
                       (paddyData.gunny?.onb || 0) + 
                       (paddyData.gunny?.ss || 0) + 
                       (paddyData.gunny?.swp || 0);
    
    // Use provided bagWeight or default to KG_PER_BAG
    const bagWeight = paddyData.bagWeight || KG_PER_BAG;
    
    paddyData.paddy = {
      ...paddyData.paddy,
      bags: totalGunny,
      weight: paddyData.paddy?.weight || (totalGunny * bagWeight)
    };
    
    // Set the bagWeight field
    paddyData.bagWeight = bagWeight;

    // Handle file uploads if any
    if (req.files && req.files.documents) {
      console.log('Files received in createPaddy:', req.files.documents);
      const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
      paddyData.documents = uploadedFiles.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        url: `${req.protocol}://${req.get('host')}/uploads/paddy/${paddyData.branch_id}/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
        uploadedAt: new Date()
      }));
      console.log('Processed documents:', paddyData.documents);
    } else {
      console.log('No files received in createPaddy');
      console.log('req.files:', req.files);
    }

    console.log('Final paddy data before save:', paddyData);

    // Validate required fields
    if (!paddyData.issueDate || !paddyData.issueMemo || !paddyData.lorryNumber || !paddyData.paddyFrom || !paddyData.paddyVariety) {
      throw new Error('Missing required fields: issueDate, issueMemo, lorryNumber, paddyFrom, paddyVariety');
    }

    const paddy = await Paddy.create(paddyData);
    console.log('Paddy created successfully with ID:', paddy._id);
    
    // Automatically create inventory entries for Rice and Gunny
    try {
      await createInventoryFromPaddy(paddy, paddyData);
      console.log('Inventory entries created successfully');
    } catch (inventoryError) {
      console.error('Error creating inventory entries:', inventoryError);
      // Don't fail the paddy creation if inventory creation fails
    }
    
    const populatedPaddy = await Paddy.findById(paddy._id)
      .populate('createdBy', 'name email')
      .lean();

    console.log('=== CREATE PADDY SUCCESS ===');
    res.status(201).json({
      success: true,
      message: 'Paddy record created successfully',
      data: populatedPaddy
    });
  } catch (error) {
    console.error('=== CREATE PADDY ERROR ===');
    console.error('Error in createPaddy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create paddy record',
      error: error.message
    });
  }
});

// @desc    Update paddy record
// @route   PUT /api/paddy/:id
// @access  Private
const updatePaddy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400);
    throw new Error('Invalid Paddy ID format');
  }

  console.log('Raw request body for update:', req.body);
  console.log('Files received for update:', req.files);

  // Handle FormData - extract paddy data from form fields
  let updateData = { ...req.body };
  
  // Handle nested objects (gunny and paddy)
  updateData.gunny = {};
  updateData.paddy = {};
  
  Object.keys(req.body).forEach(key => {
    if (key.startsWith('gunny[') && key.endsWith(']')) {
      const nestedKey = key.slice(6, -1); // Extract key from 'gunny[key]'
      updateData.gunny[nestedKey] = req.body[key];
    } else if (key.startsWith('paddy[') && key.endsWith(']')) {
      const nestedKey = key.slice(6, -1); // Extract key from 'paddy[key]'
      updateData.paddy[nestedKey] = req.body[key];
    }
  });
  
  // Convert string values to numbers where appropriate
  if (updateData.gunny.nb) updateData.gunny.nb = parseInt(updateData.gunny.nb) || 0;
  if (updateData.gunny.onb) updateData.gunny.onb = parseInt(updateData.gunny.onb) || 0;
  if (updateData.gunny.ss) updateData.gunny.ss = parseInt(updateData.gunny.ss) || 0;
  if (updateData.gunny.swp) updateData.gunny.swp = parseInt(updateData.gunny.swp) || 0;
  
  if (updateData.paddy.bags) updateData.paddy.bags = parseInt(updateData.paddy.bags) || 0;
  if (updateData.paddy.weight) updateData.paddy.weight = parseFloat(updateData.paddy.weight) || 0;

  console.log('Processed update data:', updateData);

  // Check if paddy exists and handle branch access
  let query = { _id: id };
  
  if (!isSuperAdmin) {
    // Regular users can only update records from their assigned branch
    query.branch_id = branch_id;
  }
  // Superadmin can update records from any branch - no branch restriction needed
  
  console.log('Looking for Paddy with query:', JSON.stringify(query, null, 2));
  console.log('User branch_id:', branch_id);
  console.log('User isSuperAdmin:', isSuperAdmin);
  
  const existingPaddy = await Paddy.findOne(query);
  console.log('Existing Paddy found:', existingPaddy ? 'Yes' : 'No');
  
  if (!existingPaddy) {
    res.status(404);
    throw new Error(`Paddy record not found. Query: ${JSON.stringify(query)}`);
  }

  // Auto-calculate bags from gunny total
  const totalGunny = (updateData.gunny?.nb || 0) + 
                     (updateData.gunny?.onb || 0) + 
                     (updateData.gunny?.ss || 0) + 
                     (updateData.gunny?.swp || 0);
  
  // Use provided bagWeight or existing bagWeight or default to KG_PER_BAG
  const bagWeight = updateData.bagWeight || existingPaddy.bagWeight || KG_PER_BAG;
  
  updateData.paddy = {
    ...updateData.paddy,
    bags: totalGunny,
    weight: updateData.paddy?.weight || (totalGunny * bagWeight)
  };
  
  // Set the bagWeight field
  updateData.bagWeight = bagWeight;

  // Handle file uploads if any
  if (req.files && req.files.documents) {
    console.log('Files received in updatePaddy:', req.files.documents);
    const uploadedFiles = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
    updateData.documents = uploadedFiles.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      path: file.path,
      url: `${req.protocol}://${req.get('host')}/uploads/paddy/${existingPaddy.branch_id}/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: new Date()
    }));
    console.log('Processed documents:', updateData.documents);
  } else {
    console.log('No files received in updatePaddy');
    console.log('req.files:', req.files);
  }

  const updatedPaddy = await Paddy.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  // Update inventory entries based on the changes
  try {
    await updateInventoryFromPaddy(existingPaddy, updatedPaddy, updateData);
    console.log('Inventory entries updated successfully');
  } catch (inventoryError) {
    console.error('Error updating inventory entries:', inventoryError);
    // Don't fail the paddy update if inventory update fails
  }

  res.json({
    success: true,
    message: 'Paddy record updated successfully',
    data: updatedPaddy
  });
});

// @desc    Delete paddy record
// @route   DELETE /api/paddy/:id
// @access  Private
const deletePaddy = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Build query - handle superadmin case
  let query = { _id: id };
  
  if (!isSuperAdmin) {
    // Regular users can only delete from their assigned branch
    query.branch_id = branch_id;
  }
  // Superadmin can delete from any branch - no branch restriction needed

  const paddy = await Paddy.findOneAndDelete(query);
  
  if (!paddy) {
    res.status(404);
    throw new Error('Paddy record not found');
  }

  // Remove inventory entries created from this paddy record
  try {
    await removeInventoryFromPaddy(paddy);
    console.log('Inventory entries removed successfully');
  } catch (inventoryError) {
    console.error('Error removing inventory entries:', inventoryError);
    // Don't fail the paddy deletion if inventory removal fails
  }

  res.json({
    success: true,
    message: 'Paddy record deleted successfully'
  });
});

// @desc    Get paddy statistics
// @route   GET /api/paddy/stats
// @access  Private
const getPaddyStats = asyncHandler(async (req, res) => {
  const { branch_id } = req.user;
  const { startDate, endDate } = req.query;

  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.issueDate = {};
    if (startDate) dateFilter.issueDate.$gte = new Date(startDate);
    if (endDate) dateFilter.issueDate.$lte = new Date(endDate);
  }

  const query = { branch_id, ...dateFilter };

  // Create aggregation query with ObjectId for branch_id
  const aggregationQuery = { 
    branch_id: new mongoose.Types.ObjectId(branch_id), 
    ...dateFilter 
  };

  // Get statistics
  const [
    totalRecords,
    totalGunny,
    totalBags,
    totalWeight,
    varietyStats,
    sourceStats
  ] = await Promise.all([
    Paddy.countDocuments(query),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: null, total: { $sum: { $add: ['$gunny.nb', '$gunny.onb', '$gunny.ss', '$gunny.swp'] } } } }
    ]),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: null, total: { $sum: '$paddy.bags' } } }
    ]),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: null, total: { $sum: '$paddy.weight' } } }
    ]),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: '$paddyVariety', count: { $sum: 1 } } }
    ]),
    Paddy.aggregate([
      { $match: aggregationQuery },
      { $group: { _id: '$paddyFrom', count: { $sum: 1 } } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      totalRecords,
      totalGunny: totalGunny[0]?.total || 0,
      totalBags: totalBags[0]?.total || 0,
      totalWeight: totalWeight[0]?.total || 0,
      varietyStats,
      sourceStats
    }
  });
});

// @desc    Remove inventory entries when paddy record is deleted
// @access  Private
const removeInventoryFromPaddy = async (paddy) => {
  try {
    const { branch_id } = paddy;
    
    // Calculate rice weight to remove
    const riceWeight = Math.round((paddy.paddy.weight || 0) * 0.68);
    const riceName = `${paddy.paddyVariety} Variety Rice`;
    
    // Remove rice from inventory
    if (riceWeight > 0) {
      let riceInventory = await Inventory.findOne({
        name: riceName,
        branch_id: branch_id
      });
      
      if (riceInventory) {
        riceInventory.quantity = Math.max(0, riceInventory.quantity - riceWeight);
        await riceInventory.save();
        console.log(`Removed ${riceWeight}kg from rice inventory: ${riceName}`);
      }
    }
    
    // Remove gunny bags from inventory
    const gunnyTypes = [
      { key: 'nb', name: 'New Bags (NB)' },
      { key: 'onb', name: 'Old New Bags (ONB)' },
      { key: 'ss', name: 'Second Sale (SS)' },
      { key: 'swp', name: 'Second Sale with Price (SWP)' }
    ];
    
    for (const gunnyType of gunnyTypes) {
      const quantity = paddy.gunny[gunnyType.key] || 0;
      
      if (quantity > 0) {
        let gunnyInventory = await Inventory.findOne({
          name: gunnyType.name,
          branch_id: branch_id
        });
        
        if (gunnyInventory) {
          gunnyInventory.quantity = Math.max(0, gunnyInventory.quantity - quantity);
          await gunnyInventory.save();
          console.log(`Removed ${quantity} bags from gunny inventory: ${gunnyType.name}`);
        }
      }
    }
    
    console.log('All inventory entries removed successfully');
    
  } catch (error) {
    console.error('Error in removeInventoryFromPaddy:', error);
    throw error;
  }
};

// @desc    Update inventory entries based on paddy data changes
// @access  Private
const updateInventoryFromPaddy = async (oldPaddy, newPaddy, updateData) => {
  try {
    const { branch_id, createdBy } = newPaddy;
    
    // Calculate differences for rice
    const oldRiceWeight = Math.round((oldPaddy.paddy.weight || 0) * 0.68);
    const newRiceWeight = Math.round((updateData.paddy.weight || 0) * 0.68);
    const riceWeightDiff = newRiceWeight - oldRiceWeight;
    
    if (riceWeightDiff !== 0) {
      const riceName = `${updateData.paddyVariety || oldPaddy.paddyVariety} Variety Rice`;
      
      let riceInventory = await Inventory.findOne({
        name: riceName,
        branch_id: branch_id
      });
      
      if (riceInventory) {
        riceInventory.quantity += riceWeightDiff;
        riceInventory.updated_by = createdBy;
        await riceInventory.save();
        console.log(`Updated rice inventory: ${riceName} - Adjusted by ${riceWeightDiff}kg`);
      }
    }
    
    // Calculate differences for gunny bags
    const gunnyTypes = [
      { key: 'nb', name: 'New Bags (NB)' },
      { key: 'onb', name: 'Old New Bags (ONB)' },
      { key: 'ss', name: 'Second Sale (SS)' },
      { key: 'swp', name: 'Second Sale with Price (SWP)' }
    ];
    
    for (const gunnyType of gunnyTypes) {
      const oldQuantity = oldPaddy.gunny[gunnyType.key] || 0;
      const newQuantity = updateData.gunny[gunnyType.key] || 0;
      const quantityDiff = newQuantity - oldQuantity;
      
      if (quantityDiff !== 0) {
        let gunnyInventory = await Inventory.findOne({
          name: gunnyType.name,
          branch_id: branch_id
        });
        
        if (gunnyInventory) {
          gunnyInventory.quantity += quantityDiff;
          gunnyInventory.updated_by = createdBy;
          await gunnyInventory.save();
          console.log(`Updated gunny inventory: ${gunnyType.name} - Adjusted by ${quantityDiff} bags`);
        }
      }
    }
    
    console.log('All inventory entries updated successfully');
    
  } catch (error) {
    console.error('Error in updateInventoryFromPaddy:', error);
    throw error;
  }
};

// @desc    Create inventory entries automatically from paddy data
// @access  Private
const createInventoryFromPaddy = async (paddy, paddyData) => {
  try {
    const { branch_id, createdBy } = paddy;
    const { paddyVariety, paddy: paddyDetails, gunny } = paddyData;
    
    // Calculate rice yield (typically 65-70% of paddy weight)
    const riceYieldPercentage = 0.68; // 68% rice yield from paddy
    const riceWeight = Math.round(paddyDetails.weight * riceYieldPercentage);
    
    // Create rice inventory entry
    const riceName = `${paddyVariety} Variety Rice`;
    const riceDescription = `Rice produced from ${paddyVariety} variety paddy. Source: ${paddyData.paddyFrom}, Memo: ${paddyData.issueMemo}`;
    
    // Check if rice inventory already exists for this variety
    let riceInventory = await Inventory.findOne({
      name: riceName,
      branch_id: branch_id
    });
    
    if (riceInventory) {
      // Update existing rice inventory
      riceInventory.quantity += riceWeight;
      riceInventory.updated_by = createdBy;
      await riceInventory.save();
      console.log(`Updated rice inventory: ${riceName} - Added ${riceWeight}kg`);
    } else {
      // Create new rice inventory
      riceInventory = await Inventory.create({
        name: riceName,
        quantity: riceWeight,
        description: riceDescription,
        branch_id: branch_id,
        created_by: createdBy
      });
      console.log(`Created new rice inventory: ${riceName} - ${riceWeight}kg`);
    }
    
    // Create gunny bags inventory entries
    const gunnyTypes = [
      { key: 'nb', name: 'New Bags (NB)', quantity: gunny.nb || 0 },
      { key: 'onb', name: 'Old New Bags (ONB)', quantity: gunny.onb || 0 },
      { key: 'ss', name: 'Second Sale (SS)', quantity: gunny.ss || 0 },
      { key: 'swp', name: 'Second Sale with Price (SWP)', quantity: gunny.swp || 0 }
    ];
    
    for (const gunnyType of gunnyTypes) {
      if (gunnyType.quantity > 0) {
        const gunnyDescription = `Gunny bags from paddy entry. Source: ${paddyData.paddyFrom}, Memo: ${paddyData.issueMemo}`;
        
        // Check if gunny inventory already exists
        let gunnyInventory = await Inventory.findOne({
          name: gunnyType.name,
          branch_id: branch_id
        });
        
        if (gunnyInventory) {
          // Update existing gunny inventory
          gunnyInventory.quantity += gunnyType.quantity;
          gunnyInventory.updated_by = createdBy;
          await gunnyInventory.save();
          console.log(`Updated gunny inventory: ${gunnyType.name} - Added ${gunnyType.quantity} bags`);
        } else {
          // Create new gunny inventory
          gunnyInventory = await Inventory.create({
            name: gunnyType.name,
            quantity: gunnyType.quantity,
            description: gunnyDescription,
            branch_id: branch_id,
            created_by: createdBy
          });
          console.log(`Created new gunny inventory: ${gunnyType.name} - ${gunnyType.quantity} bags`);
        }
      }
    }
    
    console.log('All inventory entries created/updated successfully');
    
  } catch (error) {
    console.error('Error in createInventoryFromPaddy:', error);
    throw error;
  }
};

module.exports = {
  getAllPaddy,
  getPaddyById,
  createPaddy,
  updatePaddy,
  deletePaddy,
  getPaddyStats,
  testPaddyCreation,
  getPaddyCount,
  testPaddyCreate
}; 