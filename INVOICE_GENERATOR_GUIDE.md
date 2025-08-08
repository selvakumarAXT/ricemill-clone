# Invoice Generator Guide

## Overview

The Sales & Dispatch module now includes a comprehensive invoice generator that creates purchase invoices matching the exact format shown in the reference image. The invoice generator produces professional PDF invoices with the SREE ESWAR HI-TECH MODERN RICE MILL branding.

## Features

### 🎯 Exact Format Matching
- **Company Header**: SREE ESWAR HI-TECH MODERN RICE MILL with complete address and GSTIN
- **Invoice Type**: Purchase Invoice format
- **Vendor Details**: Complete customer information section
- **Product Table**: Detailed item listing with HSN codes, quantities, rates, and taxes
- **Financial Summary**: Taxable amount, CGST/SGST breakdown, discounts, and grand total
- **Certification**: Professional certification and authorized signatory section

### 📄 PDF Generation
- High-quality PDF output using html2canvas and jsPDF
- Professional formatting with proper fonts and spacing
- Automatic page breaks for long invoices
- Downloadable files with proper naming convention

### 🔧 Customizable Fields
- Invoice number and dates
- Customer GSTIN, PAN, and contact details
- Product details (quantity, rate, HSN code)
- Tax rates (CGST, SGST)
- Discounts and terms
- Place of supply

## How to Use

### 1. Access the Invoice Generator
1. Navigate to **Sales & Dispatch** module
2. Find a sales record that needs an invoice
3. Click the **"Generate Invoice"** button

### 2. Configure Invoice Details
The invoice generator will open with pre-filled data from the sale record:

#### Basic Information
- **Invoice Number**: Auto-generated (can be modified)
- **Invoice Date**: Current date (can be changed)
- **Due Date**: 30 days from invoice date (can be modified)
- **Reverse Charge**: Default "No" (can be changed to "Yes")

#### Customer Information
- **Customer GSTIN**: From sale record (can be added/modified)
- **Customer PAN**: From sale record (can be added/modified)
- **Customer Email**: From sale record (can be added/modified)
- **Place of Supply**: From sale record (defaults to Tamil Nadu)

#### Product Details
- **HSN Code**: Default "10064000" for rice products
- **Quantity**: From sale record (can be modified)
- **Rate**: From sale record (can be modified)
- **Discount**: Can be added (defaults to 0)

### 3. Review and Generate
1. **Review the invoice totals** in the green summary box
2. **Verify all customer and product details**
3. **Click "Download PDF"** to generate and download the invoice
4. **Click "Generate Invoice"** to save the invoice to the system

## Invoice Format Details

### Header Section
```
SREE ESWAR HI-TECH MODERN RICE MILL
99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR, THIRUVALLUR, Tamil Nadu (33) - 602021
GSTIN: 33AVLPV6754C3Z8
```

### Invoice Details
- **Document Type**: PURCHASE INVOICE
- **Invoice Number**: Auto-generated sequential number
- **Invoice Date**: Current date
- **Reverse Charge**: Yes/No
- **Original For**: RECIPIENT

### Vendor Details Section
- **M/S**: Customer name
- **Address**: Complete customer address
- **Phone**: Customer phone number
- **Email**: Customer email (if available)
- **GSTIN**: Customer GSTIN (if available)
- **PAN**: Customer PAN (if available)
- **Place of Supply**: State and code

### Product Table
| Column | Description |
|--------|-------------|
| Sr. No. | Sequential number (1, 2, 3...) |
| Name of Product/Service | Rice variety (e.g., PADDY) |
| HSN/SAC | HSN code (default: 10064000) |
| Qty | Quantity in kg |
| Rate | Unit price per kg |
| Taxable Value | Quantity × Rate |
| CGST % | CGST percentage (default: 0%) |
| CGST Amount | Calculated CGST amount |
| SGST % | SGST percentage (default: 0%) |
| SGST Amount | Calculated SGST amount |
| Total | Total amount for the item |

### Financial Summary
- **Total in words**: Amount written in words
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

## Technical Implementation

### Components Used
- **InvoiceGenerator.jsx**: Main invoice generator component
- **DialogBox**: Modal container
- **FormInput**: Input fields for data entry
- **Button**: Action buttons

### PDF Generation Process
1. **HTML Template**: Creates invoice HTML with exact styling
2. **Canvas Conversion**: Uses html2canvas to convert HTML to image
3. **PDF Creation**: Uses jsPDF to create PDF from canvas
4. **Download**: Automatically downloads the generated PDF

### Data Flow
1. **Sale Record** → Invoice Generator
2. **User Input** → Invoice Data Updates
3. **Invoice Data** → PDF Generation
4. **PDF** → Download/Save

## File Structure

```
frontend/src/
├── components/
│   ├── InvoiceGenerator.jsx          # Main invoice generator
│   ├── InvoicePrint.jsx              # Existing invoice print component
│   └── common/
│       ├── DialogBox.jsx             # Modal container
│       ├── FormInput.jsx             # Input fields
│       └── Button.jsx                # Action buttons
├── pages/
│   └── SalesDispatch.jsx             # Updated with invoice generator
└── services/
    └── salesInvoiceService.js        # Invoice-related API calls
```

## Dependencies

### Required Libraries
- **html2canvas**: HTML to canvas conversion
- **jspdf**: PDF generation from canvas
- **React**: UI framework
- **Redux**: State management

### Installation
```bash
npm install html2canvas jspdf
```

## Customization Options

### Company Information
To modify company details, edit the `InvoiceGenerator.jsx` file:

```javascript
// Company header section
<h1 style="margin: 0; color: #333; font-size: 24px; font-weight: bold;">
  SREE ESWAR HI-TECH MODERN RICE MILL
</h1>
<p style="margin: 5px 0; color: #666; font-size: 12px;">
  99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR, THIRUVALLUR, Tamil Nadu (33) - 602021
</p>
<p style="margin: 5px 0; color: #666; font-size: 12px;">
  GSTIN: 33AVLPV6754C3Z8
</p>
```

### Tax Rates
To modify default tax rates, update the calculation logic:

```javascript
const cgstAmount = (taxableValue * updated.cgstRate) / 100;
const sgstAmount = (taxableValue * updated.sgstRate) / 100;
```

### HSN Codes
To add more HSN codes, update the default HSN code:

```javascript
hsnCode: '10064000', // Default HSN code for rice
```

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check if html2canvas and jspdf are installed
   - Ensure the invoice content is properly rendered
   - Check browser console for errors

2. **Invoice Numbers Not Sequential**
   - The invoice number generation can be customized
   - Currently uses random numbers for demo purposes
   - Can be connected to backend for proper sequencing

3. **Tax Calculations Incorrect**
   - Verify tax rates in the form
   - Check the calculation logic in handleInputChange
   - Ensure all amounts are properly formatted

### Error Handling
The invoice generator includes error handling for:
- PDF generation failures
- Invalid data input
- Network issues
- Browser compatibility

## Future Enhancements

### Planned Features
- **Email Integration**: Send invoices directly via email
- **Template System**: Multiple invoice templates
- **Digital Signatures**: Add digital signature support
- **QR Code**: Add QR codes for digital payments
- **Multi-language**: Support for multiple languages
- **Bulk Generation**: Generate multiple invoices at once

### Backend Integration
- **Database Storage**: Save invoices to database
- **Invoice History**: Track all generated invoices
- **User Permissions**: Role-based access control
- **Audit Trail**: Track invoice modifications

## Support

For technical support or feature requests:
1. Check the troubleshooting section
2. Review the code comments
3. Test with the provided test file
4. Contact the development team

---

**Note**: This invoice generator is designed to match the exact format of the reference image while providing flexibility for customization and future enhancements. 