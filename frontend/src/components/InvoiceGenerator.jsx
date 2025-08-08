import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DialogBox from './common/DialogBox';
import Button from './common/Button';
import FormInput from './common/FormInput';
import FormSelect from './common/FormSelect';

const InvoiceGenerator = ({ sale, show, onClose, onGenerate }) => {
  const { currentBranchId } = useSelector((state) => state.branch);
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

  useEffect(() => {
    if (sale) {
      const taxableValue = sale.totalAmount;
      const cgstAmount = (taxableValue * 0) / 100; // 0% CGST as per image
      const sgstAmount = (taxableValue * 0) / 100; // 0% SGST as per image
      const totalTax = cgstAmount + sgstAmount;
      const grandTotal = taxableValue + totalTax - (invoiceData.discount || 0);
      
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber(),
        customerGstin: sale.customerGstin || '',
        customerPan: sale.customerPan || '',
        customerEmail: sale.customerEmail || '',
        placeOfSupply: sale.placeOfSupply || 'Tamil Nadu (33)',
        quantity: sale.quantity,
        rate: sale.unitPrice,
        taxableValue: taxableValue,
        cgstRate: 0,
        cgstAmount: cgstAmount,
        sgstRate: 0,
        sgstAmount: sgstAmount,
        totalTax: totalTax,
        grandTotal: grandTotal,
        amountInWords: numberToWords(Math.round(grandTotal))
      }));
    }
  }, [sale]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${Math.floor(Math.random() * 10) + 1}`; // Simple number as per image
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
      if (['quantity', 'rate', 'discount'].includes(name)) {
        const quantity = parseFloat(updated.quantity) || 0;
        const rate = parseFloat(updated.rate) || 0;
        const discount = parseFloat(updated.discount) || 0;
        
        const taxableValue = quantity * rate;
        const cgstAmount = (taxableValue * updated.cgstRate) / 100;
        const sgstAmount = (taxableValue * updated.sgstRate) / 100;
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
        sale: sale
      });
    }
    onClose();
  };

  const downloadInvoice = async () => {
    try {
      // Dynamically import PDF libraries
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas')
      ]);
      
      // Create a temporary div for the invoice content
      const invoiceDiv = document.createElement('div');
      invoiceDiv.style.width = '800px';
      invoiceDiv.style.padding = '40px';
      invoiceDiv.style.backgroundColor = 'white';
      invoiceDiv.style.fontFamily = 'Arial, sans-serif';
      invoiceDiv.style.position = 'absolute';
      invoiceDiv.style.left = '-9999px';
      invoiceDiv.style.top = '0';
      
      invoiceDiv.innerHTML = `
        <div style="border: 2px solid #333; padding: 20px; min-height: 1000px; font-family: Arial, sans-serif;">
          <!-- Header -->
          <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #333; font-size: 24px; font-weight: bold;">SREE ESWAR HI-TECH MODERN RICE MILL</h1>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR, THIRUVALLUR, Tamil Nadu (33) - 602021</p>
            <p style="margin: 5px 0; color: #666; font-size: 12px;">GSTIN: 33AVLPV6754C3Z8</p>
          </div>
          
          <!-- Invoice Type and Details -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div style="flex: 1;">
              <h2 style="margin: 0; color: #333; font-size: 18px; font-weight: bold;">PURCHASE INVOICE</h2>
            </div>
            <div style="flex: 1; text-align: right;">
              <p style="margin: 2px 0; font-size: 12px;"><strong>Invoice No.:</strong> ${invoiceData.invoiceNumber}</p>
              <p style="margin: 2px 0; font-size: 12px;"><strong>Invoice Date:</strong> ${new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
              <p style="margin: 2px 0; font-size: 12px;"><strong>Reverse Charge:</strong> ${invoiceData.reverseCharge}</p>
              <p style="margin: 2px 0; font-size: 12px;"><strong>Original For:</strong> ${invoiceData.originalFor}</p>
            </div>
          </div>
          
          <!-- Vendor Details -->
          <div style="margin-bottom: 20px;">
            <h3 style="margin: 0 0 10px 0; color: #333; font-size: 14px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Vendor Detail:</h3>
            <div style="display: flex; justify-content: space-between;">
              <div style="flex: 1;">
                <p style="margin: 3px 0; font-size: 12px;"><strong>M/S:</strong> ${sale.customerName}</p>
                <p style="margin: 3px 0; font-size: 12px; color: #666;">${sale.customerAddress}</p>
                <p style="margin: 3px 0; font-size: 12px;"><strong>Phone:</strong> ${sale.customerPhone}</p>
                ${sale.customerEmail ? `<p style="margin: 3px 0; font-size: 12px;"><strong>Email:</strong> ${sale.customerEmail}</p>` : ''}
                ${invoiceData.customerGstin ? `<p style="margin: 3px 0; font-size: 12px;"><strong>GSTIN:</strong> ${invoiceData.customerGstin}</p>` : ''}
                ${invoiceData.customerPan ? `<p style="margin: 3px 0; font-size: 12px;"><strong>PAN:</strong> ${invoiceData.customerPan}</p>` : ''}
              </div>
              <div style="flex: 1; text-align: right;">
                <p style="margin: 3px 0; font-size: 12px;"><strong>Place of Supply:</strong> ${invoiceData.placeOfSupply}</p>
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #333;">
            <thead>
              <tr style="background-color: #f4f4f4;">
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">Sr. No.</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: left; font-size: 10px; font-weight: bold;">Name of Product/Service</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">HSN/SAC</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">Qty</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">Rate</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">Taxable Value</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">CGST</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">SGST</th>
                <th style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">Total</th>
              </tr>
              <tr style="background-color: #f4f4f4;">
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;">%</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;">%</th>
                <th style="border: 1px solid #333; padding: 4px; text-align: center; font-size: 8px; font-weight: bold;"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">1</td>
                <td style="border: 1px solid #333; padding: 8px; font-size: 10px;">${sale.riceVariety.toUpperCase()}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">${invoiceData.hsnCode}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">${invoiceData.quantity.toFixed(2)}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px;">${invoiceData.rate.toLocaleString()}.00</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px;">${invoiceData.taxableValue.toLocaleString()}.00</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">${invoiceData.cgstRate}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px;">${invoiceData.sgstRate}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px;">${invoiceData.taxableValue.toLocaleString()}.00</td>
              </tr>
            </tbody>
            <tfoot>
              <tr style="background-color: #f4f4f4;">
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;" colspan="3">Total</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">${invoiceData.quantity.toFixed(2)}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;"></td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">${invoiceData.taxableValue.toLocaleString()}.00</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">${invoiceData.cgstAmount.toFixed(2)}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: center; font-size: 10px; font-weight: bold;">${invoiceData.sgstAmount.toFixed(2)}</td>
                <td style="border: 1px solid #333; padding: 8px; text-align: right; font-size: 10px; font-weight: bold;">${invoiceData.taxableValue.toLocaleString()}.00</td>
              </tr>
            </tfoot>
          </table>
          
          <!-- Financial Summary -->
          <div style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div style="flex: 1;">
              <p style="margin: 5px 0; font-size: 12px;"><strong>Total in words:</strong> ${invoiceData.amountInWords}</p>
            </div>
            <div style="flex: 1; text-align: right;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Taxable Amount:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">${invoiceData.taxableValue.toLocaleString()}.00</td>
                </tr>
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Add: CGST:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">${invoiceData.cgstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Add: SGST:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">${invoiceData.sgstAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Total Tax:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">${invoiceData.totalTax.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;"><strong>Discount:</strong></td>
                  <td style="padding: 4px; text-align: right; font-size: 12px; border-bottom: 1px solid #ccc;">-${invoiceData.discount.toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f4f4f4;">
                  <td style="padding: 8px; text-align: right; font-size: 14px; font-weight: bold;"><strong>Total Amount After Tax:</strong></td>
                  <td style="padding: 8px; text-align: right; font-size: 14px; font-weight: bold;">₹${invoiceData.grandTotal.toLocaleString()}.00</td>
                </tr>
              </table>
              <p style="margin: 5px 0; font-size: 10px; text-align: center;">(E & O.E.)</p>
            </div>
          </div>
          
          <!-- Certification -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>Certification:</strong> ${invoiceData.certification}</p>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
              <div style="flex: 1;">
                <p style="margin: 5px 0; font-size: 12px;"><strong>For:</strong> SREE ESWAR HI-TECH MODERN RICE MILL</p>
              </div>
              <div style="flex: 1; text-align: right;">
                <p style="margin: 5px 0; font-size: 12px;"><strong>${invoiceData.authorisedSignatory}</strong></p>
                <div style="width: 150px; height: 50px; border: 1px solid #ccc; margin-left: auto; margin-top: 10px;"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add to document temporarily
      document.body.appendChild(invoiceDiv);
      
      // Convert to canvas
      const canvas = await html2canvas(invoiceDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      // Remove temporary div
      document.body.removeChild(invoiceDiv);
      
      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Download PDF
      pdf.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (!sale) return null;

  return (
    <DialogBox
      show={show}
      onClose={onClose}
      title="Generate Purchase Invoice"
      size="4xl"
    >
      <div className="space-y-6">
        {/* Sale Information Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Sale Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Order #:</span>
              <span className="ml-2 font-medium">{sale.orderNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">Customer:</span>
              <span className="ml-2 font-medium">{sale.customerName}</span>
            </div>
            <div>
              <span className="text-gray-600">Rice Variety:</span>
              <span className="ml-2 font-medium text-green-600">{sale.riceVariety}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <span className="ml-2 font-medium text-green-600">₹{sale.totalAmount.toLocaleString()}</span>
            </div>
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
              label="Customer GSTIN"
              name="customerGstin"
              value={invoiceData.customerGstin}
              onChange={handleInputChange}
              icon="id-card"
            />
            <FormInput
              label="Customer Pan"
              name="customerPan"
              value={invoiceData.customerPan}
              onChange={handleInputChange}
              icon="id-card"
            />
            <FormInput
              label="Customer Email"
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
              onClick={downloadInvoice}
              variant="success"
            >
              📄 Download PDF
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
  );
};

export default InvoiceGenerator; 