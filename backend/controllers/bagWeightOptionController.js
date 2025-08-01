const BagWeightOption = require('../models/BagWeightOption');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Get all bag weight options for a branch
// @route   GET /api/bag-weight-options
// @access  Private
const getBagWeightOptions = asyncHandler(async (req, res) => {
  const { branch_id, isSuperAdmin } = req.user;
  const { branch_id: queryBranchId } = req.query;

  let effectiveBranchId = branch_id;
  if (isSuperAdmin && queryBranchId) {
    effectiveBranchId = queryBranchId;
  }

  const query = { branch_id: effectiveBranchId, isActive: true };
  
  const options = await BagWeightOption.find(query)
    .sort({ weight: 1 })
    .lean();

  res.json({
    success: true,
    data: options
  });
});

// @desc    Create new bag weight option
// @route   POST /api/bag-weight-options
// @access  Private
const createBagWeightOption = asyncHandler(async (req, res) => {
  const { branch_id, _id: createdBy, isSuperAdmin } = req.user;
  const { weight, label, isDefault } = req.body;

  // Validate weight
  if (!weight || weight < 1 || weight > 100) {
    res.status(400);
    throw new Error('Weight must be between 1 and 100 kg');
  }

  // Check if weight already exists for this branch
  const existingOption = await BagWeightOption.findOne({
    branch_id,
    weight,
    isActive: true
  });

  if (existingOption) {
    res.status(400);
    throw new Error('Bag weight option already exists');
  }

  // If setting as default, unset other defaults for this branch
  if (isDefault) {
    await BagWeightOption.updateMany(
      { branch_id, isActive: true },
      { isDefault: false }
    );
  }

  const bagWeightOption = await BagWeightOption.create({
    weight,
    label: label || `${weight} kg`,
    isDefault: isDefault || false,
    createdBy,
    branch_id
  });

  res.status(201).json({
    success: true,
    message: 'Bag weight option created successfully',
    data: bagWeightOption
  });
});

// @desc    Update bag weight option
// @route   PUT /api/bag-weight-options/:id
// @access  Private
const updateBagWeightOption = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;
  const { weight, label, isDefault, isActive } = req.body;

  // Find the option
  const query = { _id: id };
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const existingOption = await BagWeightOption.findOne(query);
  if (!existingOption) {
    res.status(404);
    throw new Error('Bag weight option not found');
  }

  // Validate weight if provided
  if (weight && (weight < 1 || weight > 100)) {
    res.status(400);
    throw new Error('Weight must be between 1 and 100 kg');
  }

  // Check if new weight conflicts with existing option (excluding current)
  if (weight && weight !== existingOption.weight) {
    const conflictingOption = await BagWeightOption.findOne({
      branch_id: existingOption.branch_id,
      weight,
      _id: { $ne: id },
      isActive: true
    });

    if (conflictingOption) {
      res.status(400);
      throw new Error('Bag weight option already exists');
    }
  }

  // If setting as default, unset other defaults for this branch
  if (isDefault && !existingOption.isDefault) {
    await BagWeightOption.updateMany(
      { branch_id: existingOption.branch_id, _id: { $ne: id }, isActive: true },
      { isDefault: false }
    );
  }

  const updatedOption = await BagWeightOption.findByIdAndUpdate(
    id,
    {
      weight: weight || existingOption.weight,
      label: label || existingOption.label,
      isDefault: isDefault !== undefined ? isDefault : existingOption.isDefault,
      isActive: isActive !== undefined ? isActive : existingOption.isActive
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Bag weight option updated successfully',
    data: updatedOption
  });
});

// @desc    Delete bag weight option
// @route   DELETE /api/bag-weight-options/:id
// @access  Private
const deleteBagWeightOption = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Find the option
  const query = { _id: id };
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const existingOption = await BagWeightOption.findOne(query);
  if (!existingOption) {
    res.status(404);
    throw new Error('Bag weight option not found');
  }

  // Soft delete by setting isActive to false
  await BagWeightOption.findByIdAndUpdate(id, { isActive: false });

  res.json({
    success: true,
    message: 'Bag weight option deleted successfully'
  });
});

// @desc    Set default bag weight option
// @route   PATCH /api/bag-weight-options/:id/set-default
// @access  Private
const setDefaultBagWeightOption = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id, isSuperAdmin } = req.user;

  // Find the option
  const query = { _id: id };
  if (!isSuperAdmin) {
    query.branch_id = branch_id;
  }

  const existingOption = await BagWeightOption.findOne(query);
  if (!existingOption) {
    res.status(404);
    throw new Error('Bag weight option not found');
  }

  // Unset other defaults for this branch
  await BagWeightOption.updateMany(
    { branch_id: existingOption.branch_id, _id: { $ne: id }, isActive: true },
    { isDefault: false }
  );

  // Set this option as default
  const updatedOption = await BagWeightOption.findByIdAndUpdate(
    id,
    { isDefault: true },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Default bag weight option set successfully',
    data: updatedOption
  });
});

module.exports = {
  getBagWeightOptions,
  createBagWeightOption,
  updateBagWeightOption,
  deleteBagWeightOption,
  setDefaultBagWeightOption
}; 