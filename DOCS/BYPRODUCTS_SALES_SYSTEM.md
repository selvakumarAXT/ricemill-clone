# Byproducts Sales System

## Overview
The Byproducts Sales System is a comprehensive module for managing sales of rice mill byproducts like husk, broken rice, brown rice, bran, and other materials. This system tracks all sales transactions with detailed vendor information, vehicle details, and payment tracking.

## Features

### 🚛 **Sales Management**
- **Date tracking** for all sales transactions
- **Vehicle number** recording for dispatch tracking
- **Material selection** from predefined byproduct types
- **Weight and unit** management with automatic calculations
- **Rate per unit** and **total amount** calculation

### 👥 **Vendor Management**
- **Vendor name, phone, and email** for contact information
- **Vendor address** for delivery purposes
- **GSTIN and PAN** for tax compliance
- **Payment method** tracking (Cash, Bank Transfer, Cheque, UPI, Credit)
- **Payment status** monitoring (Pending, Partial, Completed, Overdue)

### 📊 **Data Organization**
- **Grouped table view** with organized columns
- **Expandable rows** for detailed information
- **Search and filtering** capabilities
- **Date range filtering** for reports
- **Branch-based access control**

## Byproduct Types

The system supports the following byproduct materials:

| Material | Description | Common Use |
|----------|-------------|------------|
| **Husk** | Rice husk from milling | Fuel, animal bedding, composting |
| **Broken Rice** | Fragmented rice grains | Animal feed, rice flour production |
| **Brown Rice** | Unpolished rice | Health food, specialty products |
| **Bran** | Rice bran layer | Oil extraction, animal feed |
| **Rice Flour** | Ground rice powder | Baking, food processing |
| **Rice Starch** | Extracted starch | Food industry, paper making |
| **Rice Bran Oil** | Oil from rice bran | Cooking oil, cosmetics |
| **Other** | Custom materials | Specialized applications |

## Data Fields

### **Sale Information**
- **Date**: Sale transaction date
- **Vehicle Number**: Transport vehicle identification
- **Material**: Type of byproduct being sold

### **Quantity & Pricing**
- **Weight**: Amount of material sold
- **Unit**: Measurement unit (kg, tons, bags, quintals)
- **Rate**: Price per unit
- **Total Amount**: Automatically calculated (Weight × Rate)

### **Vendor Details**
- **Vendor Name**: Company or individual name
- **Vendor Phone**: Contact phone number
- **Vendor Email**: Contact email address
- **Vendor Address**: Complete address
- **Vendor GSTIN**: GST identification number
- **Vendor PAN**: Permanent Account Number

### **Payment Information**
- **Payment Method**: How payment is made
- **Payment Status**: Current payment status
- **Notes**: Additional transaction details

## Technical Implementation

### **Backend Components**

#### **Model: `ByproductSale.js`**
- Mongoose schema with validation
- Automatic total amount calculation
- Indexes for performance optimization
- Virtual fields for formatted display
- Static methods for statistics

#### **Controller: `byproductSaleController.js`**
- CRUD operations (Create, Read, Update, Delete)
- File upload handling
- Branch-based access control
- Comprehensive error handling
- Statistics aggregation

#### **Routes: `byproducts.js`**
- RESTful API endpoints
- Authentication middleware
- File upload middleware
- Debug logging

### **Frontend Components**

#### **Page: `ByproductsSales.jsx`**
- Complete sales management interface
- Form validation and data entry
- Table display with grouping
- Modal forms for add/edit operations
- File upload integration

#### **Service: `byproductSaleService.js`**
- API communication layer
- Data formatting utilities
- Error handling
- Mock data for development

## API Endpoints

### **Base URL**: `/api/byproducts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Get all byproduct sales with pagination |
| `POST` | `/` | Create new byproduct sale |
| `GET` | `/:id` | Get single byproduct sale by ID |
| `PUT` | `/:id` | Update existing byproduct sale |
| `DELETE` | `/:id` | Delete byproduct sale |
| `GET` | `/stats` | Get sales statistics |
| `GET` | `/health` | API health check |

### **Query Parameters**

#### **Pagination**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### **Filtering**
- `search`: Search in vehicle number, vendor name, material, notes
- `material`: Filter by specific material type
- `vendor`: Filter by vendor name
- `paymentStatus`: Filter by payment status
- `startDate`: Filter from date
- `endDate`: Filter to date

#### **Sorting**
- `sortBy`: Field to sort by (default: date)
- `sortOrder`: Sort direction (asc/desc, default: desc)

## Usage Examples

### **Creating a New Sale**

1. **Navigate to Byproducts Sales page**
2. **Click "+ New Byproduct Sale" button**
3. **Fill in the required fields:**
   - Date: Select sale date
   - Vehicle Number: Enter vehicle registration
   - Material: Choose from dropdown
   - Weight: Enter quantity
   - Unit: Select measurement unit
   - Rate: Enter price per unit
   - Vendor details: Fill vendor information
   - Payment details: Select method and status
4. **Upload documents** (optional)
5. **Click "Create" to save**

### **Managing Existing Sales**

- **View**: Click on any row to expand and see details
- **Edit**: Click "Edit" button to modify sale information
- **Delete**: Click "Delete" button to remove sale record
- **Filter**: Use date range and search filters
- **Sort**: Click column headers to sort data

## Business Benefits

### **1. Revenue Tracking**
- Monitor byproduct sales performance
- Track revenue from different materials
- Identify most profitable byproducts

### **2. Vendor Management**
- Maintain vendor database
- Track payment status
- Monitor vendor relationships

### **3. Inventory Control**
- Track material quantities sold
- Monitor sales trends
- Plan production accordingly

### **4. Compliance**
- GST and tax tracking
- Document management
- Audit trail maintenance

## Configuration Options

### **Material Types**
The system supports custom material types. To add new materials:

1. **Backend**: Update the enum in `ByproductSale.js` model
2. **Frontend**: Update the `BYPRODUCT_TYPES` array in `ByproductsSales.jsx`

### **Units**
Supported measurement units:
- **kg**: Kilograms (default)
- **tons**: Metric tons
- **bags**: Standard bags
- **quintals**: Quintals (100 kg)

### **Payment Methods**
Available payment options:
- **Cash**: Physical cash payment
- **Bank Transfer**: Electronic bank transfer
- **Cheque**: Bank cheque payment
- **UPI**: Unified Payment Interface
- **Credit**: Credit-based payment
- **Other**: Custom payment methods

### **Payment Status**
Payment tracking states:
- **Pending**: Payment not yet received
- **Partial**: Partial payment received
- **Completed**: Full payment received
- **Overdue**: Payment past due date

## File Upload Support

### **Supported Formats**
- **Images**: PNG, JPG, JPEG, GIF
- **Documents**: PDF, DOC, DOCX, XLS, XLSX
- **Text**: TXT, CSV

### **Upload Limits**
- **Maximum files**: 5 documents per sale
- **File size**: 10MB per file
- **Storage**: Organized by branch and module

## Security Features

### **Authentication**
- JWT token-based authentication
- Protected API endpoints
- User session management

### **Authorization**
- Branch-based access control
- Superadmin privileges
- User role restrictions

### **Data Validation**
- Input sanitization
- Schema validation
- File type verification

## Monitoring and Logging

### **Console Logs**
The system provides comprehensive logging:
```
=== CREATE BYPRODUCT SALE START ===
User info: { branch_id: 'branch1', createdBy: 'user1', isSuperAdmin: false }
Raw request body: { date: '2024-01-15', vehicleNumber: 'TN-20-BU-4006', ... }
Files received: [ { fieldname: 'documents', filename: 'invoice.pdf', ... } ]
=== CREATE BYPRODUCT SALE SUCCESS ===
```

### **Error Handling**
- Graceful error responses
- User-friendly error messages
- Detailed error logging
- Fallback mechanisms

## Future Enhancements

### **Planned Features**
1. **Invoice Generation**: Automatic invoice creation
2. **Payment Tracking**: Advanced payment monitoring
3. **Analytics Dashboard**: Sales performance metrics
4. **Mobile App**: Mobile-friendly interface
5. **Integration**: Connect with accounting systems

### **Customization Options**
- **Material pricing**: Dynamic pricing based on market rates
- **Vendor ratings**: Vendor performance tracking
- **Bulk operations**: Mass import/export functionality
- **Reporting**: Advanced reporting and analytics
- **Notifications**: Email/SMS alerts for payments

## Troubleshooting

### **Common Issues**

#### **1. File Upload Failures**
- Check file size limits
- Verify supported file types
- Ensure proper permissions

#### **2. Validation Errors**
- Review required field completion
- Check data format requirements
- Verify business logic rules

#### **3. API Connection Issues**
- Verify backend server status
- Check authentication tokens
- Review network connectivity

### **Debug Steps**
1. **Check browser console** for JavaScript errors
2. **Review server logs** for backend issues
3. **Verify API endpoints** are accessible
4. **Check user permissions** and branch access
5. **Validate data format** and required fields

## Conclusion

The Byproducts Sales System provides a comprehensive solution for managing rice mill byproduct sales. With its intuitive interface, robust backend, and extensive features, it streamlines the sales process while maintaining accurate records and ensuring compliance.

The system is designed to be:
- **User-friendly**: Easy to use interface
- **Scalable**: Handles growing business needs
- **Secure**: Protected data and access control
- **Flexible**: Customizable for different requirements
- **Reliable**: Robust error handling and validation

This system transforms byproduct sales management from manual processes to an automated, efficient, and accurate digital solution.
