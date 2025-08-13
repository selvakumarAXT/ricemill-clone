const mongoose = require('mongoose');

const byproductSaleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Sale date is required']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    maxlength: [20, 'Vehicle number cannot be more than 20 characters']
  },
  material: {
    type: String,
    required: [true, 'Material type is required'],
    enum: ['Husk', 'Broken Rice', 'Brown Rice', 'Bran', 'Rice Flour', 'Rice Starch', 'Rice Bran Oil', 'Other'],
    trim: true
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [0, 'Weight cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'tons', 'bags', 'quintals'],
    default: 'kg'
  },
  rate: {
    type: Number,
    required: [true, 'Rate per unit is required'],
    min: [0, 'Rate cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  vendorName: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Vendor name cannot be more than 100 characters']
  },
  vendorPhone: {
    type: String,
    required: [true, 'Vendor phone is required'],
    trim: true,
    maxlength: [15, 'Vendor phone cannot be more than 15 characters']
  },
  vendorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Vendor email cannot be more than 100 characters'],
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  vendorAddress: {
    type: String,
    trim: true,
    maxlength: [500, 'Vendor address cannot be more than 500 characters']
  },
  vendorGstin: {
    type: String,
    trim: true,
    maxlength: [15, 'Vendor GSTIN cannot be more than 15 characters'],
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GSTIN']
  },
  vendorPan: {
    type: String,
    trim: true,
    maxlength: [10, 'Vendor PAN cannot be more than 10 characters'],
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Cash', 'Bank Transfer', 'Cheque', 'UPI', 'Credit', 'Other'],
    default: 'Cash'
  },
  paymentStatus: {
    type: String,
    required: [true, 'Payment status is required'],
    enum: ['Pending', 'Partial', 'Completed', 'Overdue'],
    default: 'Pending'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  documents: [{
    originalName: String,
    filename: String,
    path: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
byproductSaleSchema.index({ branch_id: 1, date: -1 });
byproductSaleSchema.index({ material: 1, branch_id: 1 });
byproductSaleSchema.index({ vendorName: 1, branch_id: 1 });
byproductSaleSchema.index({ paymentStatus: 1, branch_id: 1 });
byproductSaleSchema.index({ date: 1, branch_id: 1 });

// Virtual for formatted date
byproductSaleSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString('en-IN');
});

// Virtual for formatted total amount
byproductSaleSchema.virtual('formattedTotalAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.totalAmount);
});

// Ensure virtuals are serialized
byproductSaleSchema.set('toJSON', { virtuals: true });
byproductSaleSchema.set('toObject', { virtuals: true });

// Pre-save middleware to calculate total amount
byproductSaleSchema.pre('save', function(next) {
  if (this.weight && this.rate) {
    this.totalAmount = this.weight * this.rate;
  }
  next();
});

// Pre-update middleware to calculate total amount
byproductSaleSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.weight && update.rate) {
    update.totalAmount = update.weight * update.rate;
  }
  next();
});

// Static method to get byproduct statistics
byproductSaleSchema.statics.getByproductStats = async function(branchId, startDate, endDate) {
  const matchStage = { branch_id: branchId };
  
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$material',
        totalWeight: { $sum: '$weight' },
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        avgRate: { $avg: '$rate' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  return stats;
};

// Static method to get vendor statistics
byproductSaleSchema.statics.getVendorStats = async function(branchId, startDate, endDate) {
  const matchStage = { branch_id: branchId };
  
  if (startDate || endDate) {
    matchStage.date = {};
    if (startDate) matchStage.date.$gte = new Date(startDate);
    if (endDate) matchStage.date.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  const stats = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$vendorName',
        totalAmount: { $sum: '$totalAmount' },
        count: { $sum: 1 },
        materials: { $addToSet: '$material' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  return stats;
};

// Ensure indexes
const ensureIndexes = async () => {
  try {
    await byproductSaleSchema.index({ branch_id: 1, date: -1 });
    await byproductSaleSchema.index({ material: 1, branch_id: 1 });
    await byproductSaleSchema.index({ vendorName: 1, branch_id: 1 });
    await byproductSaleSchema.index({ paymentStatus: 1, branch_id: 1 });
    await byproductSaleSchema.index({ date: 1, branch_id: 1 });
    console.log('ByproductSale indexes ensured');
  } catch (error) {
    console.error('Error ensuring ByproductSale indexes:', error);
  }
};

// Call ensureIndexes when the model is first loaded
ensureIndexes();

module.exports = mongoose.model('ByproductSale', byproductSaleSchema);
