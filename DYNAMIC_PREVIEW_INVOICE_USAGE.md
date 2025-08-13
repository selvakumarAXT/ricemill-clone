# Dynamic PreviewInvoice Component Usage Guide

## 🎯 **Overview**

The PreviewInvoice component is now **completely dynamic** with no hardcoded values. All text, labels, and data are driven by the `invoiceData` prop you pass to it.

## 📊 **Data Structure**

### **Basic Invoice Data Structure**

```javascript
const invoiceData = {
  // Company Information
  companyName: "YOUR COMPANY NAME",
  companyAddress1: "COMPANY ADDRESS LINE 1",
  companyAddress2: "COMPANY ADDRESS LINE 2",
  companyGstin: "YOUR GSTIN NUMBER",
  
  // Invoice Details
  invoiceNumber: "INV-001",
  invoiceDate: "2024-01-15",
  invoiceTitle: "CUSTOM INVOICE TITLE",
  reverseCharge: "No",
  placeOfSupply: "Your State (Code)",
  
  // Recipient Information
  customerName: "Customer Name",
  customerAddress: "Customer Address",
  customerPhone: "Phone Number",
  customerEmail: "email@example.com",
  customerGstin: "Customer GSTIN",
  customerPan: "Customer PAN",
  
  // Product Information
  productName: "Product Name",
  hsnCode: "HSN Code",
  quantity: 100,
  unit: "kg",
  rate: 50,
  totalAmount: 5000,
  
  // Tax Information
  cgst: 9,
  sgst: 9,
  taxableValue: 5000,
  
  // Labels and Customization
  recipientTitle: "Customer Detail:",
  tableHeaders: {
    srNo: "Sr. No.",
    productName: "Product Name",
    hsn: "HSN Code",
    quantity: "Quantity",
    rate: "Rate",
    taxableValue: "Taxable Value",
    cgst: "CGST %",
    cgstAmount: "CGST Amount",
    sgst: "SGST %",
    sgstAmount: "SGST Amount",
    total: "Total"
  },
  labels: {
    taxableAmount: "Taxable Amount",
    cgst: "Add : CGST",
    sgst: "Add : SGST",
    totalTax: "Total Tax",
    discount: "Discount",
    totalAfterTax: "Total Amount After Tax"
  },
  termsLabel: "Terms & Conditions",
  certificationText: "Custom certification text",
  signatureLabel: "Authorized Signatory"
};
```

## 🚀 **Usage Examples**

### **1. Basic Usage**

```jsx
import PreviewInvoice from './components/common/PreviewInvoice';

const MyComponent = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  
  const handlePreview = (record) => {
    setInvoiceData(record);
    setShowPreview(true);
  };
  
  return (
    <PreviewInvoice
      invoiceData={invoiceData}
      show={showPreview}
      onClose={() => setShowPreview(false)}
      onDownload={handleDownload}
      type="sale"
      title="Invoice Preview"
    />
  );
};
```

### **2. Custom Company Information**

```jsx
const customInvoiceData = {
  companyName: "ABC RICE MILLS PRIVATE LIMITED",
  companyAddress1: "123, INDUSTRIAL AREA, MAIN ROAD",
  companyAddress2: "MUMBAI, Maharashtra (27) - 400001",
  companyGstin: "27ABCDE1234F1Z5",
  
  // ... other invoice data
};
```

### **3. Custom Labels and Headers**

```jsx
const customLabelsData = {
  // ... basic invoice data
  
  recipientTitle: "Buyer Details:",
  tableHeaders: {
    srNo: "S.No.",
    productName: "Item Description",
    hsn: "HSN/SAC",
    quantity: "Qty",
    rate: "Unit Price",
    taxableValue: "Amount",
    cgst: "CGST %",
    cgstAmount: "CGST Amt",
    sgst: "SGST %",
    sgstAmount: "SGST Amt",
    total: "Total Amount"
  },
  labels: {
    taxableAmount: "Sub Total",
    cgst: "CGST @ 9%",
    sgst: "SGST @ 9%",
    totalTax: "Total GST",
    discount: "Less Discount",
    totalAfterTax: "Grand Total"
  }
};
```

### **4. Multi-language Support**

```jsx
const hindiInvoiceData = {
  // ... basic invoice data
  
  invoiceTitle: "बिक्री चालान",
  recipientTitle: "ग्राहक का विवरण:",
  tableHeaders: {
    srNo: "क्रम संख्या",
    productName: "उत्पाद का नाम",
    hsn: "HSN कोड",
    quantity: "मात्रा",
    rate: "दर",
    taxableValue: "कर योग्य राशि",
    cgst: "CGST %",
    cgstAmount: "CGST राशि",
    sgst: "SGST %",
    sgstAmount: "SGST राशि",
    total: "कुल राशि"
  },
  labels: {
    taxableAmount: "कर योग्य राशि",
    cgst: "CGST जोड़ें",
    sgst: "SGST जोड़ें",
    totalTax: "कुल कर",
    discount: "छूट",
    totalAfterTax: "कर के बाद कुल राशि"
  },
  certificationText: "प्रमाणित किया जाता है कि उपरोक्त विवरण सत्य और सही हैं।",
  signatureLabel: "अधिकृत हस्ताक्षरकर्ता"
};
```

## 🔧 **Field Mapping**

### **Automatic Field Detection**

The component automatically maps fields based on common naming conventions:

```javascript
// Recipient Information - Multiple field names supported
name: invoiceData.customerName || invoiceData.vendorName || invoiceData.depositorName || invoiceData.depositGodown

// Product Information - Multiple field names supported
name: invoiceData.productName || invoiceData.riceVariety || invoiceData.material || invoiceData.variety

// Quantity - Multiple field names supported
quantity: invoiceData.quantity || invoiceData.weight || invoiceData.totalRiceDeposit || invoiceData.riceBag

// Rate - Multiple field names supported
rate: invoiceData.rate || invoiceData.unitPrice

// Amount - Multiple field names supported
total: invoiceData.totalAmount || invoiceData.taxableValue
```

### **Priority Order**

The component uses a priority system for field mapping:

1. **Primary Field Names**: `customerName`, `productName`, `quantity`, `rate`, `totalAmount`
2. **Alternative Field Names**: `vendorName`, `riceVariety`, `weight`, `unitPrice`, `taxableValue`
3. **Fallback Values**: Generic labels like "Recipient Name", "Product", etc.

## 🎨 **Customization Options**

### **1. Company Branding**

```javascript
const brandedData = {
  companyName: "YOUR COMPANY NAME",
  companyAddress1: "COMPANY ADDRESS LINE 1",
  companyAddress2: "COMPANY ADDRESS LINE 2",
  companyGstin: "YOUR GSTIN",
  
  // Custom styling can be added via CSS classes
  className: "custom-invoice-style"
};
```

### **2. Table Customization**

```javascript
const customTableData = {
  // Custom column headers
  tableHeaders: {
    srNo: "S.No.",
    productName: "Item Description",
    hsn: "HSN/SAC Code",
    quantity: "Quantity",
    rate: "Unit Price",
    taxableValue: "Amount",
    cgst: "CGST %",
    cgstAmount: "CGST Amount",
    sgst: "SGST %",
    sgstAmount: "SGST Amount",
    total: "Total Amount"
  }
};
```

### **3. Financial Labels**

```javascript
const customFinancialData = {
  // Custom financial calculation labels
  labels: {
    taxableAmount: "Sub Total",
    cgst: "CGST @ 9%",
    sgst: "SGST @ 9%",
    totalTax: "Total GST",
    discount: "Less Discount",
    totalAfterTax: "Grand Total"
  }
};
```

## 📱 **Responsive Behavior**

The component automatically adapts to different screen sizes:

- **Desktop**: Full table layout with all columns
- **Tablet**: Adjusted spacing and font sizes
- **Mobile**: Stacked layout for better readability

## 🔍 **Error Handling**

The component gracefully handles missing data:

```javascript
// If a field is missing, it shows a fallback value
name: invoiceData.customerName || 'Recipient Name'
address: invoiceData.customerAddress || 'Recipient Address'
phone: invoiceData.customerPhone || 'Phone Number'

// If no data is provided, it shows placeholder text
companyName: invoiceData.companyName || 'COMPANY NAME'
```

## 🚀 **Advanced Usage**

### **1. Dynamic Invoice Types**

```jsx
// The component automatically adapts based on data structure
const riceSaleData = {
  companyName: "RICE MILL COMPANY",
  customerName: "Customer Name",
  riceVariety: "Basmati",
  quantity: 500,
  unitPrice: 120,
  totalAmount: 60000
};

const byproductData = {
  companyName: "RICE MILL COMPANY",
  vendorName: "Vendor Name",
  material: "Husk",
  weight: 1000,
  rate: 5,
  totalAmount: 5000
};
```

### **2. Custom Calculations**

```jsx
const customCalculationData = {
  // ... basic data
  
  // Custom calculation functions can be passed
  customCalculations: {
    calculateTax: (amount, rate) => (amount * rate) / 100,
    calculateTotal: (amount, tax, discount) => amount + tax - discount
  }
};
```

## 📋 **Complete Example**

```jsx
import React, { useState } from 'react';
import PreviewInvoice from './components/common/PreviewInvoice';

const InvoiceExample = () => {
  const [showPreview, setShowPreview] = useState(false);
  
  const sampleInvoiceData = {
    // Company Information
    companyName: "SREE ESWAR HI-TECH MODERN RICE MILL",
    companyAddress1: "99, REDHILLS MAIN ROAD, KILANUR VILLAGE",
    companyAddress2: "THIRUVALLUR, Tamil Nadu (33) - 602021",
    companyGstin: "33AVLPV6754C3Z8",
    
    // Invoice Details
    invoiceNumber: "INV-2024-001",
    invoiceDate: "2024-01-15",
    invoiceTitle: "SALES INVOICE",
    reverseCharge: "No",
    placeOfSupply: "Tamil Nadu (33)",
    
    // Customer Information
    customerName: "ABC TRADERS",
    customerAddress: "123, MAIN STREET, CHENNAI",
    customerPhone: "+91 9876543210",
    customerEmail: "abc@traders.com",
    customerGstin: "33ABCDE1234F1Z5",
    customerPan: "ABCDE1234F",
    
    // Product Information
    productName: "Premium Basmati Rice",
    hsnCode: "10064000",
    quantity: 500,
    unit: "kg",
    rate: 120,
    totalAmount: 60000,
    
    // Tax Information
    cgst: 9,
    sgst: 9,
    taxableValue: 60000,
    
    // Custom Labels
    recipientTitle: "Customer Details:",
    tableHeaders: {
      srNo: "S.No.",
      productName: "Product Description",
      hsn: "HSN Code",
      quantity: "Quantity",
      rate: "Unit Price",
      taxableValue: "Amount",
      cgst: "CGST %",
      cgstAmount: "CGST Amt",
      sgst: "SGST %",
      sgstAmount: "SGST Amt",
      total: "Total"
    },
    labels: {
      taxableAmount: "Sub Total",
      cgst: "CGST @ 9%",
      sgst: "SGST @ 9%",
      totalTax: "Total GST",
      discount: "Discount",
      totalAfterTax: "Grand Total"
    },
    termsLabel: "Payment Terms: 30 days",
    certificationText: "Certified that the particulars given above are true and correct.",
    signatureLabel: "Authorized Signatory"
  };
  
  const handleDownload = (data) => {
    console.log('Downloading invoice:', data);
    // Implement PDF download logic
  };
  
  return (
    <div>
      <button onClick={() => setShowPreview(true)}>
        Preview Invoice
      </button>
      
      <PreviewInvoice
        invoiceData={sampleInvoiceData}
        show={showPreview}
        onClose={() => setShowPreview(false)}
        onDownload={handleDownload}
        type="sale"
        title="Invoice Preview"
      />
    </div>
  );
};

export default InvoiceExample;
```

## 🎯 **Best Practices**

### **1. Data Preparation**
- Ensure all required fields are present
- Use consistent field naming conventions
- Provide fallback values for optional fields

### **2. Performance**
- Only pass necessary data
- Avoid deep object nesting
- Use memoization for large datasets

### **3. Accessibility**
- Provide meaningful fallback text
- Ensure proper contrast ratios
- Support screen readers

## 🔮 **Future Enhancements**

1. **Template System**: Multiple invoice design templates
2. **Print Optimization**: Better print layout and styling
3. **Digital Signatures**: E-signature integration
4. **Multi-language Support**: Built-in language packs
5. **Advanced Calculations**: Complex tax and discount scenarios

---

## 📞 **Support**

For questions or issues:
1. Check this documentation
2. Review the component code
3. Test with sample data
4. Create an issue in the project repository

---

**Status**: ✅ **FULLY DYNAMIC - NO HARDCODED VALUES**
**Flexibility**: 🚀 **UNLIMITED CUSTOMIZATION OPTIONS**
**Next Phase**: Ready for any business requirements
