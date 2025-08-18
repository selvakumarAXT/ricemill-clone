import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DialogBox from './common/DialogBox';
import Button from './common/Button';

const InvoiceGenerator = ({ sale, show, onClose, onGenerate }) => {
  const { currentBranchId } = useSelector((state) => state.branch);
  const [invoiceData, setInvoiceData] = useState({
    company: {
      name: "SREE ESWAR HI-TECH MODERN RICE MILL",
      addressHTML: "99, REDHILLS MAIN ROAD, KILANUR VILLAGE, THIRUVALLUR<br>THIRUVALLUR, Tamil Nadu (33) - 602021",
      contactName: "VIKRAMSELVAM",
      phone: "8608012345",
      email: "eswarofficial@gmail.com"
    },
    invoice: {
      displayGST: "33AVLPV6754C3Z8",
      title: "PURCHASE INVOICE",
      copyType: "ORIGINAL FOR RECIPIENT",
      number: "",
      date: new Date().toISOString().split('T')[0],
      reverseCharge: "No"
    },
    vendor: {
      name: "",
      addressHTML: "",
      phone: "",
      gstin: "-",
      pan: "",
      placeOfSupply: "Tamil Nadu (33)"
    },
    items: [
      {
        name: "",
        hsn: "10064000",
        qty: 0,
        rate: 0,
        cgstPct: 0,
        sgstPct: 0
      }
    ],
    discount: 0.00,
    amountWords: ""
  });

  useEffect(() => {
    if (sale) {
      const taxableValue = sale.totalAmount || 0;
      const cgstPct = 0; // 0% CGST as per template
      const sgstPct = 0; // 0% SGST as per template
      const cgstAmt = (taxableValue * cgstPct) / 100;
      const sgstAmt = (taxableValue * sgstPct) / 100;
      const totalTax = cgstAmt + sgstAmt;
      const grandTotal = taxableValue + totalTax - (invoiceData.discount || 0);
      
      setInvoiceData(prev => ({
        ...prev,
        invoice: {
          ...prev.invoice,
          number: generateInvoiceNumber(),
          date: new Date().toISOString().split('T')[0]
        },
        vendor: {
          name: sale.customerName || "",
          addressHTML: sale.customerAddress || "",
          phone: sale.customerPhone || "",
          gstin: sale.customerGstin || "-",
          pan: sale.customerPan || "",
          placeOfSupply: sale.placeOfSupply || "Tamil Nadu (33)"
        },
        items: [
          {
            name: sale.riceVariety || "PADDY",
            hsn: "10064000",
            qty: sale.quantity || 0,
            rate: sale.unitPrice || 0,
            cgstPct: cgstPct,
            sgstPct: sgstPct
          }
        ],
        amountWords: numberToWords(Math.round(grandTotal))
      }));
    }
  }, [sale]);

  const generateInvoiceNumber = () => {
    return `${Math.floor(Math.random() * 10) + 1}`;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onGenerate) {
      onGenerate(invoiceData);
    }
    onClose();
  };

  const previewInvoice = async () => {
    try {
      const response = await fetch('/api/invoices/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sale: sale,
          invoiceData: invoiceData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to preview invoice');
      }

      const result = await response.json();
      
      const previewWindow = window.open('', '_blank');
      previewWindow.document.write(result.data.html);
      previewWindow.document.close();

    } catch (error) {
      console.error('Error previewing invoice:', error);
      alert('Error previewing invoice. Please try again.');
    }
  };

  const downloadInvoice = async () => {
    try {
      const response = await fetch('/api/invoices/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sale: sale,
          invoiceData: invoiceData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate invoice');
      }

      const htmlContent = await response.text();
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        printWindow.print();
      };

    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
    }
  };

  if (!sale) return null;

  return (
    <DialogBox
      show={show}
      onClose={onClose}
      title="Generate Purchase Invoice"
      size="6xl"
    >
      <div className="space-y-6">
        {/* Invoice Preview Section - Using Exact HTML Template */}
        <div style={{ border: '1px solid #0070c0', padding: '0px 15px', background: '#fff' }}>
          {/* Company Header */}
          <header style={{ padding: '18px 20px', borderBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: '63%', textAlign: 'left' }}>
              <h1 style={{ margin: 0, fontSize: '26px', letterSpacing: '0.6px', fontWeight: 700, color: '#12202b' }}>
                {invoiceData.company.name}
              </h1>
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', lineHeight: 1.35 }}
                   dangerouslySetInnerHTML={{ __html: invoiceData.company.addressHTML }}>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '13px', color: '#6b7280', lineHeight: 0.5 }}>
              <p style={{ color: '#12202b' }}><b>Name: </b>{invoiceData.company.contactName}</p>
              <p><b>Phone: </b>{invoiceData.company.phone}</p>
              <p><b>Email: </b>{invoiceData.company.email}</p>
            </div>
          </header>

          {/* Top strip */}
          <table style={{ borderCollapse: 'collapse', width: '100%', border: '1px solid #0070c0' }}>
            <tbody>
              <tr style={{ border: '1px', borderBottom: 'solid 0px' }}>
                <td style={{ width: '40%', border: 0 }}>
                  <b>GSTIN :</b> {invoiceData.invoice.displayGST}
                </td>
                <td style={{ textAlign: 'center', width: '30%', border: 0, color: '#0072BC', fontWeight: 'bold', fontSize: '18px' }}>
                  {invoiceData.invoice.title}
                </td>
                <td style={{ width: '30%', border: 0, justifyContent: 'space-between', textAlign: 'right' }}>
                  <b>{invoiceData.invoice.copyType}</b>
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
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceData.invoice.number}</td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>Invoice Date</td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{new Date(invoiceData.invoice.date).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>M/S</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceData.vendor.name}</td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>Reverse Charge</td>
                <td colSpan="3" style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceData.invoice.reverseCharge}</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>Address</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}
                     dangerouslySetInnerHTML={{ __html: invoiceData.vendor.addressHTML }}>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>Phone</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceData.vendor.phone}</td>
                <td colSpan="4"></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>GSTIN</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceData.vendor.gstin}</td>
                <td colSpan="4"></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>PAN</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceData.vendor.pan}</td>
                <td colSpan="4"></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}><b>Place of Supply</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', verticalAlign: 'top' }}>{invoiceData.vendor.placeOfSupply}</td>
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
              {invoiceData.items.map((item, index) => {
                const qty = Number(item.qty) || 0;
                const rate = Number(item.rate) || 0;
                const taxable = qty * rate;
                const cgstAmt = (taxable * (Number(item.cgstPct) || 0)) / 100;
                const sgstAmt = (taxable * (Number(item.sgstPct) || 0)) / 100;
                const lineTotal = taxable + cgstAmt + sgstAmt;
                
                return (
                  <tr key={index}>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{item.name}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{item.hsn}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{qty.toLocaleString('en-IN', { maximumFractionDigits: 3 })}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px', backgroundColor: '#eaf3fa' }}>{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{item.cgstPct}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{cgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{item.sgstPct}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>{sgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px', backgroundColor: '#eaf3fa' }}>{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ border: '0px', backgroundColor: '#eaf3fa' }}>
                <td colSpan="3" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>Total</td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                  {invoiceData.items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 3 })}
                </td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}></td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                  {invoiceData.items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.rate) || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td colSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                  {invoiceData.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    const taxable = qty * rate;
                    return sum + (taxable * (Number(item.cgstPct) || 0)) / 100;
                  }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td colSpan="2" style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                  {invoiceData.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    const taxable = qty * rate;
                    return sum + (taxable * (Number(item.sgstPct) || 0)) / 100;
                  }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style={{ border: '1px solid #0070c0', padding: '5px', textAlign: 'center', fontSize: '13px' }}>
                  {invoiceData.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    const taxable = qty * rate;
                    const cgstAmt = (taxable * (Number(item.cgstPct) || 0)) / 100;
                    const sgstAmt = (taxable * (Number(item.sgstPct) || 0)) / 100;
                    return sum + taxable + cgstAmt + sgstAmt;
                  }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                  {invoiceData.items.reduce((sum, item) => sum + ((Number(item.qty) || 0) * (Number(item.rate) || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0070c0', padding: '8px', justifyContent: 'space-around', fontSize: 'smaller', textAlign: 'center' }} rowSpan="2">
                  <br />{invoiceData.amountWords}
                </td>
                <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Add : CGST</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>
                  {invoiceData.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    const taxable = qty * rate;
                    return sum + (taxable * (Number(item.cgstPct) || 0)) / 100;
                  }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Add : SGST</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>
                  {invoiceData.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    const taxable = qty * rate;
                    return sum + (taxable * (Number(item.sgstPct) || 0)) / 100;
                  }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr style={{ backgroundColor: '#eaf3fa' }}>
                <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'center', borderBottom: 'none' }}><b>Terms & Condition</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Total Tax</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>
                  {(invoiceData.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    const taxable = qty * rate;
                    const cgstAmt = (taxable * (Number(item.cgstPct) || 0)) / 100;
                    const sgstAmt = (taxable * (Number(item.sgstPct) || 0)) / 100;
                    return sum + cgstAmt + sgstAmt;
                  }, 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td rowSpan="6" style={{ border: '1px solid #0070c0', padding: '8px' }}></td>
                <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Discount</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none' }}>-{Number(invoiceData.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr style={{ backgroundColor: '#eaf3fa' }}>
                <td style={{ border: '1px solid #0070c0', padding: '8px', borderRight: 'none' }}><b>Total Amount After Tax</b></td>
                <td style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'right', borderLeft: 'none', fontWeight: 'bold' }}>
                  <b>₹{(invoiceData.items.reduce((sum, item) => {
                    const qty = Number(item.qty) || 0;
                    const rate = Number(item.rate) || 0;
                    const taxable = qty * rate;
                    const cgstAmt = (taxable * (Number(item.cgstPct) || 0)) / 100;
                    const sgstAmt = (taxable * (Number(item.sgstPct) || 0)) / 100;
                    return sum + taxable + cgstAmt + sgstAmt;
                  }, 0) - Number(invoiceData.discount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                </td>
              </tr>
              <tr>
                <td colSpan="2" style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'end' }}><b>(E & O.E.)</b></td>
              </tr>
              <tr style={{ borderRight: '1px solid' }}>
                <td colSpan="2" style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'center', width: '100%' }}>
                  Certified that the particulars given above are true and correct.<br />
                  <b>For {invoiceData.company.name}</b>
                </td>
              </tr>
              <tr><td colSpan="3" style={{ height: '100px', border: '1px solid #0070c0', padding: '8px' }}></td></tr>
              <tr><td colSpan="3" style={{ border: '1px solid #0070c0', padding: '8px', textAlign: 'center' }}><b>Authorised Signatory</b></td></tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3 pt-4">
          <Button 
            type="button" 
            onClick={previewInvoice}
            variant="info"
            className="bg-blue-600 hover:bg-blue-700"
          >
            👁️ Preview Invoice
          </Button>
          <Button 
            type="button" 
            onClick={downloadInvoice}
            variant="success"
            className="bg-green-600 hover:bg-green-700"
          >
            📄 Download & Print
          </Button>
          <Button 
            type="button" 
            onClick={onClose}
            variant="secondary"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit}
            variant="primary"
          >
            Generate Invoice
          </Button>
        </div>
      </div>
    </DialogBox>
  );
};

export default InvoiceGenerator; 