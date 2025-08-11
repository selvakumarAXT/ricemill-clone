const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Production name is required'],
    trim: true,
    maxLength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [500, 'Description cannot be more than 500 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'tons', 'bags', 'quintals', 'pieces'],
    default: 'kg'
  },
  productionDate: {
    type: Date,
    default: Date.now
  },
  quality: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Poor'],
    default: 'Good'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Completed'
  },
  batchNumber: {
    type: String,
    trim: true,
    maxLength: [50, 'Batch number cannot be more than 50 characters']
  },
  operator: {
    type: String,
    trim: true,
    maxLength: [100, 'Operator name cannot be more than 100 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [1000, 'Notes cannot be more than 1000 characters']
  },
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
  }],
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
productionSchema.index({ branch_id: 1, productionDate: -1 });
productionSchema.index({ status: 1 });
productionSchema.index({ quality: 1 });

// Virtual for formatted production date
productionSchema.virtual('formattedProductionDate').get(function() {
  return this.productionDate.toLocaleDateString();
});

// Virtual for formatted quantity with unit
productionSchema.virtual('formattedQuantity').get(function() {
  return `${this.quantity} ${this.unit}`;
});

// Ensure virtuals are serialized
productionSchema.set('toJSON', { virtuals: true });
productionSchema.set('toObject', { virtuals: true });

// Pre-save hook to sanitize document filenames
productionSchema.pre('save', function(next) {
  if (this.documents && Array.isArray(this.documents)) {
    this.documents = this.documents.map(doc => {
      if (doc.filename && doc.filename.length > 100) {
        // Truncate filename if it's too long
        const ext = doc.filename.split('.').pop();
        const name = doc.filename.substring(0, 80);
        doc.filename = `${name}.${ext}`;
      }
      return doc;
    });
  }
  next();
});

module.exports = mongoose.model('Production', productionSchema); 