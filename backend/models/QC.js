const mongoose = require('mongoose');

const qcSchema = new mongoose.Schema({
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    unique: true,
    trim: true
  },
  riceVariety: {
    type: String,
    required: [true, 'Rice variety is required'],
    trim: true
  },
  sampleDate: {
    type: Date,
    required: [true, 'Sample date is required']
  },
  moistureContent: {
    type: Number,
    required: [true, 'Moisture content is required'],
    min: [0, 'Moisture content cannot be negative'],
    max: [100, 'Moisture content cannot exceed 100%']
  },
  brokenRice: {
    type: Number,
    required: [true, 'Broken rice percentage is required'],
    min: [0, 'Broken rice percentage cannot be negative'],
    max: [100, 'Broken rice percentage cannot exceed 100%']
  },
  foreignMatter: {
    type: Number,
    required: [true, 'Foreign matter percentage is required'],
    min: [0, 'Foreign matter percentage cannot be negative'],
    max: [100, 'Foreign matter percentage cannot exceed 100%']
  },
  yellowKernels: {
    type: Number,
    required: [true, 'Yellow kernels percentage is required'],
    min: [0, 'Yellow kernels percentage cannot be negative'],
    max: [100, 'Yellow kernels percentage cannot exceed 100%']
  },
  immatureKernels: {
    type: Number,
    required: [true, 'Immature kernels percentage is required'],
    min: [0, 'Immature kernels percentage cannot be negative'],
    max: [100, 'Immature kernels percentage cannot exceed 100%']
  },
  damagedKernels: {
    type: Number,
    required: [true, 'Damaged kernels percentage is required'],
    min: [0, 'Damaged kernels percentage cannot be negative'],
    max: [100, 'Damaged kernels percentage cannot exceed 100%']
  },
  headRice: {
    type: Number,
    required: [true, 'Head rice percentage is required'],
    min: [0, 'Head rice percentage cannot be negative'],
    max: [100, 'Head rice percentage cannot exceed 100%']
  },
  totalDefects: {
    type: Number,
    required: [true, 'Total defects percentage is required'],
    min: [0, 'Total defects percentage cannot be negative'],
    max: [100, 'Total defects percentage cannot exceed 100%']
  },
  qualityGrade: {
    type: String,
    required: [true, 'Quality grade is required'],
    enum: ['A', 'B', 'C', 'D', 'Rejected'],
    default: 'A'
  },
  testMethod: {
    type: String,
    required: [true, 'Test method is required'],
    enum: ['manual', 'automated', 'hybrid'],
    default: 'manual'
  },
  testerName: {
    type: String,
    required: [true, 'Tester name is required'],
    trim: true
  },
  remarks: {
    type: String,
    trim: true,
    maxLength: [500, 'Remarks cannot exceed 500 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  documents: [{
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadPath: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to update updatedAt
qcSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to calculate total defects
qcSchema.pre('save', function(next) {
  this.totalDefects = this.brokenRice + this.foreignMatter + this.yellowKernels + 
                     this.immatureKernels + this.damagedKernels;
  next();
});

// Pre-save middleware to calculate head rice
qcSchema.pre('save', function(next) {
  this.headRice = 100 - this.totalDefects;
  next();
});

module.exports = mongoose.model('QC', qcSchema);
