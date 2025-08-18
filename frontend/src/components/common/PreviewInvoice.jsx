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
    return invoiceData.invoiceTitle || invoiceData.title || 'PURCHASE INVOICE';
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
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
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
          {/* Invoice Preview Section - Using Exact HTML Template */}
          <div style={{ border: '1px solid #0070c0', padding: '0px 15px', background: '#fff' }}>
            {/* Company Header */}
            <header style={{ padding: '18px 20px', borderBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ maxWidth: '63%', textAlign: 'left' }}>
                <h1 style={{ margin: 0, fontSize: '26px', letterSpacing: '0.6px', fontWeight: 700, color: '#12202b' }}>
                  {invoiceData.companyName || 'SREE ESWAR HI-TECH MODERN RICE MILL'}
                </h1>
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', lineHeight: 1.35 }}>
                  {invoiceData.companyAddress1 || '99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR'}
                  <br />
                  {invoiceData.companyAddress2 || 'THIRUVALLUR, Tamil Nadu (33) - 602021'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '13px', color: '#6b7280', lineHeight: 0.5 }}>
                <p style={{ color: '#12202b' }}><b>Name: </b>{invoiceData.contactName || 'VIKRAMSELVAM'}</p>
                <p><b>Phone: </b>{invoiceData.contactPhone || '8608012345'}</p>
                <p><b>Email: </b>{invoiceData.contactEmail || 'eswarofficial@gmail.com'}</p>
              </div>
            </header>

            {/* Top strip */}
            <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #0070c0' }}>
              <tbody>
                <tr style={{ border: '1px', borderBottom: 'solid 0px' }}>
                  <td style={{ width: '40%', border: 0 }}>
                    <b>GSTIN :</b> {invoiceData.companyGstin || '33AVLPV6754C3Z8'}
                  </td>
                  <td style={{ textAlign: 'center', width: '30%', border: 0, color: '#0072BC', fontWeight: 'bold', fontSize: '18px' }}>
                    {getInvoiceTitle()}
                  </td>
                  <td style={{ width: '30%', border: 0, justifyContent: 'space-between', textAlign: 'right' }}>
                    <b>ORIGINAL FOR RECIPIENT</b>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Vendor detail table */}
            <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #0070c0' }}>
              <tbody>
                <tr>
                  <th colSpan="2" style={{ textAlign: 'center', border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>Vendor Detail</th>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>Invoice No.</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceDetails.number}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>Invoice Date</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceDetails.date}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>M/S</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{recipientInfo.name}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>Reverse Charge</td>
                  <td colSpan="3" style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceDetails.reverseCharge}</td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>Address</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>
                    {recipientInfo.address}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>Phone</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{recipientInfo.phone}</td>
                  <td colSpan="4"></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>GSTIN</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{recipientInfo.gstin}</td>
                  <td colSpan="4"></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>PAN</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{recipientInfo.pan}</td>
                  <td colSpan="4"></td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>Place of Supply</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceDetails.placeOfSupply}</td>
                  <td colSpan="4"></td>
                </tr>
              </tbody>
            </table>

            <div style={{ borderLeft: '1px solid #0070c0', borderRight: '1px solid #0070c0' }}><br /></div>

            {/* Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#eaf3fa' }}>
                <tr>
                  <th rowSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Sr. No.</th>
                  <th rowSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Name of Product / Service</th>
                  <th rowSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>HSN / SAC</th>
                  <th rowSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Qty</th>
                  <th rowSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Rate</th>
                  <th rowSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Taxable Value</th>
                  <th colSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>CGST</th>
                  <th colSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>SGST</th>
                  <th rowSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Total</th>
                </tr>
                <tr>
                  <th style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>%</th>
                  <th style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Amount</th>
                  <th style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>%</th>
                  <th style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>1</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{productInfo.name}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{productInfo.hsn}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{productInfo.quantity.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{productInfo.rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px', backgroundColor: '#eaf3fa' }}>{productInfo.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{productInfo.cgst}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{(productInfo.taxableValue * productInfo.cgst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{productInfo.sgst}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{(productInfo.taxableValue * productInfo.sgst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px', backgroundColor: '#eaf3fa' }}>{productInfo.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ border: '0px', backgroundColor: '#eaf3fa' }}>
                  <td colSpan="3" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Total</td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                    {productInfo.quantity.toLocaleString('en-IN', { maximumFractionDigits: 3 })}
                  </td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}></td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                    {productInfo.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                    {(productInfo.taxableValue * productInfo.cgst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td colSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                    {(productInfo.taxableValue * productInfo.sgst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                    {productInfo.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Summary table */}
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <tbody>
                <tr style={{ backgroundColor: '#eaf3fa' }}>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'center', width: '50%', borderBottom: 'none' }}><b>Total in words</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Taxable Amount</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>
                    {productInfo.taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', justifyContent: 'space-around', fontSize: 'smaller', textAlign: 'center' }} rowSpan="2">
                    <br />{financialDetails.amountInWords}
                  </td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Add : CGST</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>
                    {(productInfo.taxableValue * productInfo.cgst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Add : SGST</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>
                    {(productInfo.taxableValue * productInfo.sgst / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr style={{ backgroundColor: '#eaf3fa' }}>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'center', borderBottom: 'none' }}><b>Terms & Condition</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Total Tax</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>
                    {(productInfo.taxableValue * (productInfo.cgst + productInfo.sgst) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td rowSpan="6" style={{ border: '1px solid #0070c0', padding: '8px' }}></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Discount</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>-{financialDetails.discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr style={{ backgroundColor: '#eaf3fa' }}>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Total Amount After Tax</b></td>
                  <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none', fontWeight: 'bold' }}>
                    <b>₹{financialDetails.totalAfterTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'end' }}><b>(E & O.E.)</b></td>
                </tr>
                <tr style={{ borderRight: '1px solid' }}>
                  <td colSpan="2" style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'center', width: '100%' }}>
                    Certified that the particulars given above are true and correct.<br />
                    <b>For {invoiceData.companyName || 'SREE ESWAR HI-TECH MODERN RICE MILL'}</b>
                  </td>
                </tr>
                <tr><td colSpan="3" style={{ height: '100px', border: '1px solid #0070c0', padding: '8px' }}></td></tr>
                <tr><td colSpan="3" style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'center' }}><b>Authorised Signatory</b></td></tr>
              </tbody>
            </table>
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