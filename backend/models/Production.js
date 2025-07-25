const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  description: { type: String },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Production', productionSchema); 