const mongoose = require('mongoose');

const salesInvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  customer: {
    name: {
      type: String,
      required: true
    },
    email: String,
    phone: String,
    address: String,
    gstin: String
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  items: [{
    name: String,
    quantity: Number,
    unit: String,
    rate: Number,
    amount: Number,
    gst: Number
  }],
  totals: {
    subtotal: Number,
    gst: Number,
    grandTotal: Number
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'overdue'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
salesInvoiceSchema.index({ invoiceNumber: 1 });
salesInvoiceSchema.index({ branch_id: 1 });
salesInvoiceSchema.index({ createdBy: 1 });
salesInvoiceSchema.index({ status: 1 });
salesInvoiceSchema.index({ invoiceDate: 1 });
salesInvoiceSchema.index({ dueDate: 1 });
salesInvoiceSchema.index({ 'customer.name': 1 });
salesInvoiceSchema.index({ isActive: 1, isDeleted: 1 });

module.exports = mongoose.model('SalesInvoice', salesInvoiceSchema);
