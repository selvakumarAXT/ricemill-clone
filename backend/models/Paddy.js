const mongoose = require('mongoose');

const paddySchema = new mongoose.Schema({
  issueDate: {
    type: Date,
    required: true,
  },
  issueMemo: {
    type: String,
    required: true,
    trim: true,
  },
  lorryNumber: {
    type: String,
    required: true,
    trim: true,
  },
  paddyFrom: {
    type: String,
    required: true,
    enum: [
      "Local Farmers",
      "Traders", 
      "Cooperative Societies",
      "Government Procurement",
      "Other"
    ],
  },
  paddyVariety: {
    type: String,
    required: true,
    enum: ["A", "C"],
  },
  gunny: {
    nb: {
      type: Number,
      default: 0,
      min: 0,
    },
    onb: {
      type: Number,
      default: 0,
      min: 0,
    },
    ss: {
      type: Number,
      default: 0,
      min: 0,
    },
    swp: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  paddy: {
    bags: {
      type: Number,
      default: 0,
      min: 0,
    },
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Virtual for total gunny count
paddySchema.virtual('totalGunny').get(function() {
  return (this.gunny.nb || 0) + (this.gunny.onb || 0) + (this.gunny.ss || 0) + (this.gunny.swp || 0);
});

// Virtual for total weight in kg
paddySchema.virtual('totalWeightKg').get(function() {
  return this.paddy.weight || 0;
});

// Pre-save middleware to auto-calculate bags from gunny total
paddySchema.pre('save', function(next) {
  const totalGunny = this.totalGunny;
  this.paddy.bags = totalGunny;
  
  // Auto-calculate weight if not provided (1 bag = 500kg)
  if (!this.paddy.weight || this.paddy.weight === 0) {
    this.paddy.weight = totalGunny * 500;
  }
  
  next();
});

// Index for better query performance
paddySchema.index({ branch_id: 1, issueDate: -1 });
paddySchema.index({ createdBy: 1 });
paddySchema.index({ paddyVariety: 1 });

module.exports = mongoose.model('Paddy', paddySchema); 