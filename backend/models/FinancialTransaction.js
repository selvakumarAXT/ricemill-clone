const mongoose = require('mongoose');

const financialTransactionSchema = new mongoose.Schema({
  transactionDate: {
    type: Date,
    required: [true, 'Transaction date is required'],
  },
  transactionType: {
    type: String,
    required: [true, 'Transaction type is required'],
    enum: ['income', 'expense'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'rice_sales',
      'paddy_purchase', 
      'labor',
      'electricity',
      'maintenance',
      'transport',
      'rent',
      'utilities',
      'insurance',
      'taxes',
      'other'
    ],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [500, 'Description cannot be more than 500 characters'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'bank_transfer', 'cheque', 'upi', 'card'],
  },
  reference: {
    type: String,
    trim: true,
    maxLength: [100, 'Reference cannot be more than 100 characters'],
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: false,
  },
  customer: {
    type: String,
    trim: true,
    maxLength: [200, 'Customer name cannot be more than 200 characters'],
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['completed', 'pending', 'cancelled'],
    default: 'completed',
  },
  remarks: {
    type: String,
    trim: true,
    maxLength: [1000, 'Remarks cannot be more than 1000 characters'],
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required'],
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Index for better query performance
financialTransactionSchema.index({ branch_id: 1, transactionDate: -1 });
financialTransactionSchema.index({ transactionType: 1, category: 1 });
financialTransactionSchema.index({ createdBy: 1 });

// Virtual for formatted amount
financialTransactionSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString()}`;
});

// Virtual for transaction type label
financialTransactionSchema.virtual('transactionTypeLabel').get(function() {
  return this.transactionType.charAt(0).toUpperCase() + this.transactionType.slice(1);
});

// Virtual for category label
financialTransactionSchema.virtual('categoryLabel').get(function() {
  return this.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
});

// Pre-save middleware to validate amount based on transaction type
financialTransactionSchema.pre('save', function(next) {
  if (this.amount <= 0) {
    next(new Error('Amount must be greater than 0'));
  }
  next();
});

// Static method to get financial summary
financialTransactionSchema.statics.getFinancialSummary = async function(branchId, startDate, endDate) {
  const matchStage = { branch_id: branchId };
  
  if (startDate && endDate) {
    matchStage.transactionDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const summary = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'income'] }, '$amount', 0]
          }
        },
        totalExpenses: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'expense'] }, '$amount', 0]
          }
        },
        transactionCount: { $sum: 1 },
        incomeCount: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'income'] }, 1, 0]
          }
        },
        expenseCount: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'expense'] }, 1, 0]
          }
        }
      }
    }
  ]);

  if (summary.length === 0) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      transactionCount: 0,
      incomeCount: 0,
      expenseCount: 0
    };
  }

  const result = summary[0];
  result.netProfit = result.totalIncome - result.totalExpenses;
  
  return result;
};

// Static method to get transactions by category
financialTransactionSchema.statics.getTransactionsByCategory = async function(branchId, category) {
  return await this.find({ branch_id: branchId, category })
    .sort({ transactionDate: -1 })
    .populate('branch_id', 'name millCode')
    .populate('createdBy', 'name email');
};

// Static method to get transactions by date range
financialTransactionSchema.statics.getTransactionsByDateRange = async function(branchId, startDate, endDate) {
  return await this.find({
    branch_id: branchId,
    transactionDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
    .sort({ transactionDate: -1 })
    .populate('branch_id', 'name millCode')
    .populate('createdBy', 'name email');
};

module.exports = mongoose.model('FinancialTransaction', financialTransactionSchema); 