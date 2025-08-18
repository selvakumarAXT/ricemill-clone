# Sales Invoice Module - Complete Working Guide

## 🎯 Overview
The Sales Invoice module is a comprehensive invoice management system for the Rice Mill project. It allows users to create, preview, save, and print professional invoices with GST calculations, multiple items, additional charges, and various payment options.

## ✨ Features

### 📋 Core Functionality
- **Invoice Creation**: Create detailed invoices with customer information
- **Real-time Calculations**: Automatic GST, discount, and total calculations
- **Preview Mode**: Preview invoices before saving
- **Print & Download**: Print invoices or download as PDF
- **Form Validation**: Comprehensive validation for all required fields
- **Keyboard Shortcuts**: Quick access with Ctrl+P (preview) and Ctrl+S (save)

### 🧮 Calculation Features
- **IGST Calculation**: Support for both percentage and fixed amount
- **Document-level Discount**: Percentage or fixed amount discounts
- **TCS (Tax Collected at Source)**: Percentage or fixed amount
- **Round-off**: Optional rounding to nearest rupee
- **Additional Charges**: Multiple additional charges with descriptions
- **Real-time Updates**: Totals update automatically when items change

### 📊 Invoice Components
- **Customer Information**: Name, address, contact, GSTIN/PAN
- **Invoice Details**: Number, date, type, prefix/postfix
- **Product Items**: Multiple items with HSN codes, quantities, prices
- **Tax Information**: IGST, CESS calculations
- **Payment Details**: Payment type, due date, bank information
- **Terms & Conditions**: Customizable terms and additional notes

## 🚀 How to Use

### 1. Creating an Invoice
1. Navigate to the Sales Invoice page
2. Fill in customer information (required fields marked with *)
3. Add invoice details (type, number, date)
4. Add product items with quantities and prices
5. Configure tax rates and additional charges
6. Set payment terms and due date
7. Add terms and conditions

### 2. Previewing an Invoice
- Click the "👁️ Preview" button in the footer or invoice details section
- Use keyboard shortcut: `Ctrl+P` (Windows) or `Cmd+P` (Mac)
- The preview shows exactly how the invoice will look when printed
- You can save directly from the preview mode

### 3. Saving an Invoice
- Click "Save" to save without printing
- Click "Save & Print" to save and immediately open print modal
- Use keyboard shortcut: `Ctrl+S` (Windows) or `Cmd+S` (Mac)
- Validation errors will be shown if required fields are missing

### 4. Printing an Invoice
- After saving, the print modal opens automatically
- Click "🖨️ Print" to print the invoice
- Click "📄 Download PDF" to download as PDF
- The print version includes all professional formatting

## 🔧 Technical Implementation

### Frontend Components
- **SalesInvoice.jsx**: Main invoice creation component
- **InvoicePrint.jsx**: Invoice preview and print component
- **Button.jsx**: Reusable button component with variants
- **FormInput.jsx**: Form input component
- **FormSelect.jsx**: Form select component

### Backend Components
- **SalesInvoice.js**: MongoDB model with schema validation
- **salesInvoiceController.js**: API controller with CRUD operations
- **salesInvoices.js**: Express routes for API endpoints
- **salesInvoiceService.js**: Frontend service for API calls

### Key Functions
- `calculateTotals()`: Real-time calculation of all totals
- `validateForm()`: Comprehensive form validation
- `numberToWords()`: Convert numbers to words for amounts
- `createPreviewInvoice()`: Generate preview data
- `handleItemChange()`: Update item totals automatically

## 📝 Form Fields

### Required Fields
- Customer Name (M/S)
- Place of Supply
- Invoice Number
- Invoice Date
- Product Name
- Quantity
- Price
- Payment Type

### Optional Fields
- Customer Address
- Contact Person
- Phone Number
- GSTIN/PAN
- Shipping Address
- Additional Charges
- Terms & Conditions
- Document Notes

## 🧮 Calculation Logic

### Item Total Calculation
```
Taxable Amount = (Quantity × Price) - Item Discount
IGST Amount = Taxable Amount × IGST Rate (if percentage)
Item Total = Taxable Amount + IGST Amount + CESS
```

### Document Total Calculation
```
Subtotal = Sum of all item totals
Document Discount = Fixed amount or (Subtotal × Discount Rate)
TCS Amount = Fixed amount or (Subtotal × TCS Rate)
Grand Total = Subtotal - Document Discount + TCS Amount
Final Total = Round(Grand Total) if round-off enabled
```

## 🎨 UI Features

### Responsive Design
- Mobile-friendly layout
- Responsive tables and forms
- Adaptive button placement

### User Experience
- Real-time validation feedback
- Loading states for all actions
- Clear error messages
- Success confirmations
- Keyboard shortcuts for power users

### Visual Elements
- Professional invoice layout
- Color-coded status indicators
- Icons for better UX
- Clean, modern design

## 🔒 Validation Rules

### Customer Information
- Customer name is required
- Place of supply is required
- Valid phone number format (optional)

### Invoice Details
- Invoice number is required
- Invoice date is required
- Valid date formats

### Product Items
- At least one item required
- Product name cannot be default text
- Quantity must be greater than 0
- Price must be greater than 0

### Payment Information
- Payment type is required
- Due date validation

## 🚨 Error Handling

### Frontend Validation
- Real-time field validation
- Form submission validation
- User-friendly error messages
- Field-specific error highlighting

### Backend Validation
- Database schema validation
- Business logic validation
- API error responses
- Proper HTTP status codes

## 📊 Data Structure

### Invoice Object
```javascript
{
  customer: {
    name: String,
    address: String,
    contactPerson: String,
    phoneNo: String,
    gstinPan: String,
    reverseCharge: String,
    placeOfSupply: String,
    shippingAddress: String,
    useSameShippingAddress: Boolean
  },
  invoiceDetails: {
    invoiceNumber: String,
    invoicePrefix: String,
    invoicePostfix: String,
    invoiceType: String,
    invoiceDate: Date,
    dueDate: Date
  },
  items: [{
    productName: String,
    itemNote: String,
    hsnSacCode: String,
    quantity: Number,
    uom: String,
    price: Number,
    discount: Number,
    igstType: String,
    igstValue: Number,
    cess: Number,
    total: Number
  }],
  totals: {
    totalAmount: Number,
    totalDiscount: Number,
    totalTaxable: Number,
    totalIgst: Number,
    totalCess: Number,
    grandTotal: Number,
    amountInWords: String
  }
}
```

## 🎯 Best Practices

### Performance
- Debounced calculations for real-time updates
- Efficient re-rendering with React hooks
- Optimized API calls with proper caching

### Security
- Input sanitization
- XSS prevention
- CSRF protection
- Proper authentication checks

### Maintainability
- Modular component structure
- Reusable utility functions
- Clear naming conventions
- Comprehensive error handling

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Access the Application**
   - Navigate to the Sales Invoice page
   - Start creating invoices!

## 🧪 Testing

Run the test file to verify functionality:
```bash
node testSalesInvoice.js
```

This will test:
- Calculation functions
- Validation logic
- Number to words conversion
- Data structure integrity

## 📞 Support

For issues or questions:
1. Check the console for error messages
2. Verify all required fields are filled
3. Ensure backend server is running
4. Check network connectivity for API calls

## 🎉 Success!

The Sales Invoice module is now fully functional and ready for production use. It provides a professional, user-friendly interface for creating and managing invoices with comprehensive features and robust validation. 