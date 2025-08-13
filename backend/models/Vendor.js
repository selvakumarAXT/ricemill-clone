const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  vendorCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vendorName: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true
  },
  panNumber: {
    type: String,
    trim: true
  },
  vendorType: {
    type: String,
    enum: ['supplier', 'contractor', 'service_provider', 'other'],
    default: 'supplier'
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', '7_days', '15_days', '30_days', '45_days', '60_days'],
    default: '30_days'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  remarks: {
    type: String,
    trim: true
  },
  
  // Financial Tracking Fields
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDue: {
    type: Number,
    default: 0,
    min: 0
  },
  lastOrderDate: {
    type: Date
  },
  lastPaymentDate: {
    type: Date
  },
  outstandingBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentHistory: [{
    date: {
      type: Date,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['payment', 'credit', 'adjustment'],
      required: true
    },
    reference: String,
    remarks: String
  }],
  
  // Branch and User Information
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
  
  // Documents
  documents: [{
    originalName: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual for current due amount
vendorSchema.virtual('currentDue').get(function() {
  return this.totalAmount - this.totalPaid;
});

// Virtual for credit utilization percentage
vendorSchema.virtual('creditUtilization').get(function() {
  if (this.creditLimit === 0) return 0;
  return (this.outstandingBalance / this.creditLimit) * 100;
});

// Virtual for payment status
vendorSchema.virtual('paymentStatus').get(function() {
  if (this.outstandingBalance === 0) return 'paid';
  if (this.outstandingBalance <= this.creditLimit * 0.5) return 'good';
  if (this.outstandingBalance <= this.creditLimit * 0.8) return 'warning';
  return 'critical';
});

// Pre-save middleware to calculate totals
vendorSchema.pre('save', function(next) {
  // Calculate total due
  this.totalDue = this.totalAmount - this.totalPaid;
  
  // Calculate outstanding balance
  this.outstandingBalance = this.totalDue;
  
  next();
});

// Add database indexes for better query performance
vendorSchema.index({ branch_id: 1 });
vendorSchema.index({ vendorCode: 1 });
vendorSchema.index({ vendorName: 1 });
vendorSchema.index({ vendorType: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ branch_id: 1, status: 1 });
vendorSchema.index({ branch_id: 1, vendorType: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
