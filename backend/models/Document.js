const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true,
    maxLength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxLength: [1000, 'Description cannot be more than 1000 characters']
  },
  module: {
    type: String,
    required: [true, 'Module name is required'],
    enum: [
      'production',
      'paddy',
      'rice',
      'gunny',
      'inventory',
      'financial',
      'quality',
      'sales',
      'vendor',
      'eb_meter',
      'reports',
      'users',
      'branches',
      'general'
    ],
    default: 'general'
  },
  category: {
    type: String,
    required: [true, 'Document category is required'],
    enum: [
      'invoice',
      'quality_report',
      'contract',
      'license',
      'manual',
      'receipt',
      'certificate',
      'statement',
      'report',
      'other'
    ],
    default: 'other'
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    enum: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'csv'],
    default: 'pdf'
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  fileSizeFormatted: {
    type: String,
    required: [true, 'Formatted file size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  version: {
    type: String,
    default: '1.0',
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  },
  remarks: {
    type: String,
    trim: true,
    maxLength: [500, 'Remarks cannot be more than 500 characters']
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: [0, 'Download count cannot be negative']
  },
  lastDownloadedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true,
    maxLength: [50, 'Tag cannot be more than 50 characters']
  }],
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  branch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  uploadedBy_name: {
    type: String,
    required: [true, 'Uploader name is required']
  },
  relatedRecord: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedRecordModel'
  },
  relatedRecordModel: {
    type: String,
    enum: ['Production', 'Paddy', 'RiceDeposit', 'Gunny', 'Inventory', 'FinancialTransaction', 'User', 'Branch']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted file size
documentSchema.virtual('formattedFileSize').get(function() {
  if (this.fileSize < 1024) {
    return `${this.fileSize} B`;
  } else if (this.fileSize < 1024 * 1024) {
    return `${(this.fileSize / 1024).toFixed(1)} KB`;
  } else if (this.fileSize < 1024 * 1024 * 1024) {
    return `${(this.fileSize / (1024 * 1024)).toFixed(1)} MB`;
  } else {
    return `${(this.fileSize / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
});

// Virtual for formatted upload date
documentSchema.virtual('formattedUploadDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Virtual for formatted upload time
documentSchema.virtual('formattedUploadTime').get(function() {
  return this.createdAt.toLocaleTimeString();
});

// Virtual for time ago
documentSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInSeconds = Math.floor((now - this.createdAt) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
});

// Index for better query performance
documentSchema.index({ module: 1, branch_id: 1, status: 1 });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ title: 'text', description: 'text', remarks: 'text' });

// Pre-save middleware to format file size
documentSchema.pre('save', function(next) {
  if (this.fileSize && !this.fileSizeFormatted) {
    this.fileSizeFormatted = this.formattedFileSize;
  }
  next();
});

module.exports = mongoose.model('Document', documentSchema); 