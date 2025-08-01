const mongoose = require('mongoose');

const riceDepositSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true 
  },
  truckMemo: { 
    type: String, 
    required: true 
  },
  lorryNumber: { 
    type: String, 
    required: true 
  },
  depositGodown: { 
    type: String, 
    required: true 
  },
  variety: { 
    type: String, 
    required: true 
  },
  godownDate: { 
    type: Date, 
    required: true 
  },
  ackNo: { 
    type: String, 
    required: true 
  },
  riceBag: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  riceBagFrk: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  depositWeight: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  depositWeightFrk: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  totalRiceDeposit: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  moisture: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  sampleNumber: { 
    type: String, 
    default: '' 
  },
  gunny: {
    onb: { type: Number, default: 0, min: 0 },
    ss: { type: Number, default: 0, min: 0 }
  },
  gunnyBags: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  gunnyWeight: { 
    type: Number, 
    default: 0, 
    min: 0 
  },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure unique date per branch
riceDepositSchema.index({ date: 1, branch_id: 1 }, { unique: true });

riceDepositSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('RiceDeposit', riceDepositSchema); 