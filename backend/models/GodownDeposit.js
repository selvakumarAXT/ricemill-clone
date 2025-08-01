const mongoose = require('mongoose');

const godownDepositSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true 
  },
  gunny: {
    onb: { type: Number, default: 0, min: 0 },
    ss: { type: Number, default: 0, min: 0 }
  },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure unique date per branch
godownDepositSchema.index({ date: 1, branch_id: 1 }, { unique: true });

godownDepositSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('GodownDeposit', godownDepositSchema); 