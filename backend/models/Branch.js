const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
    maxlength: [100, 'Branch name cannot exceed 100 characters']
  },
  millCode: {
    type: String,
    required: [true, 'Mill code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    // match: [/^[A-Z0-9]{3,10}$/, 'Mill code must be 3-10 uppercase alphanumeric characters']
  },
  gstn: {
    type: String,
    required: [true, 'GSTN is required'],
    trim: true
  },
  address: {
    region: { type: String, required: true },
    type: { type: String, enum: ['RR', 'BR'], default: 'RR', required: true },
    // Optionally keep other fields if needed:
    // street: String,
    // city: String,
    // state: String,
    // zipCode: String,
    // country: { type: String, default: 'India' }
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    currency: {
      type: String,
      default: 'INR'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    operatingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '18:00'
      }
    }
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

// Update the updatedAt field before saving
branchSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better performance
branchSchema.index({ millCode: 1 });
branchSchema.index({ isActive: 1 });

module.exports = mongoose.model('Branch', branchSchema); 