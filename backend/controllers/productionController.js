const Production = require('../models/Production');
const { applyBranchFilter } = require('../middleware/branchFilter');
const { getFileInfo } = require('../middleware/upload');

// @desc    Get all production records
// @route   GET /api/production
// @access  Private
exports.getAllProduction = async (req, res) => {
  try {
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

    const items = await query
      .populate('branch_id', 'name millCode')
      .sort({ createdAt: -1 });

    // Transform data for frontend
    const transformedItems = items.map(item => ({
      _id: item._id,
      id: item._id,
      name: item.name,
      category: item.category,
      productionType: item.productionType,
      riceVariety: item.riceVariety,
      paddyVariety: item.paddyVariety,
      byproductType: item.byproductType,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      productionDate: item.productionDate,
      quality: item.quality,
      status: item.status,
      batchNumber: item.batchNumber,
      operator: item.operator,
      efficiency: item.efficiency,
      machineUsed: item.machineUsed,
      notes: item.notes,
      documents: item.documents || [],
      branch_id: item.branch_id?._id || item.branch_id || null,
      branch: item.branch_id && typeof item.branch_id === 'object' ? {
        id: item.branch_id._id,
        name: item.branch_id.name,
        millCode: item.branch_id.millCode
      } : null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    res.json({ 
      success: true, 
      count: transformedItems.length,
      items: transformedItems 
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single production record
// @route   GET /api/production/:id
// @access  Private
exports.getProduction = async (req, res) => {
  try {
    const production = await Production.findById(req.params.id)
      .populate('branch_id', 'name millCode');

    if (!production) {
      return res.status(404).json({
        success: false,
        message: 'Production record not found'
      });
    }

    res.status(200).json({
      success: true,
      production
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create production record
// @route   POST /api/production
// @access  Private
exports.createProduction = async (req, res) => {
  try {
    const {
      name,
      description,
      quantity,
      unit,
      productionDate,
      quality,
      status,
      batchNumber,
      operator,
      notes,
      documents
    } = req.body;

    // Validate required fields
    if (!name || !quantity || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Name, quantity, and unit are required'
      });
    }

    // Set branch_id based on user role and available data
    let branchId = null;
    
    if (req.user.isSuperAdmin) {
      // For superadmin, use the branch_id from request body if provided
      if (req.body.branch_id) {
        branchId = req.body.branch_id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Branch ID is required for superadmin users'
        });
      }
    } else {
      // For regular users, use their assigned branch
      if (req.user.branch_id) {
        branchId = req.user.branch_id;
      } else {
        return res.status(400).json({
          success: false,
          message: 'User is not assigned to any branch'
        });
      }
    }

    // Validate that branch exists
    const Branch = require('../models/Branch');
    const branchExists = await Branch.findById(branchId);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID provided'
      });
    }

    // Process documents if provided
    let processedDocuments = [];
    
    // Handle uploaded files from multer
    if (req.files && req.files.documents && req.files.documents.length > 0) {
      const { getFileInfo } = require('../middleware/upload');
      processedDocuments = req.files.documents.map(file => {
        return getFileInfo(file, branchId);
      });
    }
    
    // Handle documents from request body (for backward compatibility)
    if (documents && Array.isArray(documents)) {
      const bodyDocuments = documents.map(doc => {
        if (typeof doc === 'string') {
          // If it's just a URL string, create a basic document object
          return {
            originalName: doc.split('/').pop(),
            filename: doc.split('/').pop(),
            path: doc,
            url: doc,
            size: 0,
            mimetype: 'application/octet-stream',
            uploadedAt: new Date()
          };
        }
        return doc;
      });
      
      // Merge uploaded files with body documents
      processedDocuments = [...processedDocuments, ...bodyDocuments];
    }

    const production = await Production.create({
      name,
      category: category || 'rice',
      productionType: productionType || 'milling',
      riceVariety: category === 'rice' ? riceVariety : undefined,
      paddyVariety: category === 'paddy' ? paddyVariety : undefined,
      byproductType: category === 'byproduct' ? byproductType : undefined,
      description,
      quantity,
      unit,
      productionDate: productionDate || new Date(),
      quality: quality || 'Good',
      status: status || 'Completed',
      batchNumber,
      operator,
      efficiency: efficiency || 85,
      machineUsed,
      notes,
      documents: processedDocuments,
      branch_id: branchId,
      createdBy: req.user.id
    });

    // Get populated production data
    const populatedProduction = await Production.findById(production._id)
      .populate('branch_id', 'name millCode');

    res.status(201).json({
      success: true,
      message: 'Production record created successfully',
      production: populatedProduction
    });
  } catch (error) {
    console.error('Production creation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update production record
// @route   PUT /api/production/:id
// @access  Private
exports.updateProduction = async (req, res) => {
  try {
    const {
      name,
      description,
      quantity,
      unit,
      productionDate,
      quality,
      status,
      batchNumber,
      operator,
      notes,
      documents
    } = req.body;

    const production = await Production.findById(req.params.id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: 'Production record not found'
      });
    }

    // Update fields
    if (name !== undefined) production.name = name;
    if (category !== undefined) production.category = category;
    if (productionType !== undefined) production.productionType = productionType;
    if (riceVariety !== undefined) production.riceVariety = riceVariety;
    if (paddyVariety !== undefined) production.paddyVariety = paddyVariety;
    if (byproductType !== undefined) production.byproductType = byproductType;
    if (description !== undefined) production.description = description;
    if (quantity !== undefined) production.quantity = quantity;
    if (unit !== undefined) production.unit = unit;
    if (productionDate !== undefined) production.productionDate = productionDate;
    if (quality !== undefined) production.quality = quality;
    if (status !== undefined) production.status = status;
    if (batchNumber !== undefined) production.batchNumber = batchNumber;
    if (operator !== undefined) production.operator = operator;
    if (efficiency !== undefined) production.efficiency = efficiency;
    if (machineUsed !== undefined) production.machineUsed = machineUsed;
    if (notes !== undefined) production.notes = notes;

    // Process documents if provided
    if (documents !== undefined || (req.files && req.files.documents)) {
      let processedDocuments = [];
      
      // Handle uploaded files from multer
      if (req.files && req.files.documents && req.files.documents.length > 0) {
        const { getFileInfo } = require('../middleware/upload');
        const uploadedDocs = req.files.documents.map(file => {
          return getFileInfo(file, production.branch_id);
        });
        processedDocuments = [...processedDocuments, ...uploadedDocs];
      }
      
      // Handle documents from request body
      if (Array.isArray(documents)) {
        const bodyDocuments = documents.map(doc => {
          if (typeof doc === 'string') {
            // If it's just a URL string, create a basic document object
            return {
              originalName: doc.split('/').pop(),
              filename: doc.split('/').pop(),
              path: doc,
              url: doc,
              size: 0,
              mimetype: 'application/octet-stream',
              uploadedAt: new Date()
            };
          }
          return doc;
        });
        processedDocuments = [...processedDocuments, ...bodyDocuments];
      }
      
      production.documents = processedDocuments;
    }

    // Only superadmin can change branch_id
    if (req.body.branch_id !== undefined && req.user.isSuperAdmin) {
      production.branch_id = req.body.branch_id;
    }

    production.updatedBy = req.user.id;
    await production.save();

    // Get updated production with populated branch
    const updatedProduction = await Production.findById(production._id)
      .populate('branch_id', 'name millCode');

    res.status(200).json({
      success: true,
      message: 'Production record updated successfully',
      production: updatedProduction
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete production record
// @route   DELETE /api/production/:id
// @access  Private
exports.deleteProduction = async (req, res) => {
  try {
    const production = await Production.findById(req.params.id);

    if (!production) {
      return res.status(404).json({
        success: false,
        message: 'Production record not found'
      });
    }

    await production.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Production record deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get production statistics
// @route   GET /api/production/stats
// @access  Private
exports.getProductionStats = async (req, res) => {
  try {
    let query = Production.find({});
    let branchFilter = {};

    if (req.user.isSuperAdmin) {
      if (req.query.branch_id && req.query.branch_id !== 'all') {
        branchFilter = { branch_id: req.query.branch_id };
      }
    } else if (req.user.branch_id) {
      branchFilter = { branch_id: req.user.branch_id };
    }

    query = applyBranchFilter(query, branchFilter);

    const productions = await query;

    // Calculate statistics
    const totalQuantity = productions.reduce((sum, prod) => sum + (prod.quantity || 0), 0);
    const averageQuantity = productions.length > 0 ? totalQuantity / productions.length : 0;
    const completedCount = productions.filter(prod => prod.status === 'Completed').length;
    const pendingCount = productions.filter(prod => prod.status === 'Pending').length;

    // Quality distribution
    const qualityStats = productions.reduce((acc, prod) => {
      const quality = prod.quality || 'Unknown';
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      stats: {
        totalRecords: productions.length,
        totalQuantity,
        averageQuantity: Math.round(averageQuantity * 100) / 100,
        completedCount,
        pendingCount,
        qualityStats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; 