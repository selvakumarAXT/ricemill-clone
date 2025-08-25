const mongoose = require('mongoose');

const meterNumberSchema = new mongoose.Schema({
  meterNumber: {
    type: String,
    required: [true, 'Meter number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  installationDate: {
    type: Date,
    default: Date.now
  },
  lastReadingDate: {
    type: Date
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

// Index for efficient queries
meterNumberSchema.index({ meterNumber: 1, branch_id: 1 });
meterNumberSchema.index({ status: 1 });

// Virtual for branch name
meterNumberSchema.virtual('branchName', {
  ref: 'Branch',
  localField: 'branch_id',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name' }
});

// Ensure virtuals are included in JSON output
meterNumberSchema.set('toJSON', { virtuals: true });
meterNumberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MeterNumber', meterNumberSchema);
