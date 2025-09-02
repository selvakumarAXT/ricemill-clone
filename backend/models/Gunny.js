const mongoose = require('mongoose');

const gunnySchema = new mongoose.Schema({
  issueDate: { type: Date, required: true },
  issueMemo: { type: String, required: true },
  lorryNumber: { type: String, required: true },
  paddyFrom: { type: String, required: true },
  paddyVariety: { type: String, required: true },
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: false },
  gunny: {
    nb: { type: Number, default: 0 },
    onb: { type: Number, default: 0 },
    ss: { type: Number, default: 0 },
    swp: { type: Number, default: 0 }
  },
  paddy: {
    bags: { type: Number, default: 0 },
    weight: { type: Number, default: 0 }
  },
  documents: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadPath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

gunnySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Gunny', gunnySchema); 