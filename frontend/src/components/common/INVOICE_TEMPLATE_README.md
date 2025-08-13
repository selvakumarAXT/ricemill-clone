# InvoiceTemplate Component

A universal, reusable invoice template component that can handle **Sales**, **Byproducts**, and **Purchase** invoices with live preview functionality.

## 🚀 Features

- **Universal Template**: Single component for all invoice types
- **Live Preview**: See exactly how your invoice will look before generating
- **Auto Calculations**: Automatic tax and total calculations
- **Professional Layout**: Company-branded, print-ready design
- **Responsive Design**: Works perfectly on all devices
- **Type Detection**: Automatically adapts based on invoice type

## 📋 Supported Invoice Types

### 1. Sales Invoice (`type="sale"`)
- Rice sales to customers
- Customer details and billing information
- Product specifications and pricing

### 2. Byproduct Invoice (`type="byproduct"`)
- Sales of byproducts (husk, bran, broken rice, etc.)
- Vendor information and material details
- Weight and rate calculations

### 3. Purchase Invoice (`type="purchase"`)
- Purchases from vendors
- Vendor details and product information
- Purchase order tracking

## 🛠️ Usage

### Basic Implementation

```jsx
import InvoiceTemplate from './components/common/InvoiceTemplate';

const MyComponent = () => {
  const [showInvoice, setShowInvoice] = useState(false);
  
  const handleGenerateInvoice = (invoiceData) => {
    console.log('Generated Invoice:', invoiceData);
    // Handle invoice generation logic
  };

  return (
    <InvoiceTemplate
      record={yourRecordData}
      show={showInvoice}
      onClose={() => setShowInvoice(false)}
      onGenerate={handleGenerateInvoice}
      type="sale" // or "byproduct" or "purchase"
      title="Generate Invoice"
    />
  );
};
```

### Complete Example

```jsx
import React, { useState } from 'react';
import InvoiceTemplate from './components/common/InvoiceTemplate';
import Button from './components/common/Button';

const InvoiceExample = () => {
  const [showSaleInvoice, setShowSaleInvoice] = useState(false);
  const [showByproductInvoice, setShowByproductInvoice] = useState(false);
  const [showPurchaseInvoice, setShowPurchaseInvoice] = useState(false);

  // Sample data for different invoice types
  const saleData = {
    _id: 'sale1',
    orderNumber: 'ORD-001',
    customerName: 'ABC Traders',
    customerPhone: '+91 9876543210',
    customerEmail: 'abc@example.com',
    customerAddress: '123 Main St, City',
    customerGstin: '22AAAAA0000A1Z5',
    customerPan: 'ABCD1234EFGH',
    placeOfSupply: 'Maharashtra',
    riceVariety: 'Basmati',
    quantity: 500,
    unitPrice: 120,
    totalAmount: 60000
  };

  const byproductData = {
    _id: 'byproduct1',
    date: '2024-01-15',
    vehicleNumber: 'TN-20-BU-4006',
    material: 'Husk',
    weight: 5000,
    unit: 'kg',
    rate: 2.5,
    totalAmount: 12500,
    vendorName: 'ABC Traders',
    vendorPhone: '+91 9876543210',
    vendorEmail: 'abc@example.com',
    vendorAddress: '123 Main St, Chennai',
    vendorGstin: '33AAAAA0000A1Z5',
    vendorPan: 'ABCD1234EFGH'
  };

  const purchaseData = {
    _id: 'purchase1',
    orderNumber: 'PUR-001',
    vendorName: 'XYZ Suppliers',
    vendorPhone: '+91 8765432109',
    vendorEmail: 'xyz@example.com',
    vendorAddress: '456 Supplier Rd, City',
    vendorGstin: '33BBBBB0000B2Z6',
    vendorPan: 'EFGH5678IJKL',
    productName: 'Raw Paddy',
    quantity: 1000,
    unit: 'kg',
    unitPrice: 45,
    totalAmount: 45000
  };

  const handleGenerateInvoice = (invoiceData) => {
    console.log('Generated Invoice Data:', invoiceData);
    alert(`${invoiceData.type.toUpperCase()} invoice generated successfully!`);
    
    // Close the appropriate modal
    if (invoiceData.type === 'sale') setShowSaleInvoice(false);
    else if (invoiceData.type === 'byproduct') setShowByproductInvoice(false);
    else if (invoiceData.type === 'purchase') setShowPurchaseInvoice(false);
  };

  return (
    <div className="space-y-4">
      {/* Sales Invoice */}
      <Button onClick={() => setShowSaleInvoice(true)}>
        Generate Sales Invoice
      </Button>

      {/* Byproduct Invoice */}
      <Button onClick={() => setShowByproductInvoice(true)}>
        Generate Byproduct Invoice
      </Button>

      {/* Purchase Invoice */}
      <Button onClick={() => setShowPurchaseInvoice(true)}>
        Generate Purchase Invoice
      </Button>

      {/* Invoice Modals */}
      <InvoiceTemplate
        record={saleData}
        show={showSaleInvoice}
        onClose={() => setShowSaleInvoice(false)}
        onGenerate={handleGenerateInvoice}
        type="sale"
        title="Generate Sales Invoice"
      />

      <InvoiceTemplate
        record={byproductData}
        show={showByproductInvoice}
        onClose={() => setShowByproductInvoice(false)}
        onGenerate={handleGenerateInvoice}
        type="byproduct"
        title="Generate Byproduct Invoice"
      />

      <InvoiceTemplate
        record={purchaseData}
        show={showPurchaseInvoice}
        onClose={() => setShowPurchaseInvoice(false)}
        onGenerate={handleGenerateInvoice}
        type="purchase"
        title="Generate Purchase Invoice"
      />
    </div>
  );
};
```

## 📊 Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `record` | `object` | ✅ | The data record (sale, byproduct, or purchase) |
| `show` | `boolean` | ✅ | Controls modal visibility |
| `onClose` | `function` | ✅ | Function to close the modal |
| `onGenerate` | `function` | ✅ | Function called when invoice is generated |
| `type` | `string` | ❌ | Invoice type: `'sale'`, `'byproduct'`, or `'purchase'` (default: `'sale'`) |
| `title` | `string` | ❌ | Modal title (default: `'Generate Invoice'`) |

## 🔧 Data Structure Requirements

### Sales Record (`type="sale"`)
```javascript
{
  _id: 'string',
  orderNumber: 'string',
  customerName: 'string',
  customerPhone: 'string',
  customerEmail: 'string',
  customerAddress: 'string',
  customerGstin: 'string',
  customerPan: 'string',
  placeOfSupply: 'string',
  riceVariety: 'string',
  quantity: 'number',
  unitPrice: 'number',
  totalAmount: 'number'
}
```

### Byproduct Record (`type="byproduct"`)
```javascript
{
  _id: 'string',
  date: 'string',
  vehicleNumber: 'string',
  material: 'string',
  weight: 'number',
  unit: 'string',
  rate: 'number',
  totalAmount: 'number',
  vendorName: 'string',
  vendorPhone: 'string',
  vendorEmail: 'string',
  vendorAddress: 'string',
  vendorGstin: 'string',
  vendorPan: 'string'
}
```

### Purchase Record (`type="purchase"`)
```javascript
{
  _id: 'string',
  orderNumber: 'string',
  vendorName: 'string',
  vendorPhone: 'string',
  vendorEmail: 'string',
  vendorAddress: 'string',
  vendorGstin: 'string',
  vendorPan: 'string',
  productName: 'string',
  quantity: 'number',
  unit: 'string',
  unitPrice: 'number',
  totalAmount: 'number'
}
```

## 🎨 Invoice Preview Features

### Live Preview Modal
- **Professional Layout**: Company branding and professional design
- **Real-time Updates**: See changes as you type
- **Responsive Design**: Optimized for all screen sizes
- **Print-Ready**: Perfect for PDF generation and printing

### Preview Content
- Company header with logo and address
- Invoice details (number, date, due date)
- Customer/Vendor information
- Product details table
- Tax calculations (CGST/SGST)
- Financial summary
- Professional footer with signature

## 🧮 Auto Calculations

The component automatically calculates:
- **Taxable Amount**: Quantity × Rate
- **CGST Amount**: Taxable Amount × CGST Rate
- **SGST Amount**: Taxable Amount × SGST Rate
- **Total Tax**: CGST + SGST
- **Grand Total**: Taxable Amount + Total Tax - Discount
- **Amount in Words**: Automatic number to words conversion

## 🔄 Integration with Existing Code

### Replacing InvoiceGenerator
If you're currently using the old `InvoiceGenerator` component:

```jsx
// Old usage
<InvoiceGenerator
  sale={selectedSale}
  show={showInvoiceGenerator}
  onClose={closeInvoiceGenerator}
  onGenerate={handleGenerateInvoice}
/>

// New usage
<InvoiceTemplate
  record={selectedSale}
  show={showInvoiceGenerator}
  onClose={closeInvoiceGenerator}
  onGenerate={handleGenerateInvoice}
  type="sale"
  title="Generate Sales Invoice"
/>
```

### Handling Different Invoice Types
```jsx
const handleGenerateInvoice = (invoiceData) => {
  // The component automatically detects the type
  if (invoiceData.type === 'byproduct') {
    // Handle byproduct invoice
    updateByproductInvoice(invoiceData);
  } else if (invoiceData.type === 'sale') {
    // Handle sales invoice
    updateSalesInvoice(invoiceData);
  } else if (invoiceData.type === 'purchase') {
    // Handle purchase invoice
    updatePurchaseInvoice(invoiceData);
  }
};
```

## 🎯 Best Practices

1. **Type Detection**: Always specify the correct `type` prop for proper data handling
2. **Data Validation**: Ensure your record data matches the required structure
3. **Error Handling**: Implement proper error handling in your `onGenerate` function
4. **State Management**: Use local state to control modal visibility
5. **Responsive Design**: Test on different screen sizes for optimal user experience

## 🚀 Advanced Features

### Custom Invoice Numbers
The component automatically generates invoice numbers based on type:
- **Sales**: `INV-YYYYMMDD-XXX`
- **Byproducts**: `INV-BP-YYYYMMDD-XXX`
- **Purchases**: `INV-PUR-YYYYMMDD-XXX`

### Tax Management
- Support for CGST and SGST rates
- Automatic tax calculations
- Configurable tax percentages
- Professional tax summary display

### Professional Layout
- Company branding integration
- Professional typography
- Print-optimized design
- Signature space for authorized personnel

## 🔍 Troubleshooting

### Common Issues

1. **Modal not showing**: Check if `show` prop is `true`
2. **Data not loading**: Verify `record` prop contains valid data
3. **Calculations wrong**: Ensure quantity and rate are numbers
4. **Preview not working**: Check browser console for errors

### Debug Mode
Enable console logging to see what data is being processed:
```jsx
const handleGenerateInvoice = (invoiceData) => {
  console.log('Invoice Data:', invoiceData);
  console.log('Record:', invoiceData.record);
  console.log('Type:', invoiceData.type);
  // Your logic here
};
```

## 📱 Responsive Design

The component is fully responsive and works on:
- **Desktop**: Full-size modal with side-by-side layout
- **Tablet**: Optimized spacing and grid layouts
- **Mobile**: Stacked layout with touch-friendly controls

## 🎨 Customization

### Styling
The component uses Tailwind CSS classes and can be customized by:
- Modifying the component's CSS classes
- Overriding default styles with custom CSS
- Using CSS-in-JS solutions

### Layout
- Adjust modal size using the `size` prop
- Customize form fields and validation
- Modify preview layout and styling

## 🔮 Future Enhancements

Planned features for future versions:
- **Multi-language Support**: Hindi, Tamil, and other regional languages
- **Template Selection**: Multiple invoice design templates
- **Digital Signatures**: E-signature integration
- **Email Integration**: Direct email sending functionality
- **Cloud Storage**: Invoice storage and retrieval
- **Analytics**: Invoice generation statistics and reports

---

## 📞 Support

For questions, issues, or feature requests:
1. Check this documentation first
2. Review the component code
3. Test with the demo component
4. Create an issue in the project repository

---

**Happy Invoice Generation! 🎉**
