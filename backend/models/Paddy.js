const mongoose = require('mongoose');
const { KG_PER_BAG } = require('../../frontend/src/utils/calculations');

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
    trim: true,
  },
  paddyVariety: {
    type: String,
    required: true,
    enum: ["A", "C"],
  },
  moisture: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
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
  bagWeight: {
    type: Number,
    default: KG_PER_BAG,
    min: 1,
    max: 100,
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
  
  // Auto-calculate weight if not provided (use bagWeight field)
  if (!this.paddy.weight || this.paddy.weight === 0) {
    this.paddy.weight = totalGunny * this.bagWeight;
  }
  
  next();
});

// Index for better query performance
paddySchema.index({ branch_id: 1, issueDate: -1 });
paddySchema.index({ createdBy: 1 });
paddySchema.index({ paddyVariety: 1 });

module.exports = mongoose.model('Paddy', paddySchema); 