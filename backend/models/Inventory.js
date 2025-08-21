const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Inventory name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['gunny', 'paddy', 'rice', 'other'],
    default: 'other'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['bags', 'kg', 'tons', 'pieces', 'units'],
    default: 'units'
  },
  // Gunny specific fields
  gunnyType: {
    type: String,
    enum: ['NB', 'ONB', 'SS', 'SWP'],
    required: function() { return this.category === 'gunny'; }
  },
  // Paddy specific fields
  paddyVariety: {
    type: String,
    trim: true,
    required: function() { return this.category === 'paddy'; }
  },
  moisture: {
    type: Number,
    min: 0,
    max: 100,
    required: function() { return this.category === 'paddy'; }
  },
  // Rice specific fields
  riceVariety: {
    type: String,
    trim: true,
    required: function() { return this.category === 'rice'; }
  },
  quality: {
    type: String,
    enum: ['Grade A', 'Grade B', 'Grade C', 'Standard'],
    required: function() { return this.category === 'rice'; }
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
inventorySchema.index({ branch_id: 1, category: 1, name: 1 });
inventorySchema.index({ category: 1, gunnyType: 1 });
inventorySchema.index({ category: 1, paddyVariety: 1 });
inventorySchema.index({ category: 1, riceVariety: 1 });

// Virtual for formatted quantity with unit
inventorySchema.virtual('formattedQuantity').get(function() {
  if (this.unit === 'tons') {
    return `${this.quantity.toFixed(2)} Tons`;
  } else if (this.unit === 'kg') {
    if (this.quantity >= 1000) {
      return `${(this.quantity / 1000).toFixed(2)} Tons (${this.quantity.toLocaleString()} KG)`;
    }
    return `${this.quantity.toLocaleString()} KG`;
  } else if (this.unit === 'bags') {
    return `${this.quantity.toLocaleString()} Bags`;
  }
  return `${this.quantity.toLocaleString()} ${this.unit}`;
});

// Ensure indexes
const ensureIndexes = async () => {
  try {
    await inventorySchema.index({ branch_id: 1, category: 1, name: 1 });
    await inventorySchema.index({ category: 1, gunnyType: 1 });
    await inventorySchema.index({ category: 1, paddyVariety: 1 });
    await inventorySchema.index({ category: 1, riceVariety: 1 });
    console.log('Inventory indexes ensured');
  } catch (error) {
    console.error('Error ensuring inventory indexes:', error);
  }
};

// Call ensureIndexes when the model is first loaded
ensureIndexes();

module.exports = mongoose.model('Inventory', inventorySchema); 