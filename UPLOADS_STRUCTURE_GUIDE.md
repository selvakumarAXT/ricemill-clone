# Uploads Folder Structure - Branch-Based Organization

## Overview
The uploads system has been reorganized to store files based on module name and branch ID, providing better organization, security, and scalability for multi-branch rice mill operations.

## New Folder Structure

```
uploads/
├── users/
│   └── {branchId}/
│       ├── user_profile_123_1234567890.jpg
│       └── user_document_456_1234567891.pdf
├── branches/
│   └── {branchId}/
│       ├── branch_logo_789_1234567892.png
│       └── branch_docs_012_1234567893.pdf
├── production/
│   └── {branchId}/
│       ├── pro_batch_report_345_1234567894.pdf
│       └── pro_quality_check_678_1234567895.jpg
├── inventory/
│   └── {branchId}/
│       ├── inv_stock_image_901_1234567896.jpg
│       └── inv_report_234_1234567897.xlsx
├── paddy/
│   └── {branchId}/
│       ├── pad_receipt_567_1234567898.pdf
│       └── pad_quality_890_1234567899.jpg
├── rice/
│   └── {branchId}/
│       ├── ric_deposit_123_1234567900.pdf
│       └── ric_quality_456_1234567901.jpg
├── gunny/
│   └── {branchId}/
│       ├── gun_entry_789_1234567902.pdf
│       └── gun_image_012_1234567903.jpg
├── batches/
│   └── {branchId}/
│       ├── bat_report_345_1234567904.pdf
│       └── bat_image_678_1234567905.jpg
├── sales/
│   └── {branchId}/
│       ├── sal_invoice_901_1234567906.pdf
│       └── sal_dispatch_234_1234567907.pdf
├── financial/
│   └── {branchId}/
│       ├── fin_ledger_567_1234567908.pdf
│       └── fin_report_890_1234567909.xlsx
├── qc/
│   └── {branchId}/
│       ├── qc_data_123_1234567910.pdf
│       └── qc_image_456_1234567911.jpg
├── vendor/
│   └── {branchId}/
│       ├── ven_profile_789_1234567912.jpg
│       └── ven_document_012_1234567913.pdf
├── reports/
│   └── {branchId}/
│       ├── rep_monthly_345_1234567914.pdf
│       └── rep_annual_678_1234567915.xlsx
├── documents/
│   └── {branchId}/
│       ├── doc_general_901_1234567916.pdf
│       └── doc_contract_234_1234567917.pdf
└── images/
    └── {branchId}/
        ├── img_general_567_1234567918.jpg
        └── img_banner_890_1234567919.png
```

## Key Features

### 1. Module-Based Organization
- **Users**: User profiles, documents, and related files
- **Branches**: Branch logos, documents, and settings
- **Production**: Production reports, quality checks, batch data
- **Inventory**: Stock images, inventory reports, stock management
- **Paddy**: Paddy receipts, quality images, purchase documents
- **Rice**: Rice deposit documents, quality checks, storage records
- **Gunny**: Gunny bag entries, images, management documents
- **Batches**: Batch reports, processing images, batch data
- **Sales**: Invoices, dispatch documents, sales reports
- **Financial**: Ledger documents, financial reports, transactions
- **QC**: Quality control data, test results, QC images
- **Vendor**: Vendor profiles, contracts, vendor documents
- **Reports**: Monthly/annual reports, analytics, summaries
- **Documents**: General documents, contracts, policies
- **Images**: General images, banners, media files

### 2. Branch-Based Isolation
- Each branch has its own subdirectory within each module
- Files are completely isolated between branches
- Branch ID is automatically extracted from user context or request
- Supports both authenticated users and explicit branch specification

### 3. Smart File Naming
- **Format**: `{modulePrefix}_{originalName}_{timestamp}_{random}.{extension}`
- **Example**: `sal_invoice_ABC_Traders_1234567890_987654321.pdf`
- **Benefits**:
  - Module identification at a glance
  - Preserves original filename (sanitized)
  - Timestamp for chronological ordering
  - Random suffix prevents conflicts

## API Endpoints

### Upload Endpoints

#### 1. Single File Upload
```http
POST /api/uploads/upload/single
Content-Type: multipart/form-data

Body:
- file: [file]
- module: "sales" (optional, defaults to "documents")
- branchId: "branch123" (optional, uses user's branch if not provided)
```

#### 2. Multiple Files Upload
```http
POST /api/uploads/upload/multiple
Content-Type: multipart/form-data

Body:
- files: [file1, file2, ...]
- module: "production"
- branchId: "branch123"
```

#### 3. Module-Specific Upload
```http
POST /api/uploads/upload/sales
Content-Type: multipart/form-data

Body:
- files: [file1, file2, ...]
- branchId: "branch123"
```

#### 4. Module and Branch Specific Upload
```http
POST /api/uploads/upload/sales/branch123
Content-Type: multipart/form-data

Body:
- files: [file1, file2, ...]
```

### File Management Endpoints

#### 1. List Files by Module
```http
GET /api/uploads/list/sales?branchId=branch123
```

#### 2. List Files by Module and Branch
```http
GET /api/uploads/list/sales/branch123
```

#### 3. Get File Information
```http
GET /api/uploads/info/sales/invoice_123.pdf?branchId=branch123
```

#### 4. Delete File
```http
DELETE /api/uploads/delete/sales/invoice_123.pdf?branchId=branch123
```

#### 5. List All Modules for Branch
```http
GET /api/uploads/modules/branch123
```

#### 6. Get Upload Statistics
```http
GET /api/uploads/stats/branch123
```

## Usage Examples

### Frontend Integration

#### 1. Upload File with Module Context
```javascript
const uploadFile = async (file, module, branchId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('module', module);
  formData.append('branchId', branchId);

  const response = await fetch('/api/uploads/upload/single', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

#### 2. List Files for Module
```javascript
const listFiles = async (module, branchId) => {
  const response = await fetch(`/api/uploads/list/${module}?branchId=${branchId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};
```

#### 3. Delete File
```javascript
const deleteFile = async (module, filename, branchId) => {
  const response = await fetch(`/api/uploads/delete/${module}/${filename}?branchId=${branchId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return response.json();
};
```

### Backend Integration

#### 1. Upload Middleware Usage
```javascript
const { uploadSingle } = require('../middleware/upload');

// In route
router.post('/upload', protect, uploadSingle('file'), (req, res) => {
  const fileInfo = getFileInfo(req.file, req.user.branchId);
  res.json({ success: true, file: fileInfo });
});
```

#### 2. File Path Utilities
```javascript
const { getFilePath, listFilesByModule } = require('../middleware/upload');

// Get file path
const filePath = getFilePath('sales', branchId, filename);

// List files
const files = listFilesByModule('sales', branchId);
```

## Migration from Old Structure

### Automatic Migration
The system includes an automatic migration script that:
1. Creates the new branch-based structure
2. Moves existing files to a "default" branch directory
3. Preserves all existing files and their metadata
4. Creates new module directories for enhanced organization

### Manual Migration
If needed, files can be manually moved using the provided utilities:
```javascript
const { migrateUploads } = require('./migrateUploads');
migrateUploads();
```

## Security Features

### 1. Branch Isolation
- Files are completely isolated between branches
- Users can only access files from their assigned branch
- Branch ID is validated against user permissions

### 2. File Type Validation
- Strict file type checking
- Allowed types: images (JPEG, PNG, GIF, WebP), documents (PDF, DOC, DOCX, XLS, XLSX, TXT, CSV)
- File size limit: 10MB per file
- Maximum 10 files per request

### 3. Authentication Required
- All upload endpoints require authentication
- User context is used for branch determination
- File access is controlled by user permissions

## Benefits

### 1. Better Organization
- Clear separation by module and branch
- Easy to locate and manage files
- Logical grouping of related documents

### 2. Scalability
- Supports unlimited branches
- Each branch operates independently
- Easy to add new modules

### 3. Security
- Branch-level isolation
- User-based access control
- Secure file naming and storage

### 4. Performance
- Efficient file lookup by module and branch
- Reduced directory scanning
- Optimized file serving

### 5. Maintenance
- Easy backup and restore by branch
- Simple file cleanup and management
- Clear audit trail

## File Naming Convention

### Format
```
{modulePrefix}_{originalName}_{timestamp}_{random}.{extension}
```

### Examples
- `sal_invoice_ABC_Traders_1234567890_987654321.pdf`
- `pro_batch_report_Batch_001_1234567891_123456789.pdf`
- `inv_stock_image_Rice_Stock_1234567892_234567890.jpg`

### Module Prefixes
- `sal` - Sales
- `pro` - Production
- `inv` - Inventory
- `pad` - Paddy
- `ric` - Rice
- `gun` - Gunny
- `bat` - Batches
- `fin` - Financial
- `qc` - Quality Control
- `ven` - Vendor
- `rep` - Reports
- `doc` - Documents
- `img` - Images
- `usr` - Users
- `brc` - Branches

## Status: ✅ COMPLETE

The new branch-based upload structure is fully implemented and ready for production use. All existing files have been migrated to the new structure, and the system provides comprehensive file management capabilities with enhanced security and organization.

### Key Achievements
- ✅ Branch-based file organization
- ✅ Module-specific directories
- ✅ Automatic file migration
- ✅ Comprehensive API endpoints
- ✅ Security and access control
- ✅ File type validation
- ✅ Smart file naming
- ✅ Performance optimization
- ✅ Easy maintenance and backup

The system now provides a robust, scalable, and secure file management solution for multi-branch rice mill operations. 