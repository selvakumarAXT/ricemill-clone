import React, { useState } from 'react';
import PreviewInvoice from './PreviewInvoice';
import Button from './Button';

const PreviewInvoiceExample = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [currentInvoiceData, setCurrentInvoiceData] = useState(null);

  // Example 1: Rice Sale Invoice
  const riceSaleData = {
    // Company Information
    companyName: "SREE ESWAR HI-TECH MODERN RICE MILL",
    companyAddress1: "99, REDHILLS MAIN ROAD, KILANUR VILLAGE",
    companyAddress2: "THIRUVALLUR, Tamil Nadu (33) - 602021",
    companyGstin: "33AVLPV6754C3Z8",
    
    // Invoice Details
    invoiceNumber: "INV-RICE-2024-001",
    invoiceDate: "2024-01-15",
    invoiceTitle: "RICE SALES INVOICE",
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
      productName: "Rice Variety",
      hsn: "HSN Code",
      quantity: "Quantity (kg)",
      rate: "Rate per kg",
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
      discount: "Discount",
      totalAfterTax: "Grand Total"
    },
    termsLabel: "Payment Terms: 30 days",
    certificationText: "Certified that the particulars given above are true and correct.",
    signatureLabel: "Authorized Signatory"
  };

  // Example 2: Byproduct Sale Invoice
  const byproductData = {
    // Company Information
    companyName: "SREE ESWAR HI-TECH MODERN RICE MILL",
    companyAddress1: "99, REDHILLS MAIN ROAD, KILANUR VILLAGE",
    companyAddress2: "THIRUVALLUR, Tamil Nadu (33) - 602021",
    companyGstin: "33AVLPV6754C3Z8",
    
    // Invoice Details
    invoiceNumber: "INV-BP-2024-001",
    invoiceDate: "2024-01-15",
    invoiceTitle: "BYPRODUCT SALES INVOICE",
    reverseCharge: "No",
    placeOfSupply: "Tamil Nadu (33)",
    
    // Vendor Information
    vendorName: "XYZ VENDORS",
    vendorAddress: "456, INDUSTRIAL AREA, COIMBATORE",
    vendorPhone: "+91 8765432109",
    vendorEmail: "xyz@vendors.com",
    vendorGstin: "33XYZAB5678G2Z6",
    vendorPan: "XYZAB5678G",
    
    // Product Information
    material: "Rice Husk",
    weight: 1000,
    unit: "kg",
    rate: 5,
    totalAmount: 5000,
    
    // Tax Information
    cgst: 0,
    sgst: 0,
    taxableValue: 5000,
    
    // Custom Labels
    recipientTitle: "Vendor Details:",
    tableHeaders: {
      srNo: "S.No.",
      productName: "Byproduct",
      hsn: "HSN Code",
      quantity: "Weight (kg)",
      rate: "Rate per kg",
      taxableValue: "Amount",
      cgst: "CGST %",
      cgstAmount: "CGST Amt",
      sgst: "SGST %",
      sgstAmount: "SGST Amt",
      total: "Total Amount"
    },
    labels: {
      taxableAmount: "Sub Total",
      cgst: "CGST @ 0%",
      sgst: "SGST @ 0%",
      totalTax: "Total GST",
      discount: "Discount",
      totalAfterTax: "Grand Total"
    },
    termsLabel: "Payment Terms: Immediate",
    certificationText: "Certified that the particulars given above are true and correct.",
    signatureLabel: "Authorized Signatory"
  };

  // Example 3: Rice Deposit Invoice
  const riceDepositData = {
    // Company Information
    companyName: "SREE ESWAR HI-TECH MODERN RICE MILL",
    companyAddress1: "99, REDHILLS MAIN ROAD, KILANUR VILLAGE",
    companyAddress2: "THIRUVALLUR, Tamil Nadu (33) - 602021",
    companyGstin: "33AVLPV6754C3Z8",
    
    // Invoice Details
    invoiceNumber: "INV-DEP-2024-001",
    invoiceDate: "2024-01-15",
    invoiceTitle: "RICE DEPOSIT INVOICE",
    reverseCharge: "No",
    placeOfSupply: "Tamil Nadu (33)",
    
    // Depositor Information
    depositorName: "FARMER COOPERATIVE",
    depositorAddress: "789, VILLAGE ROAD, THIRUVALLUR",
    depositorPhone: "+91 7654321098",
    depositorEmail: "farmer@coop.com",
    depositorGstin: "33FARMER9876H3Z7",
    depositorPan: "FARMER9876H",
    
    // Product Information
    variety: "Raw Paddy",
    totalRiceDeposit: 2000,
    unit: "kg",
    rate: 25,
    totalAmount: 50000,
    
    // Tax Information
    cgst: 0,
    sgst: 0,
    taxableValue: 50000,
    
    // Custom Labels
    recipientTitle: "Depositor Details:",
    tableHeaders: {
      srNo: "S.No.",
      productName: "Rice Variety",
      hsn: "HSN Code",
      quantity: "Deposit (kg)",
      rate: "Rate per kg",
      taxableValue: "Amount",
      cgst: "CGST %",
      cgstAmount: "CGST Amt",
      sgst: "SGST %",
      sgstAmount: "SGST Amt",
      total: "Total Amount"
    },
    labels: {
      taxableAmount: "Sub Total",
      cgst: "CGST @ 0%",
      sgst: "SGST @ 0%",
      totalTax: "Total GST",
      discount: "Discount",
      totalAfterTax: "Grand Total"
    },
    termsLabel: "Storage Terms: 6 months",
    certificationText: "Certified that the particulars given above are true and correct.",
    signatureLabel: "Authorized Signatory"
  };

  const handlePreview = (data) => {
    setCurrentInvoiceData(data);
    setShowPreview(true);
  };

  const handleDownload = (data) => {
    console.log('Downloading invoice:', data);
    alert('Invoice download functionality coming soon!');
  };

  const closePreview = () => {
    setShowPreview(false);
    setCurrentInvoiceData(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Dynamic PreviewInvoice Component Examples
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Rice Sale Example */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Rice Sale Invoice</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p><strong>Customer:</strong> ABC TRADERS</p>
            <p><strong>Product:</strong> Premium Basmati Rice</p>
            <p><strong>Quantity:</strong> 500 kg</p>
            <p><strong>Amount:</strong> ₹60,000</p>
          </div>
          <Button 
            onClick={() => handlePreview(riceSaleData)}
            variant="primary"
            className="w-full"
          >
            Preview Rice Sale Invoice
          </Button>
        </div>

        {/* Byproduct Example */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-green-600">Byproduct Sale Invoice</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p><strong>Vendor:</strong> XYZ VENDORS</p>
            <p><strong>Product:</strong> Rice Husk</p>
            <p><strong>Weight:</strong> 1000 kg</p>
            <p><strong>Amount:</strong> ₹5,000</p>
          </div>
          <Button 
            onClick={() => handlePreview(byproductData)}
            variant="success"
            className="w-full"
          >
            Preview Byproduct Invoice
          </Button>
        </div>

        {/* Rice Deposit Example */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-purple-600">Rice Deposit Invoice</h2>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p><strong>Depositor:</strong> FARMER COOPERATIVE</p>
            <p><strong>Product:</strong> Raw Paddy</p>
            <p><strong>Deposit:</strong> 2000 kg</p>
            <p><strong>Amount:</strong> ₹50,000</p>
          </div>
          <Button 
            onClick={() => handlePreview(riceDepositData)}
            variant="info"
            className="w-full"
          >
            Preview Rice Deposit Invoice
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">How to Use:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>Click any of the preview buttons above to see the dynamic invoice</li>
          <li>Notice how all text, labels, and data come from the data object</li>
          <li>No hardcoded values - everything is customizable</li>
          <li>You can modify the data objects to match your business needs</li>
          <li>Use this component in your actual pages with your real data</li>
        </ol>
      </div>

      {/* Preview Modal */}
      <PreviewInvoice
        invoiceData={currentInvoiceData}
        show={showPreview}
        onClose={closePreview}
        onDownload={handleDownload}
        type="sale"
        title="Dynamic Invoice Preview"
      />
    </div>
  );
};

export default PreviewInvoiceExample;
