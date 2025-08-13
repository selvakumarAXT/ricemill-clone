import React from 'react';
import Button from './Button';

const PreviewInvoice = ({ 
  invoiceData, 
  show, 
  onClose, 
  onDownload, 
  type = 'sale', // 'sale', 'byproduct', 'rice', 'purchase'
  title = 'Invoice Preview'
}) => {
  if (!show || !invoiceData) return null;

  // Helper function to format date as DD-Mon-YYYY
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

     // Get invoice title based on type or use custom title from data
   const getInvoiceTitle = () => {
     return invoiceData.invoiceTitle || invoiceData.title || 'INVOICE';
   };

     // Get recipient title based on data or use default
   const getRecipientTitle = () => {
     return invoiceData.recipientTitle || 'Recipient Detail:';
   };

     // Get recipient info based on invoice type
   const getRecipientInfo = () => {
     // Use the most appropriate field names based on the data structure
     return {
       name: invoiceData.customerName || invoiceData.vendorName || invoiceData.depositorName || invoiceData.depositGodown || 'Recipient Name',
       address: invoiceData.customerAddress || invoiceData.vendorAddress || invoiceData.depositorAddress || 'Recipient Address',
       phone: invoiceData.customerPhone || invoiceData.vendorPhone || invoiceData.depositorPhone || invoiceData.phone || 'Phone Number',
       email: invoiceData.customerEmail || invoiceData.vendorEmail || invoiceData.depositorEmail || invoiceData.email || '',
       gstin: invoiceData.customerGstin || invoiceData.vendorGstin || invoiceData.depositorGstin || invoiceData.gstin || '-',
       pan: invoiceData.customerPan || invoiceData.vendorPan || invoiceData.depositorPan || invoiceData.pan || ''
     };
   };

     // Get product info based on invoice type
   const getProductInfo = () => {
     // Use the most appropriate field names based on the data structure
     return {
       name: invoiceData.productName || invoiceData.riceVariety || invoiceData.material || invoiceData.variety || 'PRODUCT',
       hsn: invoiceData.hsnCode || invoiceData.hsn || '10064000',
       quantity: invoiceData.quantity || invoiceData.weight || invoiceData.totalRiceDeposit || invoiceData.riceBag || 0,
       unit: invoiceData.unit || 'kg',
       rate: invoiceData.rate || invoiceData.unitPrice || 0,
       taxableValue: invoiceData.taxableValue || invoiceData.totalAmount || 0,
       cgst: invoiceData.cgst || invoiceData.cgstRate || 0,
       sgst: invoiceData.sgst || invoiceData.sgstRate || 0,
       total: invoiceData.totalAmount || 0
     };
   };

     // Get invoice details
   const getInvoiceDetails = () => {
     return {
       number: invoiceData.invoiceNumber || 'INV-001',
       date: formatDate(invoiceData.invoiceDate || invoiceData.date || invoiceData.orderDate),
       reverseCharge: invoiceData.reverseCharge || 'No',
       placeOfSupply: invoiceData.placeOfSupply || 'Place of Supply'
     };
   };

     // Get financial details
   const getFinancialDetails = () => {
     const taxableAmount = invoiceData.taxableValue || 
                          (invoiceData.quantity * (invoiceData.unitPrice || invoiceData.rate)) || 
                          invoiceData.totalAmount || 0;
     const discount = invoiceData.discount || 0;
     const totalAfterTax = taxableAmount - discount;
     
     return {
       taxableAmount,
       discount,
       totalAfterTax,
       amountInWords: invoiceData.amountInWords || (numberToWords(Math.round(totalAfterTax)) + ' RUPEES ONLY')
     };
   };

     // Convert number to words
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

  const recipientInfo = getRecipientInfo();
  const productInfo = getProductInfo();
  const invoiceDetails = getInvoiceDetails();
  const financialDetails = getFinancialDetails();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <Button
            onClick={onClose}
            variant="secondary"
            icon="x"
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </Button>
        </div>

        {/* Invoice Content */}
        <div className="p-4">
          <div className="bg-white border border-gray-300 p-4 rounded-lg" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px' }}>
                         {/* Company Header */}
             <div className="text-center mb-4">
               <h1 className="text-lg font-bold mb-1">{invoiceData.companyName || 'COMPANY NAME'}</h1>
               <p className="mb-1">{invoiceData.companyAddress1 || 'COMPANY ADDRESS LINE 1'}</p>
               <p className="mb-1">{invoiceData.companyAddress2 || 'COMPANY ADDRESS LINE 2'}</p>
             </div>
             
             <div className="border-t border-b border-gray-300 py-1 mb-4">
               <p className="font-bold">GSTIN : {invoiceData.companyGstin || 'COMPANY GSTIN'}</p>
             </div>
            
            {/* Invoice Title */}
            <div className="flex justify-between mb-2">
              <h2 className="font-bold">{getInvoiceTitle()}</h2>
              <p className="font-bold">ORIGINAL FOR RECIPIENT</p>
            </div>
            
            {/* Recipient Details */}
            <table className="w-full mb-4">
              <tbody>
                <tr>
                  <td width="15%"><strong>M/S</strong></td>
                  <td width="35%">{recipientInfo.name}</td>
                  <td width="15%"><strong>Invoice No.</strong></td>
                  <td width="15%">{invoiceDetails.number}</td>
                  <td width="10%"><strong>Invoice Date</strong></td>
                  <td width="10%">{invoiceDetails.date}</td>
                </tr>
                <tr>
                  <td><strong>Address</strong></td>
                  <td colSpan="5">{recipientInfo.address}</td>
                </tr>
                <tr>
                  <td><strong>Phone</strong></td>
                  <td>{recipientInfo.phone}</td>
                  <td><strong>Reverse Charge</strong></td>
                  <td>{invoiceDetails.reverseCharge}</td>
                  <td colSpan="2"></td>
                </tr>
                <tr>
                  <td><strong>GSTIN</strong></td>
                  <td>{recipientInfo.gstin}</td>
                  <td colSpan="4"></td>
                </tr>
                {recipientInfo.pan && (
                  <tr>
                    <td><strong>PAN</strong></td>
                    <td>{recipientInfo.pan}</td>
                    <td colSpan="4"></td>
                  </tr>
                )}
                <tr>
                  <td><strong>Place of Supply</strong></td>
                  <td>{invoiceDetails.placeOfSupply}</td>
                  <td colSpan="4"></td>
                </tr>
              </tbody>
            </table>
            
            {/* Items Table */}
            <table className="w-full border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                                     <th className="border border-gray-300 p-1 text-center">{invoiceData.tableHeaders?.srNo || 'Sr. No.'}</th>
                   <th className="border border-gray-300 p-1 text-left">{invoiceData.tableHeaders?.productName || 'Name of Product / Service'}</th>
                   <th className="border border-gray-300 p-1 text-center">{invoiceData.tableHeaders?.hsn || 'HSN / SAC'}</th>
                   <th className="border border-gray-300 p-1 text-center">{invoiceData.tableHeaders?.quantity || 'Qty'}</th>
                   <th className="border border-gray-300 p-1 text-right">{invoiceData.tableHeaders?.rate || 'Rate'}</th>
                   <th className="border border-gray-300 p-1 text-right">{invoiceData.tableHeaders?.taxableValue || 'Taxable Value'}</th>
                   <th className="border border-gray-300 p-1 text-center">{invoiceData.tableHeaders?.cgst || 'CGST %'}</th>
                   <th className="border border-gray-300 p-1 text-center">{invoiceData.tableHeaders?.cgstAmount || 'Amount'}</th>
                   <th className="border border-gray-300 p-1 text-center">{invoiceData.tableHeaders?.sgst || 'SGST %'}</th>
                   <th className="border border-gray-300 p-1 text-center">{invoiceData.tableHeaders?.sgstAmount || 'Amount'}</th>
                   <th className="border border-gray-300 p-1 text-right">{invoiceData.tableHeaders?.total || 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-1 text-center">1</td>
                  <td className="border border-gray-300 p-1">{productInfo.name}</td>
                  <td className="border border-gray-300 p-1 text-center">{productInfo.hsn}</td>
                  <td className="border border-gray-300 p-1 text-center">
                    {productInfo.quantity.toFixed(2)} {productInfo.unit}
                  </td>
                  <td className="border border-gray-300 p-1 text-right">
                    {productInfo.rate.toLocaleString('en-IN')}.00
                  </td>
                  <td className="border border-gray-300 p-1 text-right">
                    {productInfo.taxableValue.toLocaleString('en-IN')}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {productInfo.cgst}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {(productInfo.taxableValue * productInfo.cgst / 100).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {productInfo.sgst}
                  </td>
                  <td className="border border-gray-300 p-1 text-center">
                    {(productInfo.taxableValue * productInfo.sgst / 100).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-1 text-right">
                    {productInfo.total.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td className="border border-gray-300 p-1 text-center font-bold" colSpan="3">Total</td>
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    {productInfo.quantity.toFixed(2)} {productInfo.unit}
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold"></td>
                  <td className="border border-gray-300 p-1 text-right font-bold">
                    {productInfo.taxableValue.toLocaleString('en-IN')}
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    {productInfo.cgst.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    {(productInfo.taxableValue * productInfo.cgst / 100).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    {productInfo.sgst.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-1 text-center font-bold">
                    {(productInfo.taxableValue * productInfo.sgst / 100).toFixed(2)}
                  </td>
                  <td className="border border-gray-300 p-1 text-right font-bold">
                    {productInfo.total.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tfoot>
            </table>
            
            {/* Financial Summary */}
            <div className="flex justify-between mb-4">
              <div className="w-1/2">
                <p><strong>Total in words</strong></p>
                <p>{financialDetails.amountInWords}</p>
                                 <p className="mt-2"><strong>{invoiceData.termsLabel || 'Terms & Condition'}</strong></p>
              </div>
              <div className="w-1/2">
                <table className="w-full">
                                     <tr>
                     <td className="text-right"><strong>{invoiceData.labels?.taxableAmount || 'Taxable Amount'}</strong></td>
                     <td className="text-right">{financialDetails.taxableAmount.toLocaleString('en-IN')}</td>
                   </tr>
                   <tr>
                     <td className="text-right"><strong>{invoiceData.labels?.cgst || 'Add : CGST'}</strong></td>
                     <td className="text-right">
                       {(financialDetails.taxableAmount * productInfo.cgst / 100).toFixed(2)}
                     </td>
                   </tr>
                   <tr>
                     <td className="text-right"><strong>{invoiceData.labels?.sgst || 'Add : SGST'}</strong></td>
                     <td className="text-right">
                       {(financialDetails.taxableAmount * productInfo.sgst / 100).toFixed(2)}
                     </td>
                   </tr>
                   <tr>
                     <td className="text-right"><strong>{invoiceData.labels?.totalTax || 'Total Tax'}</strong></td>
                     <td className="text-right">
                       {(financialDetails.taxableAmount * (productInfo.cgst + productInfo.sgst) / 100).toFixed(2)}
                     </td>
                   </tr>
                   <tr>
                     <td className="text-right"><strong>{invoiceData.labels?.discount || 'Discount'}</strong></td>
                     <td className="text-right">-{financialDetails.discount.toFixed(2)}</td>
                   </tr>
                   <tr>
                     <td className="text-right"><strong>{invoiceData.labels?.totalAfterTax || 'Total Amount After Tax'}</strong></td>
                     <td className="text-right">
                       ₹{financialDetails.totalAfterTax.toLocaleString('en-IN')}.00
                     </td>
                   </tr>
                </table>
                <p className="text-right mt-1">(E & O.E.)</p>
                                 <p className="text-right">{invoiceData.certificationText || 'Certified that the particulars given above are true and correct.'}</p>
                                 <p className="text-right mt-4">For {invoiceData.companyName || 'COMPANY NAME'}</p>
              </div>
            </div>
            
            {/* Signature */}
                         <div className="text-right mt-8">
               <p className="font-bold">{invoiceData.signatureLabel || 'Authorised Signatory'}</p>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <Button onClick={onClose} variant="secondary">
            Close Preview
          </Button>
          {onDownload && (
            <Button 
              onClick={() => {
                onDownload(invoiceData);
                onClose();
              }}
              variant="success"
              icon="download"
            >
              Download PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewInvoice;