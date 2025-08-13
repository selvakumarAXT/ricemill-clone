import React, { useState } from 'react';
import InvoiceTemplate from './InvoiceTemplate';
import Button from './Button';

const InvoiceTemplateDemo = () => {
  const [showSaleInvoice, setShowSaleInvoice] = useState(false);
  const [showByproductInvoice, setShowByproductInvoice] = useState(false);
  const [showPurchaseInvoice, setShowPurchaseInvoice] = useState(false);

  // Mock data for different invoice types
  const mockSaleData = {
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
    totalAmount: 60000,
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-20',
    paymentStatus: 'completed',
    deliveryStatus: 'delivered',
    paymentMethod: 'bank_transfer',
    notes: 'Premium quality rice'
  };

  const mockByproductData = {
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
    vendorPan: 'ABCD1234EFGH',
    paymentMethod: 'Cash',
    paymentStatus: 'Completed',
    notes: 'Monthly husk supply'
  };

  const mockPurchaseData = {
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
    totalAmount: 45000,
    orderDate: '2024-01-15',
    deliveryDate: '2024-01-18',
    paymentStatus: 'pending',
    notes: 'Premium quality raw paddy'
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Invoice Template Demo</h1>
        <p className="text-gray-600 text-lg">
          Universal invoice template for Sales, Byproducts, and Purchases with preview functionality
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Sales Invoice Demo */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Sales Invoice</h3>
            <p className="text-gray-600 text-sm mb-4">
              Generate invoices for rice sales with customer details
            </p>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="text-sm">
              <span className="text-gray-600">Customer:</span>
              <span className="ml-2 font-medium">{mockSaleData.customerName}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Product:</span>
              <span className="ml-2 font-medium text-green-600">{mockSaleData.riceVariety}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-medium text-green-600">₹{mockSaleData.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={() => setShowSaleInvoice(true)}
            variant="primary"
            className="w-full"
          >
            Generate Sales Invoice
          </Button>
        </div>

        {/* Byproduct Invoice Demo */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Byproduct Invoice</h3>
            <p className="text-gray-600 text-sm mb-4">
              Create invoices for byproduct sales (husk, bran, etc.)
            </p>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="text-sm">
              <span className="text-gray-600">Vendor:</span>
              <span className="ml-2 font-medium">{mockByproductData.vendorName}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Material:</span>
              <span className="ml-2 font-medium text-green-600">{mockByproductData.material}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-medium text-green-600">₹{mockByproductData.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={() => setShowByproductInvoice(true)}
            variant="primary"
            className="w-full"
          >
            Generate Byproduct Invoice
          </Button>
        </div>

        {/* Purchase Invoice Demo */}
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🛒</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Purchase Invoice</h3>
            <p className="text-gray-600 text-sm mb-4">
              Generate invoices for purchases from vendors
            </p>
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="text-sm">
              <span className="text-gray-600">Vendor:</span>
              <span className="ml-2 font-medium">{mockPurchaseData.vendorName}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Product:</span>
              <span className="ml-2 font-medium text-green-600">{mockPurchaseData.productName}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="ml-2 font-medium text-green-600">₹{mockPurchaseData.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <Button
            onClick={() => setShowPurchaseInvoice(true)}
            variant="primary"
            className="w-full"
          >
            Generate Purchase Invoice
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">✓</span>
            </div>
            <span className="text-gray-700">Universal Template</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">✓</span>
            </div>
            <span className="text-gray-700">Live Preview</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">✓</span>
            </div>
            <span className="text-gray-700">Auto Calculations</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">✓</span>
            </div>
            <span className="text-gray-700">Tax Management</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">✓</span>
            </div>
            <span className="text-gray-700">Professional Layout</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">✓</span>
            </div>
            <span className="text-gray-700">Responsive Design</span>
          </div>
        </div>
      </div>

      {/* Sales Invoice Modal */}
      <InvoiceTemplate
        record={mockSaleData}
        show={showSaleInvoice}
        onClose={() => setShowSaleInvoice(false)}
        onGenerate={handleGenerateInvoice}
        type="sale"
        title="Generate Sales Invoice"
      />

      {/* Byproduct Invoice Modal */}
      <InvoiceTemplate
        record={mockByproductData}
        show={showByproductInvoice}
        onClose={() => setShowByproductInvoice(false)}
        onGenerate={handleGenerateInvoice}
        type="byproduct"
        title="Generate Byproduct Invoice"
      />

      {/* Purchase Invoice Modal */}
      <InvoiceTemplate
        record={mockPurchaseData}
        show={showPurchaseInvoice}
        onClose={() => setShowPurchaseInvoice(false)}
        onGenerate={handleGenerateInvoice}
        type="purchase"
        title="Generate Purchase Invoice"
      />
    </div>
  );
};

export default InvoiceTemplateDemo;
