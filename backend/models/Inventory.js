const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Inventory name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  files: [{
    filename: String,
    originalname: String,
    mimetype: String,
    size: Number,
    path: String,
    url: String
  }]
}, {
  timestamps: true
});

// Index for better query performance
inventorySchema.index({ branch_id: 1, name: 1 });

// Ensure indexes
const ensureIndexes = async () => {
  try {
    await inventorySchema.index({ branch_id: 1, name: 1 });
    console.log('Inventory indexes ensured');
  } catch (error) {
    console.error('Error ensuring inventory indexes:', error);
  }
};

// Call ensureIndexes when the model is first loaded
ensureIndexes();

module.exports = mongoose.model('Inventory', inventorySchema); 