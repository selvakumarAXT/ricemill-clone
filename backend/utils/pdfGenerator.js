const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async generateInvoicePDF(invoice) {
    const browser = await this.initBrowser();
    const page = await browser.newPage();

    // Generate HTML content for the invoice
    const htmlContent = this.generateInvoiceHTML(invoice);

    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await page.close();
    return pdfBuffer;
  }

  generateInvoiceHTML(invoice) {
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

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #1a365d;
            margin-bottom: 10px;
          }
          
          .company-details {
            font-size: 14px;
            color: #666;
            line-height: 1.4;
          }
          
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          
          .customer-info, .invoice-info {
            flex: 1;
          }
          
          .customer-info {
            margin-right: 40px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1a365d;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
            margin-bottom: 15px;
          }
          
          .info-item {
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            color: #4a5568;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
          }
          
          .items-table th {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
            color: #2d3748;
          }
          
          .items-table td {
            border: 1px solid #e2e8f0;
            padding: 10px 8px;
            vertical-align: top;
          }
          
          .items-table .text-right {
            text-align: right;
          }
          
          .items-table .text-center {
            text-align: center;
          }
          
          .product-name {
            font-weight: bold;
            color: #2d3748;
          }
          
          .product-note {
            font-size: 11px;
            color: #718096;
            margin-top: 4px;
          }
          
          .totals-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          
          .terms-section, .amounts-section {
            flex: 1;
          }
          
          .terms-section {
            margin-right: 40px;
          }
          
          .amount-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .amount-row.total {
            border-top: 2px solid #e2e8f0;
            padding-top: 8px;
            font-size: 16px;
            font-weight: bold;
            color: #1a365d;
          }
          
          .amount-in-words {
            font-size: 12px;
            color: #718096;
            margin-top: 4px;
            font-style: italic;
          }
          
          .bank-details {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            margin-bottom: 30px;
          }
          
          .bank-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            font-size: 14px;
          }
          
          .footer {
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            text-align: center;
            font-size: 14px;
          }
          
          .signature-box {
            border-top: 1px solid #e2e8f0;
            padding-top: 40px;
            margin-top: 20px;
          }
          
          .signature-line {
            border-top: 1px solid #333;
            margin-top: 20px;
            padding-top: 10px;
          }
          
          .print-notice {
            text-align: center;
            font-size: 11px;
            color: #a0aec0;
            margin-top: 20px;
            font-style: italic;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="company-name">SREE ESWAR HI-TECH MODERN RICE MILL</div>
            <div class="company-details">
              Professional Rice Processing & Distribution<br>
              Chennai, Tamil Nadu, India<br>
              Phone: +91 98765 43210 | Email: info@sreeeswar.com<br>
              GSTIN: 33AABCS1234A1Z5
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="customer-info">
              <div class="section-title">Bill To:</div>
              <div class="info-item">
                <span class="info-label">${invoice.customer.name}</span>
              </div>
              <div class="info-item">${invoice.customer.address}</div>
              <div class="info-item">Contact: ${invoice.customer.contactPerson}</div>
              <div class="info-item">Phone: ${invoice.customer.phoneNo}</div>
              <div class="info-item">GSTIN/PAN: ${invoice.customer.gstinPan}</div>
              <div class="info-item">Place of Supply: ${invoice.customer.placeOfSupply}</div>
            </div>

            <div class="invoice-info">
              <div class="section-title">Invoice Details:</div>
              <div class="info-item">
                <span class="info-label">Invoice No:</span> ${invoice.formattedInvoiceNumber}
              </div>
              <div class="info-item">
                <span class="info-label">Date:</span> ${formatDate(invoice.invoiceDate)}
              </div>
              <div class="info-item">
                <span class="info-label">Due Date:</span> ${formatDate(invoice.dueDate)}
              </div>
              <div class="info-item">
                <span class="info-label">Payment Terms:</span> ${invoice.payment.paymentType}
              </div>
              ${invoice.challanNo ? `<div class="info-item"><span class="info-label">Challan No:</span> ${invoice.challanNo}</div>` : ''}
              ${invoice.poNo ? `<div class="info-item"><span class="info-label">P.O. No:</span> ${invoice.poNo}</div>` : ''}
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>Sr.</th>
                <th>Product Description</th>
                <th>HSN/SAC</th>
                <th class="text-center">Qty</th>
                <th class="text-center">UOM</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Discount</th>
                <th class="text-right">IGST</th>
                <th class="text-right">CESS</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    <div class="product-name">${item.productName}</div>
                    ${item.itemNote ? `<div class="product-note">${item.itemNote}</div>` : ''}
                  </td>
                  <td>${item.hsnSacCode}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-center">${item.uom}</td>
                  <td class="text-right">${formatCurrency(item.price)}</td>
                  <td class="text-right">${formatCurrency(item.discount)}</td>
                  <td class="text-right">${formatCurrency(item.igstValue)}</td>
                  <td class="text-right">${formatCurrency(item.cess)}</td>
                  <td class="text-right">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totals Section -->
          <div class="totals-section">
            <div class="terms-section">
              <div class="section-title">Terms & Conditions:</div>
              <div style="font-size: 12px; line-height: 1.4;">
                <p>${invoice.terms.detail}</p>
                ${invoice.additionalNotes.map(note => `
                  <div style="margin-top: 8px;">
                    <strong>${note.title}:</strong><br>
                    ${note.detail}
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="amounts-section">
              <div class="amount-row">
                <span>Sub Total:</span>
                <span>${formatCurrency(invoice.totals.totalAmount)}</span>
              </div>
              <div class="amount-row">
                <span>Discount:</span>
                <span>-${formatCurrency(invoice.totals.totalDiscount)}</span>
              </div>
              <div class="amount-row">
                <span>Taxable Amount:</span>
                <span>${formatCurrency(invoice.totals.totalTaxable)}</span>
              </div>
              <div class="amount-row">
                <span>IGST:</span>
                <span>${formatCurrency(invoice.totals.totalIgst)}</span>
              </div>
              <div class="amount-row">
                <span>CESS:</span>
                <span>${formatCurrency(invoice.totals.totalCess)}</span>
              </div>
              <div class="amount-row total">
                <span>Grand Total:</span>
                <span>${formatCurrency(invoice.totals.grandTotal)}</span>
              </div>
              <div class="amount-in-words">
                ${invoice.totals.amountInWords}
              </div>
            </div>
          </div>

          <!-- Bank Details -->
          <div class="bank-details">
            <div class="section-title">Bank Details:</div>
            <div class="bank-grid">
              <div>
                <div class="info-item"><span class="info-label">Bank Name:</span> ${invoice.bank}</div>
                <div class="info-item"><span class="info-label">Account No:</span> 1234567890</div>
                <div class="info-item"><span class="info-label">IFSC Code:</span> SBIN0001234</div>
              </div>
              <div>
                <div class="info-item"><span class="info-label">Branch:</span> Chennai Main Branch</div>
                <div class="info-item"><span class="info-label">Account Type:</span> Current Account</div>
                <div class="info-item"><span class="info-label">UPI ID:</span> sreeeswar@upi</div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div>
              <div style="font-weight: bold; margin-bottom: 10px;">Authorized Signatory</div>
              <div class="signature-line"></div>
            </div>
            <div>
              <div style="font-weight: bold; margin-bottom: 10px;">Customer Signature</div>
              <div class="signature-line"></div>
            </div>
            <div>
              <div style="font-weight: bold; margin-bottom: 10px;">Company Stamp</div>
              <div class="signature-line"></div>
            </div>
          </div>

          <!-- Print Notice -->
          <div class="print-notice">
            This is a computer generated invoice. No signature required.<br>
            Generated on: ${new Date().toLocaleString('en-IN')}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFGenerator(); 