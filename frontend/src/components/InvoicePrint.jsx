import React from 'react';
import { salesInvoiceService } from '../services/salesInvoiceService';

const InvoicePrint = ({ invoice, onClose, isPreview = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await salesInvoiceService.printSalesInvoice(invoice._id, 'pdf');
      if (response.success) {
        // Create a blob and download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {isPreview ? 'Invoice Preview' : 'Invoice Print'}
            </h2>
            <div className="flex space-x-3">
              {!isPreview && (
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📄 Download PDF
                </button>
              )}
              {!isPreview && (
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  🖨️ Print
                </button>
              )}
              {isPreview && (
                <button
                  onClick={() => {
                    // This will trigger the save function from the parent component
                    onClose('save');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  💾 Save Invoice
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ✕ {isPreview ? 'Close Preview' : 'Close'}
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-6">
          <div className="bg-white border border-gray-300 rounded-lg p-8 print:p-4">
            {/* Company Header */}
            <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                SREE ESWAR HI-TECH MODERN RICE MILL
              </h1>
              <p className="text-gray-600 text-lg">Professional Rice Processing & Distribution</p>
              <p className="text-gray-600">Chennai, Tamil Nadu, India</p>
              <p className="text-gray-600">Phone: +91 98765 43210 | Email: info@sreeeswar.com</p>
              <p className="text-gray-600">GSTIN: 33AABCS1234A1Z5</p>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Bill To:
                </h3>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">{invoice.customer.name}</p>
                  <p className="text-gray-700">{invoice.customer.address}</p>
                  <p className="text-gray-700">Contact: {invoice.customer.contactPerson}</p>
                  <p className="text-gray-700">Phone: {invoice.customer.phoneNo}</p>
                  <p className="text-gray-700">GSTIN/PAN: {invoice.customer.gstinPan}</p>
                  <p className="text-gray-700">Place of Supply: {invoice.customer.placeOfSupply}</p>
                </div>
              </div>

              {/* Invoice Information */}
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                  Invoice Details:
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-700">
                    <span className="font-semibold">Invoice No:</span> {invoice.formattedInvoiceNumber}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Date:</span> {formatDate(invoice.invoiceDate)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Due Date:</span> {formatDate(invoice.dueDate)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Payment Terms:</span> {invoice.payment.paymentType}
                  </p>
                  {invoice.challanNo && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Challan No:</span> {invoice.challanNo}
                    </p>
                  )}
                  {invoice.poNo && (
                    <p className="text-gray-700">
                      <span className="font-semibold">P.O. No:</span> {invoice.poNo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">Sr.</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">Product Description</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-semibold text-gray-900">HSN/SAC</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-900">UOM</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">Rate</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">Discount</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">IGST</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">CESS</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-sm font-semibold text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{index + 1}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          {item.itemNote && (
                            <p className="text-xs text-gray-600">{item.itemNote}</p>
                          )}
                        </div>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-sm">{item.hsnSacCode}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-center">{item.quantity}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-center">{item.uom}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{formatCurrency(item.price)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{formatCurrency(item.discount)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{formatCurrency(item.igstValue)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right">{formatCurrency(item.cess)}</td>
                      <td className="border border-gray-300 px-3 py-2 text-sm text-right font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              {/* Terms & Conditions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions:</h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>{invoice.terms.detail}</p>
                  {invoice.additionalNotes.map((note, index) => (
                    <div key={index}>
                      <p className="font-semibold">{note.title}:</p>
                      <p>{note.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount Summary */}
              <div className="text-right">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Sub Total:</span>
                    <span className="font-semibold">{formatCurrency(invoice.totals.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Discount:</span>
                    <span className="font-semibold">-{formatCurrency(invoice.totals.totalDiscount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Taxable Amount:</span>
                    <span className="font-semibold">{formatCurrency(invoice.totals.totalTaxable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">IGST:</span>
                    <span className="font-semibold">{formatCurrency(invoice.totals.totalIgst)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">CESS:</span>
                    <span className="font-semibold">{formatCurrency(invoice.totals.totalCess)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.totals.grandTotal)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{invoice.totals.amountInWords}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="border-t border-gray-300 pt-4 mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Bank Details:</h4>
              <div className="grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p><span className="font-semibold">Bank Name:</span> {invoice.bank}</p>
                  <p><span className="font-semibold">Account No:</span> 1234567890</p>
                  <p><span className="font-semibold">IFSC Code:</span> SBIN0001234</p>
                </div>
                <div>
                  <p><span className="font-semibold">Branch:</span> Chennai Main Branch</p>
                  <p><span className="font-semibold">Account Type:</span> Current Account</p>
                  <p><span className="font-semibold">UPI ID:</span> sreeeswar@upi</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-300 pt-4">
              <div className="grid grid-cols-3 gap-8 text-center text-sm">
                <div>
                  <p className="font-semibold text-gray-900">Authorized Signatory</p>
                  <div className="mt-8 border-t border-gray-300 pt-2">
                    <p>_________________</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Customer Signature</p>
                  <div className="mt-8 border-t border-gray-300 pt-2">
                    <p>_________________</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Company Stamp</p>
                  <div className="mt-8 border-t border-gray-300 pt-2">
                    <p>_________________</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Print Notice */}
            <div className="mt-6 text-center text-xs text-gray-500 print:hidden">
              <p>This is a computer generated invoice. No signature required.</p>
              <p>Generated on: {new Date().toLocaleString('en-IN')}</p>
            </div>

            {/* Preview Notice */}
            {isPreview && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-center">
                  <p className="text-yellow-800 font-medium">📋 PREVIEW MODE</p>
                  <p className="text-yellow-700 text-sm mt-1">
                    This is a preview of your invoice. Click "Save" or "Save & Print" to create the actual invoice.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePrint; 