const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // Basic Vendor Information
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
  
  // Address Information
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
  placeOfSupply: {
    type: String,
    required: true,
    trim: true
  },
  
  // Tax Information
  gstNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);
      },
      message: 'Invalid GST number format'
    }
  },
  panNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optional field
        return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);
      },
      message: 'Invalid PAN number format'
    }
  },
  
  // Vendor Classification
  vendorType: {
    type: String,
    enum: ['supplier', 'contractor', 'service_provider', 'other'],
    default: 'supplier'
  },
  
  // Financial Settings
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
  
  // Status and Rating
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  remarks: {
    type: String,
    trim: true
  },
  
  // Enhanced Financial Tracking
  // Money Given (Payments made to vendor)
  totalPaymentsGiven: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Money Received (Payments received from vendor)
  totalPaymentsReceived: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Current Balance (Positive = vendor owes us, Negative = we owe vendor)
  currentBalance: {
    type: Number,
    default: 0
  },
  
  // Transaction History
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
      enum: ['payment_given', 'payment_received', 'credit', 'debit', 'adjustment'],
      required: true
    },
    reference: String,
    description: String,
    remarks: String,
    transactionId: String
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

// Virtual for current balance status
vendorSchema.virtual('balanceStatus').get(function() {
  if (this.currentBalance === 0) return 'settled';
  if (this.currentBalance > 0) return 'vendor_owes_us';
  return 'we_owe_vendor';
});

// Virtual for balance amount (always positive)
vendorSchema.virtual('balanceAmount').get(function() {
  return Math.abs(this.currentBalance);
});

// Virtual for credit utilization percentage
vendorSchema.virtual('creditUtilization').get(function() {
  if (this.creditLimit === 0) return 0;
  return (Math.max(0, this.currentBalance) / this.creditLimit) * 100;
});

// Pre-save middleware to calculate current balance
vendorSchema.pre('save', function(next) {
  // Calculate current balance: money received - money given
  this.currentBalance = this.totalPaymentsReceived - this.totalPaymentsGiven;
  next();
});

// Add database indexes for better query performance
vendorSchema.index({ branch_id: 1 });
vendorSchema.index({ vendorCode: 1 });
vendorSchema.index({ vendorName: 1 });
vendorSchema.index({ vendorType: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ gstNumber: 1 });
vendorSchema.index({ panNumber: 1 });
vendorSchema.index({ branch_id: 1, status: 1 });
vendorSchema.index({ branch_id: 1, vendorType: 1 });
vendorSchema.index({ branch_id: 1, currentBalance: 1 });

module.exports = mongoose.model('Vendor', vendorSchema);
