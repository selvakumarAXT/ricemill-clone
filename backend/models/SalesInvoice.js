const mongoose = require('mongoose');

const salesInvoiceSchema = new mongoose.Schema({
  // Invoice Details
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
    trim: true
  },
  invoicePrefix: {
    type: String,
    trim: true,
    default: ''
  },
  invoicePostfix: {
    type: String,
    trim: true,
    default: ''
  },
  invoiceType: {
    type: String,
    enum: ['regular', 'export', 'deemed', 'sez', 'reverse_charge'],
    default: 'regular'
  },
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required'],
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },

  // Product Type (NEW)
  productType: {
    type: String,
    enum: ['rice', 'byproduct'],
    required: [true, 'Product type is required']
  },

  // Order Management Fields (NEW)
  orderDate: {
    type: Date,
    required: [true, 'Order date is required']
  },
  deliveryDate: {
    type: Date,
    required: [true, 'Delivery date is required']
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'in_transit', 'delivered'],
    default: 'pending'
  },
  vehicleNumber: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid'],
    default: 'pending'
  },

  // Customer Information
  customer: {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    contactPerson: {
      type: String,
      trim: true
    },
    phoneNo: {
      type: String,
      trim: true
    },
    gstinPan: {
      type: String,
      trim: true
    },
    reverseCharge: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No'
    },
    placeOfSupply: {
      type: String,
      required: [true, 'Place of supply is required'],
      trim: true
    },
    shippingAddress: {
      type: String,
      trim: true
    },
    useSameShippingAddress: {
      type: Boolean,
      default: true
    }
  },

  // Additional Invoice Details
  challanNo: {
    type: String,
    trim: true
  },
  challanDate: {
    type: Date
  },
  poNo: {
    type: String,
    trim: true
  },
  poDate: {
    type: Date
  },
  lrNo: {
    type: String,
    trim: true
  },
  eWayNo: {
    type: String,
    trim: true
  },
  deliveryMode: {
    type: String,
    enum: ['road', 'rail', 'air', 'ship', 'pickup'],
    default: 'road'
  },

  // E-Invoice Details
  eInvoiceFile: {
    fileName: String,
    filePath: String,
    fileUrl: String,
    uploadedAt: Date
  },

  // Product Items
  items: [{
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    itemNote: {
      type: String,
      trim: true
    },
    hsnSacCode: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    uom: {
      type: String,
      trim: true,
      default: 'UOM'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    },
    igstType: {
      type: String,
      enum: ['%', 'Rs'],
      default: '%'
    },
    igstValue: {
      type: Number,
      default: 0,
      min: [0, 'IGST value cannot be negative']
    },
    cess: {
      type: Number,
      default: 0,
      min: [0, 'CESS cannot be negative']
    },
    total: {
      type: Number,
      default: 0
    }
  }],

  // Additional Charges
  additionalCharges: [{
    description: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      default: 0
    }
  }],

  // Terms & Conditions
  terms: {
    title: {
      type: String,
      trim: true,
      default: 'Terms and Conditions'
    },
    detail: {
      type: String,
      trim: true,
      default: 'Subject to our home Jurisdiction. Our Responsibility Ceases as soon as goods leaves our Premises.'
    }
  },

  // Additional Notes
  additionalNotes: [{
    title: {
      type: String,
      trim: true
    },
    detail: {
      type: String,
      trim: true
    }
  }],

  // Document Notes
  documentNotes: {
    type: String,
    trim: true,
    default: 'Not Visible on Print'
  },

  // Payment Details
  payment: {
    tcsType: {
      type: String,
      enum: ['Rs', '%'],
      default: 'Rs'
    },
    tcsValue: {
      type: Number,
      default: 0
    },
    discountType: {
      type: String,
      enum: ['Rs', '%'],
      default: 'Rs'
    },
    discountValue: {
      type: Number,
      default: 0
    },
    roundOff: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'Yes'
    },
    paymentType: {
      type: String,
      enum: ['CREDIT', 'CASH', 'CHEQUE', 'ONLINE', 'BANK_TRANSFER', 'UPI'],
      required: [true, 'Payment type is required']
    },
    smartSuggestion: {
      type: String,
      trim: true
    }
  },

  // Due Date & Bank
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  bank: {
    type: String,
    trim: true,
    default: 'STATE BANK OF INDIA'
  },

  // Totals
  totals: {
    totalQuantity: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    totalDiscount: {
      type: Number,
      default: 0
    },
    totalIgst: {
      type: Number,
      default: 0
    },
    totalCess: {
      type: Number,
      default: 0
    },
    totalTaxable: {
      type: Number,
      default: 0
    },
    totalTax: {
      type: Number,
      default: 0
    },
    grandTotal: {
      type: Number,
      default: 0
    },
    amountInWords: {
      type: String,
      trim: true
    }
  },

  // Status and Workflow
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paidDate: {
    type: Date
  },

  // Branch and User Information
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  createdBy_name: {
    type: String,
    required: [true, 'Creator name is required']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy_name: {
    type: String
  },
  approvedAt: {
    type: Date
  },

  // Audit Fields
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
salesInvoiceSchema.virtual('formattedInvoiceNumber').get(function() {
  return `${this.invoicePrefix}${this.invoiceNumber}${this.invoicePostfix}`;
});

salesInvoiceSchema.virtual('formattedInvoiceDate').get(function() {
  return this.invoiceDate.toLocaleDateString('en-IN');
});

salesInvoiceSchema.virtual('formattedDueDate').get(function() {
  return this.dueDate.toLocaleDateString('en-IN');
});

salesInvoiceSchema.virtual('formattedOrderDate').get(function() {
  return this.orderDate ? this.orderDate.toLocaleDateString('en-IN') : '';
});

salesInvoiceSchema.virtual('formattedDeliveryDate').get(function() {
  return this.deliveryDate ? this.deliveryDate.toLocaleDateString('en-IN') : '';
});

salesInvoiceSchema.virtual('isDelivered').get(function() {
  return this.deliveryStatus === 'delivered';
});

salesInvoiceSchema.virtual('isPaymentComplete').get(function() {
  return this.paymentStatus === 'paid';
});

salesInvoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'paid' || this.status === 'cancelled') return 0;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  const diffTime = today - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

salesInvoiceSchema.virtual('isOverdue').get(function() {
  return this.daysOverdue > 0 && this.status !== 'paid' && this.status !== 'cancelled';
});

// Pre-save middleware to calculate totals
salesInvoiceSchema.pre('save', function(next) {
  // Set default dates if not provided
  if (!this.orderDate) {
    this.orderDate = this.invoiceDate || new Date();
  }
  
  if (!this.deliveryDate) {
    this.deliveryDate = new Date(this.orderDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from order date
  }

  // Calculate item totals
  this.items.forEach(item => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const igst = parseFloat(item.igstValue) || 0;
    const cess = parseFloat(item.cess) || 0;

    item.total = (qty * price) - discount + igst + cess;
  });

  // Calculate invoice totals
  this.totals.totalQuantity = this.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  this.totals.totalAmount = this.items.reduce((sum, item) => sum + (parseFloat(item.price) * parseFloat(item.quantity) || 0), 0);
  this.totals.totalDiscount = this.items.reduce((sum, item) => sum + (parseFloat(item.discount) || 0), 0);
  this.totals.totalIgst = this.items.reduce((sum, item) => sum + (parseFloat(item.igstValue) || 0), 0);
  this.totals.totalCess = this.items.reduce((sum, item) => sum + (parseFloat(item.cess) || 0), 0);
  this.totals.totalTaxable = this.totals.totalAmount - this.totals.totalDiscount;
  this.totals.totalTax = this.totals.totalIgst + this.totals.totalCess;
  this.totals.grandTotal = this.totals.totalTaxable + this.totals.totalTax;

  // Convert number to words
  this.totals.amountInWords = this.numberToWords(this.totals.grandTotal);

  // Update status if overdue
  if (this.isOverdue && this.status === 'pending') {
    this.status = 'overdue';
  }

  // Update payment status based on paid amount
  if (this.paidAmount >= this.totals.grandTotal) {
    this.paymentStatus = 'paid';
  } else if (this.paidAmount > 0) {
    this.paymentStatus = 'partial';
  } else {
    this.paymentStatus = 'pending';
  }

  next();
});

// Helper method to convert number to words
salesInvoiceSchema.methods.numberToWords = function(num) {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

  if (num === 0) return 'ZERO RUPEES ONLY';
  if (num < 10) return ones[num] + ' RUPEES ONLY';
  if (num < 20) return teens[num - 10] + ' RUPEES ONLY';
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '') + ' RUPEES ONLY';
  if (num < 1000) return ones[Math.floor(num / 100)] + ' HUNDRED' + (num % 100 ? ' AND ' + this.numberToWords(num % 100) : ' RUPEES ONLY');
  if (num < 100000) return this.numberToWords(Math.floor(num / 1000)) + ' THOUSAND' + (num % 1000 ? ' ' + this.numberToWords(num % 1000) : ' RUPEES ONLY');
  if (num < 10000000) return this.numberToWords(Math.floor(num / 100000)) + ' LAKH' + (num % 100000 ? ' ' + this.numberToWords(num % 100000) : ' RUPEES ONLY');
  return this.numberToWords(Math.floor(num / 10000000)) + ' CRORE' + (num % 10000000 ? ' ' + this.numberToWords(num % 10000000) : ' RUPEES ONLY');
};

// Indexes for better query performance
salesInvoiceSchema.index({ invoiceNumber: 1 });
salesInvoiceSchema.index({ branch_id: 1 });
salesInvoiceSchema.index({ createdBy: 1 });
salesInvoiceSchema.index({ status: 1 });
salesInvoiceSchema.index({ invoiceDate: 1 });
salesInvoiceSchema.index({ dueDate: 1 });
salesInvoiceSchema.index({ 'customer.name': 1 });
salesInvoiceSchema.index({ isActive: 1, isDeleted: 1 });
salesInvoiceSchema.index({ productType: 1 });
salesInvoiceSchema.index({ orderDate: 1 });
salesInvoiceSchema.index({ deliveryDate: 1 });
salesInvoiceSchema.index({ deliveryStatus: 1 });
salesInvoiceSchema.index({ paymentStatus: 1 });
salesInvoiceSchema.index({ vehicleNumber: 1 });

module.exports = mongoose.model('SalesInvoice', salesInvoiceSchema); 