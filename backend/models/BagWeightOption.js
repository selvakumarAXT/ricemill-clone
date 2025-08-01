const mongoose = require('mongoose');

const bagWeightOptionSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  label: {
    type: String,
    required: true,
    default: function() {
      return `${this.weight} kg`;
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  }
}, {
  timestamps: true
});

// Ensure weight is unique per branch
bagWeightOptionSchema.index({ branch_id: 1, weight: 1 }, { unique: true });

// Ensure only one default option per branch
bagWeightOptionSchema.index({ branch_id: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

// Pre-save middleware to ensure label is set
bagWeightOptionSchema.pre('save', function(next) {
  if (!this.label) {
    this.label = `${this.weight} kg`;
  }
  next();
});

module.exports = mongoose.model('BagWeightOption', bagWeightOptionSchema); 