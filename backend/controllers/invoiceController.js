const { asyncHandler } = require('../utils/asyncHandler');
const path = require('path');
const fs = require('fs').promises;

// Helper function to convert number to words
const numberToWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (num === 0) return 'Zero';
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
  if (num < 1000) return ones[Math.floor(num / 10)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
  return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
};

// Helper function to format date
const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day}-${months[d.getMonth()]}-${year}`;
};

// Generate invoice data from sale data
const generateInvoiceData = (sale, invoiceDetails) => {
  const taxableValue = sale.totalAmount;
  const cgstAmount = (taxableValue * (invoiceDetails.cgstRate || 0)) / 100;
  const sgstAmount = (taxableValue * (invoiceDetails.sgstRate || 0)) / 100;
  const totalTax = cgstAmount + sgstAmount;
  const discount = parseFloat(invoiceDetails.discount) || 0;
  const grandTotal = taxableValue + totalTax - discount;

  return {
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
      number: invoiceDetails.invoiceNumber || "1",
      date: formatDate(invoiceDetails.invoiceDate || new Date()),
      reverseCharge: invoiceDetails.reverseCharge || "No"
    },
    vendor: {
      name: sale.customerName || "",
      addressHTML: (sale.customerAddress || "").replace(/\n/g, '<br>'),
      phone: sale.customerPhone || "",
      gstin: sale.customerGstin || "-",
      pan: sale.customerPan || "-",
      placeOfSupply: invoiceDetails.placeOfSupply || "Tamil Nadu (33)"
    },
    items: [
      {
        name: sale.riceVariety || "PADDY",
        hsn: invoiceDetails.hsnCode || "10064000",
        qty: sale.quantity || 0,
        rate: sale.unitPrice || 0,
        cgstPct: invoiceDetails.cgstRate || 0,
        sgstPct: invoiceDetails.sgstRate || 0
      }
    ],
    discount: discount,
    amountWords: numberToWords(Math.round(grandTotal)) + " RUPEES ONLY"
  };
};

// @desc    Preview invoice
// @route   POST /api/invoices/preview
// @access  Private
const previewInvoice = asyncHandler(async (req, res) => {
  try {
    const { sale, invoiceDetails } = req.body;

    if (!sale) {
      return res.status(400).json({
        success: false,
        message: 'Sale data is required'
      });
    }

    // Generate invoice data
    const invoiceData = generateInvoiceData(sale, invoiceDetails);

    // Read the HTML template
    const templatePath = path.join(__dirname, '../utils/pdf.html');
    let htmlTemplate = await fs.readFile(templatePath, 'utf8');

    // Replace the example data with actual data
    const scriptData = `
      <script>
        // Set invoice data
        const invoiceData = ${JSON.stringify(invoiceData, null, 2)};
        setInvoiceData(invoiceData);
      </script>
    `;

    // Remove the example data script and add our data
    htmlTemplate = htmlTemplate.replace(
      /\/\/ —— Example initial data.*?setInvoiceData\(.*?\);\s*<\/script>/s,
      scriptData
    );

    res.json({
      success: true,
      data: {
        invoiceData,
        html: htmlTemplate
      },
      message: 'Invoice preview generated successfully'
    });

  } catch (error) {
    console.error('Error generating invoice preview:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice preview',
      error: error.message
    });
  }
});

// @desc    Generate invoice
// @route   POST /api/invoices/generate
// @access  Private
const generateInvoice = asyncHandler(async (req, res) => {
  try {
    const { sale, invoiceDetails } = req.body;

    if (!sale) {
      return res.status(400).json({
        success: false,
        message: 'Sale data is required'
      });
    }

    // Generate invoice data
    const invoiceData = generateInvoiceData(sale, invoiceDetails);

    res.json({
      success: true,
      data: {
        invoiceData
      },
      message: 'Invoice generated successfully'
    });

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message
    });
  }
});

// @desc    Download invoice as PDF (simplified version)
// @route   POST /api/invoices/download
// @access  Private
const downloadInvoice = asyncHandler(async (req, res) => {
  try {
    const { sale, invoiceDetails } = req.body;

    if (!sale) {
      return res.status(400).json({
        success: false,
        message: 'Sale data is required'
      });
    }

    // For now, return the HTML template that can be printed
    const invoiceData = generateInvoiceData(sale, invoiceDetails);
    const templatePath = path.join(__dirname, '../utils/pdf.html');
    let htmlTemplate = await fs.readFile(templatePath, 'utf8');

    // Replace the example data with actual data
    const scriptData = `
      <script>
        // Set invoice data
        const invoiceData = ${JSON.stringify(invoiceData, null, 2)};
        setInvoiceData(invoiceData);
      </script>
    `;

    // Remove the example data script and add our data
    htmlTemplate = htmlTemplate.replace(
      /\/\/ —— Example initial data.*?setInvoiceData\(.*?\);\s*<\/script>/s,
      scriptData
    );

    // Return HTML that can be printed to PDF
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlTemplate);

  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating invoice',
      error: error.message
    });
  }
});

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoice = asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get invoice by ID not implemented yet'
  });
});

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getAllInvoices = asyncHandler(async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Get all invoices not implemented yet'
  });
});

module.exports = {
  generateInvoice,
  previewInvoice,
  downloadInvoice,
  getInvoice,
  getAllInvoices
};
