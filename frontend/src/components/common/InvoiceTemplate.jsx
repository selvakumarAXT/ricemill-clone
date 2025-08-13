import React, { useState, useEffect } from 'react';
import DialogBox from './DialogBox';
import Button from './Button';
import FormInput from './FormInput';
import FormSelect from './FormSelect';

const InvoiceTemplate = ({ 
  record, 
  show, 
  onClose, 
  onGenerate, 
  type = 'sale', // 'sale', 'byproduct', 'purchase'
  title = 'Generate Invoice'
}) => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reverseCharge: 'No',
    originalFor: 'RECIPIENT',
    customerGstin: '',
    customerPan: '',
    customerEmail: '',
    placeOfSupply: 'Tamil Nadu (33)',
    hsnCode: '10064000',
    quantity: 0,
    rate: 0,
    taxableValue: 0,
    cgstRate: 0,
    cgstAmount: 0,
    sgstRate: 0,
    sgstAmount: 0,
    totalTax: 0,
    discount: 0,
    grandTotal: 0,
    amountInWords: '',
    termsConditions: '',
    paymentTerms: '',
    bankDetails: '',
    certification: 'Certified that the particulars given above are true and correct.',
    authorisedSignatory: 'Authorised Signatory'
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (record) {
      let taxableValue, quantity, rate;
      
      if (type === 'byproduct') {
        taxableValue = record.totalAmount;
        quantity = record.weight;
        rate = record.rate;
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: generateInvoiceNumber(type),
          customerGstin: record.vendorGstin || '',
          customerPan: record.vendorPan || '',
          customerEmail: record.vendorEmail || '',
          placeOfSupply: 'Tamil Nadu (33)',
          quantity: quantity,
          rate: rate,
          taxableValue: taxableValue,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          totalTax: 0,
          grandTotal: taxableValue,
          amountInWords: numberToWords(Math.round(taxableValue))
        }));
      } else if (type === 'sale') {
        taxableValue = record.totalAmount;
        quantity = record.quantity;
        rate = record.unitPrice;
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: generateInvoiceNumber(type),
          customerGstin: record.customerGstin || '',
          customerPan: record.customerPan || '',
          customerEmail: record.customerEmail || '',
          placeOfSupply: record.placeOfSupply || 'Tamil Nadu (33)',
          quantity: quantity,
          rate: rate,
          taxableValue: taxableValue,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          totalTax: 0,
          grandTotal: taxableValue,
          amountInWords: numberToWords(Math.round(taxableValue))
        }));
      } else if (type === 'purchase') {
        taxableValue = record.totalAmount || 0;
        quantity = record.quantity || 0;
        rate = record.unitPrice || 0;
        setInvoiceData(prev => ({
          ...prev,
          invoiceNumber: generateInvoiceNumber(type),
          customerGstin: record.vendorGstin || '',
          customerPan: record.vendorPan || '',
          customerEmail: record.vendorEmail || '',
          placeOfSupply: 'Tamil Nadu (33)',
          quantity: quantity,
          rate: rate,
          taxableValue: taxableValue,
          cgstRate: 0,
          cgstAmount: 0,
          sgstRate: 0,
          sgstAmount: 0,
          totalTax: 0,
          grandTotal: taxableValue,
          amountInWords: numberToWords(Math.round(taxableValue))
        }));
      }
    }
  }, [record, type]);

  const generateInvoiceNumber = (invoiceType) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    switch (invoiceType) {
      case 'byproduct':
        return `INV-BP-${year}${month}${day}-${random}`;
      case 'purchase':
        return `INV-PUR-${year}${month}${day}-${random}`;
      default:
        return `INV-${year}${month}${day}-${random}`;
    }
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Recalculate totals when relevant fields change
      if (['quantity', 'rate', 'discount', 'cgstRate', 'sgstRate'].includes(name)) {
        const quantity = parseFloat(updated.quantity) || 0;
        const rate = parseFloat(updated.rate) || 0;
        const discount = parseFloat(updated.discount) || 0;
        const cgstRate = parseFloat(updated.cgstRate) || 0;
        const sgstRate = parseFloat(updated.sgstRate) || 0;
        
        const taxableValue = quantity * rate;
        const cgstAmount = (taxableValue * cgstRate) / 100;
        const sgstAmount = (taxableValue * sgstRate) / 100;
        const totalTax = cgstAmount + sgstAmount;
        const grandTotal = taxableValue + totalTax - discount;
        
        return {
          ...updated,
          taxableValue: taxableValue,
          cgstAmount: cgstAmount,
          sgstAmount: sgstAmount,
          totalTax: totalTax,
          grandTotal: grandTotal,
          amountInWords: numberToWords(Math.round(grandTotal)) + ' RUPEES ONLY'
        };
      }
      
      return updated;
    });
  };

  const handleGenerateInvoice = () => {
    if (onGenerate) {
      onGenerate({
        ...invoiceData,
        record: record,
        type: type
      });
    }
    onClose();
  };

  const getInvoiceTitle = () => {
    switch (type) {
      case 'byproduct':
        return 'BYPRODUCT INVOICE';
      case 'purchase':
        return 'PURCHASE INVOICE';
      default:
        return 'SALES INVOICE';
    }
  };

  const getCustomerInfo = () => {
    if (type === 'byproduct') {
      return {
        name: record.vendorName,
        address: record.vendorAddress,
        phone: record.vendorPhone,
        email: record.vendorEmail,
        gstin: record.vendorGstin,
        pan: record.vendorPan
      };
    } else if (type === 'sale') {
      return {
        name: record.customerName,
        address: record.customerAddress,
        phone: record.customerPhone,
        email: record.customerEmail,
        gstin: record.customerGstin,
        pan: record.customerPan
      };
    } else {
      return {
        name: record.vendorName || record.customerName,
        address: record.vendorAddress || record.customerAddress,
        phone: record.vendorPhone || record.customerPhone,
        email: record.vendorEmail || record.customerEmail,
        gstin: record.vendorGstin || record.customerGstin,
        pan: record.vendorPan || record.customerPan
      };
    }
  };

  const getProductInfo = () => {
    if (type === 'byproduct') {
      return {
        name: record.material,
        quantity: record.weight,
        unit: record.unit,
        rate: record.rate,
        total: record.totalAmount
      };
    } else if (type === 'sale') {
      return {
        name: record.riceVariety,
        quantity: record.quantity,
        unit: 'kg',
        rate: record.unitPrice,
        total: record.totalAmount
      };
    } else {
      return {
        name: record.productName || record.riceVariety || 'Product',
        quantity: record.quantity || 0,
        unit: record.unit || 'kg',
        rate: record.unitPrice || record.rate || 0,
        total: record.totalAmount || 0
      };
    }
  };

  const renderInvoicePreview = () => {
    const customerInfo = getCustomerInfo();
    const productInfo = getProductInfo();

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-4xl mx-auto">
        <div className="border-2 border-gray-800 p-6 min-h-[800px] font-sans">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">SREE ESWAR HI-TECH MODERN RICE MILL</h1>
            <p className="text-sm text-gray-600 mb-1">99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR, THIRUVALLUR, Tamil Nadu (33) - 602021</p>
            <p className="text-sm text-gray-600">GSTIN: 33AVLPV6754C3Z8</p>
          </div>
          
          {/* Invoice Type and Details */}
          <div className="flex justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{getInvoiceTitle()}</h2>
            </div>
            <div className="flex-1 text-right">
              <p className="text-sm mb-1"><strong>Invoice No.:</strong> {invoiceData.invoiceNumber}</p>
              <p className="text-sm mb-1"><strong>Invoice Date:</strong> {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
              <p className="text-sm mb-1"><strong>Reverse Charge:</strong> {invoiceData.reverseCharge}</p>
              <p className="text-sm mb-1"><strong>Original For:</strong> {invoiceData.originalFor}</p>
            </div>
          </div>
          
          {/* Customer/Vendor Details */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-800 mb-2 border-b border-gray-400 pb-1">
              {type === 'byproduct' ? 'Vendor Detail:' : 'Customer Detail:'}
            </h3>
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="text-sm mb-1"><strong>M/S:</strong> {customerInfo.name}</p>
                <p className="text-sm mb-1 text-gray-600">{customerInfo.address}</p>
                <p className="text-sm mb-1"><strong>Phone:</strong> {customerInfo.phone}</p>
                {customerInfo.email && <p className="text-sm mb-1"><strong>Email:</strong> {customerInfo.email}</p>}
                {customerInfo.gstin && <p className="text-sm mb-1"><strong>GSTIN:</strong> {customerInfo.gstin}</p>}
                {customerInfo.pan && <p className="text-sm mb-1"><strong>PAN:</strong> {customerInfo.pan}</p>}
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm mb-1"><strong>Place of Supply:</strong> {invoiceData.placeOfSupply}</p>
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <table className="w-full border-collapse border border-gray-800 mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-800 p-2 text-center text-xs font-bold">Sr. No.</th>
                <th className="border border-gray-800 p-2 text-left text-xs font-bold">Name of Product/Service</th>
                <th className="border border-gray-800 p-2 text-center text-xs font-bold">HSN/SAC</th>
                <th className="border border-gray-800 p-2 text-center text-xs font-bold">Qty</th>
                <th className="border border-gray-800 p-2 text-right text-xs font-bold">Rate</th>
                <th className="border border-gray-800 p-2 text-right text-xs font-bold">Taxable Value</th>
                <th className="border border-gray-800 p-2 text-center text-xs font-bold">CGST</th>
                <th className="border border-gray-800 p-2 text-center text-xs font-bold">SGST</th>
                <th className="border border-gray-800 p-2 text-right text-xs font-bold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-800 p-2 text-center text-xs">1</td>
                <td className="border border-gray-800 p-2 text-xs">{productInfo.name.toUpperCase()}</td>
                <td className="border border-gray-800 p-2 text-center text-xs">{invoiceData.hsnCode}</td>
                <td className="border border-gray-800 p-2 text-center text-xs">{productInfo.quantity} {productInfo.unit}</td>
                <td className="border border-gray-800 p-2 text-right text-xs">₹{productInfo.rate.toLocaleString()}</td>
                <td className="border border-gray-800 p-2 text-right text-xs">₹{productInfo.total.toLocaleString()}</td>
                <td className="border border-gray-800 p-2 text-center text-xs">{invoiceData.cgstRate}%</td>
                <td className="border border-gray-800 p-2 text-center text-xs">{invoiceData.sgstRate}%</td>
                <td className="border border-gray-800 p-2 text-right text-xs">₹{productInfo.total.toLocaleString()}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td className="border border-gray-800 p-2 text-center text-xs font-bold" colSpan="3">Total</td>
                <td className="border border-gray-800 p-2 text-center text-xs font-bold">{productInfo.quantity} {productInfo.unit}</td>
                <td className="border border-gray-800 p-2 text-center text-xs font-bold"></td>
                <td className="border border-gray-800 p-2 text-right text-xs font-bold">₹{productInfo.total.toLocaleString()}</td>
                <td className="border border-gray-800 p-2 text-center text-xs font-bold">{invoiceData.cgstAmount.toFixed(2)}</td>
                <td className="border border-gray-800 p-2 text-center text-xs font-bold">{invoiceData.sgstAmount.toFixed(2)}</td>
                <td className="border border-gray-800 p-2 text-right text-xs font-bold">₹{productInfo.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
          
          {/* Financial Summary */}
          <div className="flex justify-between mb-6">
            <div className="flex-1">
              <p className="text-sm mb-1"><strong>Total in words:</strong> {invoiceData.amountInWords}</p>
            </div>
            <div className="flex-1 text-right">
              <table className="w-full">
                <tr>
                  <td className="py-1 text-right text-sm border-b border-gray-400"><strong>Taxable Amount:</strong></td>
                  <td className="py-1 text-right text-sm border-b border-gray-400">₹{invoiceData.taxableValue.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-1 text-right text-sm border-b border-gray-400"><strong>Add: CGST:</strong></td>
                  <td className="py-1 text-right text-sm border-b border-gray-400">₹{invoiceData.cgstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-right text-sm border-b border-gray-400"><strong>Add: SGST:</strong></td>
                  <td className="py-1 text-right text-sm border-b border-gray-400">₹{invoiceData.sgstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-right text-sm border-b border-gray-400"><strong>Total Tax:</strong></td>
                  <td className="py-1 text-right text-sm border-b border-gray-400">₹{invoiceData.totalTax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="py-1 text-right text-sm border-b border-gray-400"><strong>Discount:</strong></td>
                  <td className="py-1 text-right text-sm border-b border-gray-400">-₹{invoiceData.discount.toFixed(2)}</td>
                </tr>
                <tr className="bg-gray-100">
                  <td className="py-2 text-right text-sm font-bold"><strong>Total Amount After Tax:</strong></td>
                  <td className="py-2 text-right text-sm font-bold">₹{invoiceData.grandTotal.toLocaleString()}</td>
                </tr>
              </table>
              <p className="text-xs text-center mt-2">(E & O.E.)</p>
            </div>
          </div>
          
          {/* Certification */}
          <div className="pt-4 border-t border-gray-400">
            <p className="text-sm mb-1"><strong>Certification:</strong> {invoiceData.certification}</p>
            <div className="flex justify-between mt-4">
              <div className="flex-1">
                <p className="text-sm mb-1"><strong>For:</strong> SREE ESWAR HI-TECH MODERN RICE MILL</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm mb-1"><strong>{invoiceData.authorisedSignatory}</strong></p>
                <div className="w-36 h-12 border border-gray-400 ml-auto mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!record) return null;

  return (
    <>
      <DialogBox
        show={show}
        onClose={onClose}
        title={title}
        size="6xl"
      >
        <div className="space-y-6">
          {/* Record Information Summary */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              {type === 'byproduct' ? 'Byproduct Information' : 
               type === 'purchase' ? 'Purchase Information' : 'Sale Information'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {type === 'byproduct' ? (
                <>
                  <div>
                    <span className="text-gray-600">Vehicle:</span>
                    <span className="ml-2 font-medium">{record.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Material:</span>
                    <span className="ml-2 font-medium text-green-600">{record.material}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vendor:</span>
                    <span className="ml-2 font-medium">{record.vendorName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-medium text-green-600">₹{record.totalAmount.toLocaleString()}</span>
                  </div>
                </>
              ) : type === 'sale' ? (
                <>
                  <div>
                    <span className="text-gray-600">Order #:</span>
                    <span className="ml-2 font-medium">{record.orderNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer:</span>
                    <span className="ml-2 font-medium">{record.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rice Variety:</span>
                    <span className="ml-2 font-medium text-green-600">{record.riceVariety}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-medium text-green-600">₹{record.totalAmount.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-gray-600">Order #:</span>
                    <span className="ml-2 font-medium">{record.orderNumber || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vendor:</span>
                    <span className="ml-2 font-medium">{record.vendorName || record.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Product:</span>
                    <span className="ml-2 font-medium text-green-600">{record.productName || record.riceVariety || 'Product'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="ml-2 font-medium text-green-600">₹{(record.totalAmount || 0).toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Invoice Details Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleGenerateInvoice(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Invoice Number"
                name="invoiceNumber"
                value={invoiceData.invoiceNumber}
                onChange={handleInputChange}
                required
                icon="hash"
              />
              <FormInput
                label="Invoice Date"
                name="invoiceDate"
                type="date"
                value={invoiceData.invoiceDate}
                onChange={handleInputChange}
                required
                icon="calendar"
              />
              <FormInput
                label="Due Date"
                name="dueDate"
                type="date"
                value={invoiceData.dueDate}
                onChange={handleInputChange}
                required
                icon="calendar"
              />
              <FormInput
                label="Reverse Charge"
                name="reverseCharge"
                value={invoiceData.reverseCharge}
                onChange={handleInputChange}
                icon="check-circle"
              />
              <FormInput
                label={type === 'byproduct' ? 'Vendor GSTIN' : 'Customer GSTIN'}
                name="customerGstin"
                value={invoiceData.customerGstin}
                onChange={handleInputChange}
                icon="id-card"
              />
              <FormInput
                label={type === 'byproduct' ? 'Vendor PAN' : 'Customer PAN'}
                name="customerPan"
                value={invoiceData.customerPan}
                onChange={handleInputChange}
                icon="id-card"
              />
              <FormInput
                label={type === 'byproduct' ? 'Vendor Email' : 'Customer Email'}
                name="customerEmail"
                value={invoiceData.customerEmail}
                onChange={handleInputChange}
                icon="envelope"
              />
              <FormInput
                label="Place of Supply"
                name="placeOfSupply"
                value={invoiceData.placeOfSupply}
                onChange={handleInputChange}
                required
                icon="map-pin"
              />
              <FormInput
                label="HSN Code"
                name="hsnCode"
                value={invoiceData.hsnCode}
                onChange={handleInputChange}
                required
                icon="code"
              />
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Product Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={invoiceData.quantity}
                  onChange={handleInputChange}
                  required
                  icon="scale"
                />
                <FormInput
                  label="Rate (₹)"
                  name="rate"
                  type="number"
                  value={invoiceData.rate}
                  onChange={handleInputChange}
                  required
                  icon="currency-rupee"
                />
                <FormInput
                  label="Discount (₹)"
                  name="discount"
                  type="number"
                  value={invoiceData.discount}
                  onChange={handleInputChange}
                  icon="minus-circle"
                />
              </div>
            </div>

            {/* Tax Details */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="text-md font-semibold text-yellow-800 mb-3">Tax Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="CGST Rate (%)"
                  name="cgstRate"
                  type="number"
                  value={invoiceData.cgstRate}
                  onChange={handleInputChange}
                  icon="percent"
                />
                <FormInput
                  label="SGST Rate (%)"
                  name="sgstRate"
                  type="number"
                  value={invoiceData.sgstRate}
                  onChange={handleInputChange}
                  icon="percent"
                />
              </div>
            </div>

            {/* Invoice Totals */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-md font-semibold text-green-800 mb-3">Invoice Totals</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Taxable Amount:</span>
                  <span className="ml-2 font-medium">₹{invoiceData.taxableValue.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Tax:</span>
                  <span className="ml-2 font-medium">₹{invoiceData.totalTax.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Grand Total:</span>
                  <span className="ml-2 font-medium text-green-600">₹{invoiceData.grandTotal.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Amount in Words:</span>
                  <span className="ml-2 font-medium text-xs">{invoiceData.amountInWords}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                onClick={() => setShowPreview(true)}
                variant="info"
              >
                👁️ Preview Invoice
              </Button>
              <Button 
                type="button" 
                onClick={onClose}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Generate Invoice
              </Button>
            </div>
          </form>
        </div>
      </DialogBox>

      {/* Invoice Preview Modal */}
      <DialogBox
        show={showPreview}
        onClose={() => setShowPreview(false)}
        title="Invoice Preview"
        size="6xl"
      >
        <div className="space-y-4">
          {renderInvoicePreview()}
          <div className="flex justify-end space-x-3">
            <Button 
              onClick={() => setShowPreview(false)}
              variant="secondary"
            >
              Close Preview
            </Button>
            <Button 
              onClick={handleGenerateInvoice}
              variant="primary"
            >
              Generate Invoice
            </Button>
          </div>
        </div>
      </DialogBox>
    </>
  );
};

export default InvoiceTemplate;
