# Backend Invoice System Guide

## Overview

The Rice Mill Management System now uses a professional backend HTML template for invoice generation instead of frontend PDF generation. This system provides high-quality, consistent invoices with the exact format matching the reference image.

## System Architecture

### Backend Components

1. **HTML Template**: `backend/utils/pdf.html` - Professional invoice template
2. **Invoice Controller**: `backend/controllers/invoiceController.js` - Business logic
3. **Invoice Routes**: `backend/routes/invoices.js` - API endpoints
4. **PDF Generation**: Puppeteer for high-quality PDF output

### Frontend Components

1. **InvoiceGenerator**: `frontend/src/components/InvoiceGenerator.jsx` - User interface
2. **API Integration**: Backend API calls for invoice operations

## API Endpoints

### 1. Preview Invoice
```
POST /api/invoices/preview
```
**Purpose**: Generate invoice preview in HTML format
**Request Body**:
```json
{
  "sale": {
    "customerName": "ESWAR & CO",
    "customerAddress": "#189, JAYANAGAR 2ND MAIN ROAD, TIRUVALLUR",
    "customerPhone": "9659737475",
    "customerEmail": "eswarofficial@gmail.com",
    "customerGstin": "",
    "customerPan": "AVLP6754C",
    "riceVariety": "PADDY",
    "quantity": 69.37,
    "unitPrice": 1730.00,
    "totalAmount": 120010.10
  },
  "invoiceDetails": {
    "invoiceNumber": "4",
    "invoiceDate": "2025-04-21",
    "reverseCharge": "Yes",
    "placeOfSupply": "Tamil Nadu (33)",
    "hsnCode": "10064000",
    "cgstRate": 0,
    "sgstRate": 0,
    "discount": 10.00
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "invoiceData": { ... },
    "html": "<!DOCTYPE html>..."
  },
  "message": "Invoice preview generated successfully"
}
```

### 2. Download Invoice (PDF)
```
POST /api/invoices/download
```
**Purpose**: Generate and download invoice as PDF
**Request Body**: Same as preview endpoint
**Response**: PDF file download

### 3. Generate Invoice
```
POST /api/invoices/generate
```
**Purpose**: Generate invoice data and HTML
**Request Body**: Same as preview endpoint
**Response**: Invoice data and HTML template

## Invoice Template Features

### Company Header
- **Company Name**: SREE ESWAR HI-TECH MODERN RICE MILL
- **Address**: 99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR, THIRUVALLUR, Tamil Nadu (33) - 602021
- **GSTIN**: 33AVLPV6754C3Z8
- **Contact**: VIKRAMSELVAM, Phone: 8608012345, Email: eswarofficial@gmail.com

### Invoice Details
- **Document Type**: PURCHASE INVOICE
- **Invoice Number**: Auto-generated or custom
- **Invoice Date**: Formatted date (DD-MMM-YYYY)
- **Reverse Charge**: Yes/No
- **Copy Type**: ORIGINAL FOR RECIPIENT

### Vendor Details Section
- **M/S**: Customer name
- **Address**: Customer address with line breaks
- **Phone**: Customer phone number
- **GSTIN**: Customer GSTIN (or "-" if not provided)
- **PAN**: Customer PAN (or "-" if not provided)
- **Place of Supply**: State and code

### Product Table
| Column | Description | Data Source |
|--------|-------------|-------------|
| Sr. No. | Sequential number | Auto-generated |
| Name of Product/Service | Rice variety | `sale.riceVariety` |
| HSN/SAC | HSN code | `invoiceDetails.hsnCode` |
| Qty | Quantity in kg | `sale.quantity` |
| Rate | Unit price per kg | `sale.unitPrice` |
| Taxable Value | Quantity × Rate | Calculated |
| CGST % | CGST percentage | `invoiceDetails.cgstRate` |
| CGST Amount | Calculated CGST | Calculated |
| SGST % | SGST percentage | `invoiceDetails.sgstRate` |
| SGST Amount | Calculated SGST | Calculated |
| Total | Line total | Calculated |

### Financial Summary
- **Total in words**: Amount written in words (e.g., "ONE LAKH TWENTY THOUSAND RUPEES ONLY")
- **Taxable Amount**: Sum of all taxable values
- **Add: CGST**: Total CGST amount
- **Add: SGST**: Total SGST amount
- **Total Tax**: Sum of all taxes
- **Discount**: Total discount amount
- **Total Amount After Tax**: Final amount including taxes minus discounts

### Certification Section
- **Certification**: "Certified that the particulars given above are true and correct."
- **For**: SREE ESWAR HI-TECH MODERN RICE MILL
- **Authorised Signatory**: Space for signature

## Data Processing

### Number to Words Conversion
The system automatically converts amounts to words using the `numberToWords` function:

```javascript
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  // Conversion logic for numbers up to crores
  // Returns formatted string like "ONE LAKH TWENTY THOUSAND RUPEES ONLY"
};
```

### Date Formatting
Dates are automatically formatted to the required format:

```javascript
const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[d.getMonth()]}-${year}`;
};
```

### Tax Calculations
Automatic calculation of taxes based on rates:

```javascript
const taxableValue = sale.totalAmount;
const cgstAmount = (taxableValue * (invoiceDetails.cgstRate || 0)) / 100;
const sgstAmount = (taxableValue * (invoiceDetails.sgstRate || 0)) / 100;
const totalTax = cgstAmount + sgstAmount;
const grandTotal = taxableValue + totalTax - discount;
```

## PDF Generation Process

### 1. HTML Template Processing
- Read the HTML template file
- Replace example data with actual invoice data
- Inject data using JavaScript

### 2. Puppeteer PDF Generation
```javascript
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

const page = await browser.newPage();
await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
await page.waitForTimeout(1000);

const pdfBuffer = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: {
    top: '0.5in',
    right: '0.5in',
    bottom: '0.5in',
    left: '0.5in'
  }
});
```

### 3. PDF Download
- Set appropriate headers for PDF download
- Stream PDF buffer to client
- Automatic file naming: `Invoice-{number}.pdf`

## Frontend Integration

### InvoiceGenerator Component
The frontend component now provides:

1. **Preview Button**: Opens invoice preview in new window
2. **Download Button**: Downloads PDF from backend
3. **Generate Button**: Saves invoice to system

### API Calls
```javascript
// Preview invoice
const previewInvoice = async () => {
  const response = await fetch('/api/invoices/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      sale: sale,
      invoiceDetails: invoiceData
    })
  });
  
  const result = await response.json();
  const previewWindow = window.open('', '_blank');
  previewWindow.document.write(result.data.html);
  previewWindow.document.close();
};

// Download PDF
const downloadInvoice = async () => {
  const response = await fetch('/api/invoices/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      sale: sale,
      invoiceDetails: invoiceData
    })
  });

  const pdfBlob = await response.blob();
  const url = window.URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Invoice-${invoiceData.invoiceNumber}.pdf`;
  link.click();
  window.URL.revokeObjectURL(url);
};
```

## Installation and Setup

### Backend Dependencies
```bash
npm install puppeteer
```

### File Structure
```
backend/
├── utils/
│   └── pdf.html              # Invoice template
├── controllers/
│   └── invoiceController.js   # Invoice logic
├── routes/
│   └── invoices.js           # API routes
└── server.js                 # Main server file
```

### Server Configuration
Add invoice routes to `server.js`:
```javascript
app.use('/api/invoices', require('./routes/invoices'));
```

## Usage Examples

### Basic Invoice Generation
```javascript
// Frontend: Generate invoice
const invoiceData = {
  sale: {
    customerName: "ESWAR & CO",
    customerAddress: "#189, JAYANAGAR 2ND MAIN ROAD, TIRUVALLUR",
    customerPhone: "9659737475",
    riceVariety: "PADDY",
    quantity: 69.37,
    unitPrice: 1730.00,
    totalAmount: 120010.10
  },
  invoiceDetails: {
    invoiceNumber: "4",
    invoiceDate: "2025-04-21",
    reverseCharge: "Yes",
    discount: 10.00
  }
};

// Call API endpoints
await fetch('/api/invoices/preview', { ... });
await fetch('/api/invoices/download', { ... });
```

### Customizing Invoice Data
```javascript
// Modify company details in invoiceController.js
const invoiceData = {
  company: {
    name: "YOUR COMPANY NAME",
    addressHTML: "YOUR ADDRESS<br>WITH LINE BREAKS",
    contactName: "CONTACT PERSON",
    phone: "PHONE NUMBER",
    email: "EMAIL@DOMAIN.COM"
  },
  // ... other data
};
```

## Error Handling

### Common Errors
1. **Template File Not Found**: Check if `pdf.html` exists in `backend/utils/`
2. **Puppeteer Launch Failed**: Ensure Puppeteer is installed and has proper permissions
3. **Invalid Data**: Validate sale and invoice details before processing

### Error Responses
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Performance Considerations

### PDF Generation
- Puppeteer launches in headless mode for better performance
- Template caching for repeated use
- Async processing to avoid blocking

### Memory Management
- Proper cleanup of Puppeteer browser instances
- Stream PDF data instead of loading entire file into memory
- Timeout handling for long-running operations

## Security Features

### Authentication
- All endpoints require valid JWT token
- User authorization checks
- Input validation and sanitization

### File Access
- Template files are not directly accessible
- PDF generation happens server-side only
- No client-side file system access

## Future Enhancements

### Planned Features
1. **Invoice Templates**: Multiple template options
2. **Email Integration**: Send invoices via email
3. **Digital Signatures**: Add signature support
4. **QR Codes**: Include payment QR codes
5. **Multi-language**: Support for multiple languages
6. **Invoice History**: Database storage and retrieval

### Template Customization
1. **CSS Variables**: Easy color and style changes
2. **Layout Options**: Different invoice layouts
3. **Branding**: Company logo and custom styling
4. **Responsive Design**: Mobile-friendly templates

---

**Note**: This backend invoice system provides professional, consistent invoices while maintaining security and performance. The HTML template ensures exact format matching with the reference image.
