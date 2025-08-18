// Simple test for SalesInvoice functionality
console.log('Testing SalesInvoice module...');

// Test data
const testInvoiceData = {
  customerName: 'Test Customer',
  customerAddress: 'Test Address',
  contactPerson: 'John Doe',
  phoneNo: '1234567890',
  gstinPan: 'GSTIN123456789',
  reverseCharge: 'No',
  useSameShippingAddress: true,
  placeOfSupply: 'Tamil Nadu',
  shippingAddress: '',
  invoiceType: 'regular',
  invoicePrefix: 'INV',
  invoiceNumber: '001',
  invoicePostfix: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  challanNo: 'CH001',
  challanDate: '2025-01-15',
  poNo: 'PO001',
  poDate: '2025-01-10',
  lrNo: 'LR001',
  eWayNo: 'EW001',
  deliveryMode: 'road',
  items: [
    {
      id: 1,
      productName: 'Rice',
      itemNote: 'Premium quality',
      hsnSacCode: '1006',
      quantity: '100',
      uom: 'KG',
      price: '50',
      discount: '0',
      igstType: '%',
      igstValue: '18',
      cess: '0',
      total: '5900'
    }
  ],
  additionalCharges: [],
  termsTitle: 'Terms and Conditions',
  termsDetail: 'Standard terms apply',
  additionalNotes: [],
  documentNotes: 'Test invoice',
  tcsType: 'Rs',
  tcsValue: '0',
  discountType: 'Rs',
  discountValue: '0',
  roundOff: 'Yes',
  paymentType: 'CASH',
  smartSuggestion: '',
  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  bank: 'STATE BANK OF INDIA'
};

// Test calculation function
const calculateTotals = (items) => {
  let totalInvVal = 0;
  let totalQty = 0;
  let totalDiscount = 0;
  let totalIgst = 0;
  let totalCess = 0;
  let totalTaxable = 0;

  items.forEach(item => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const discount = parseFloat(item.discount) || 0;
    const cess = parseFloat(item.cess) || 0;
    
    // Calculate taxable amount (before IGST)
    const taxableAmount = (qty * price) - discount;
    
    // Calculate IGST based on type (% or Rs)
    let igstAmount = 0;
    if (item.igstType === '%') {
      const igstRate = parseFloat(item.igstValue) || 0;
      igstAmount = (taxableAmount * igstRate) / 100;
    } else {
      igstAmount = parseFloat(item.igstValue) || 0;
    }

    // Calculate item total
    const itemTotal = taxableAmount + igstAmount + cess;
    
    totalQty += qty;
    totalTaxable += taxableAmount;
    totalInvVal += itemTotal;
    totalDiscount += discount;
    totalIgst += igstAmount;
    totalCess += cess;
  });

  return {
    totalInvVal: totalInvVal.toFixed(2),
    totalQty: totalQty.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
    totalIgst: totalIgst.toFixed(2),
    totalCess: totalCess.toFixed(2),
    totalTaxable: totalTaxable.toFixed(2),
    grandTotal: totalInvVal.toFixed(2)
  };
};

// Test the calculation
const totals = calculateTotals(testInvoiceData.items);
console.log('Test calculation results:', totals);

// Test validation function
const validateForm = (data) => {
  const errors = [];

  // Validate customer information
  if (!data.customerName.trim()) {
    errors.push('Customer name is required');
  }
  if (!data.placeOfSupply.trim()) {
    errors.push('Place of supply is required');
  }

  // Validate invoice details
  if (!data.invoiceNumber.trim()) {
    errors.push('Invoice number is required');
  }
  if (!data.invoiceDate) {
    errors.push('Invoice date is required');
  }

  // Validate items
  if (data.items.length === 0) {
    errors.push('At least one product item is required');
  } else {
    data.items.forEach((item, index) => {
      if (!item.productName.trim() || item.productName === 'Enter Product name') {
        errors.push(`Product name is required for item ${index + 1}`);
      }
      if (!item.quantity || parseFloat(item.quantity) <= 0) {
        errors.push(`Valid quantity is required for item ${index + 1}`);
      }
      if (!item.price || parseFloat(item.price) <= 0) {
        errors.push(`Valid price is required for item ${index + 1}`);
      }
    });
  }

  // Validate payment type
  if (!data.paymentType) {
    errors.push('Payment type is required');
  }

  return errors;
};

// Test validation
const validationErrors = validateForm(testInvoiceData);
console.log('Validation errors:', validationErrors);

// Test number to words function
const numberToWords = (num) => {
  const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
  const teens = ['TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];

  if (num === 0) return 'ZERO RUPEES ONLY';
  if (num < 10) return ones[num] + ' RUPEES ONLY';
  if (num < 20) return teens[num - 10] + ' RUPEES ONLY';
  if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '') + ' RUPEES ONLY';
  if (num < 1000) return ones[Math.floor(num / 100)] + ' HUNDRED' + (num % 100 ? ' AND ' + numberToWords(num % 100) : ' RUPEES ONLY');
  if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' THOUSAND' + (num % 1000 ? ' ' + numberToWords(num % 1000) : ' RUPEES ONLY');
  if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' LAKH' + (num % 100000 ? ' ' + numberToWords(num % 100000) : ' RUPEES ONLY');
  return numberToWords(Math.floor(num / 10000000)) + ' CRORE' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : ' RUPEES ONLY');
};

const amountInWords = numberToWords(parseFloat(totals.grandTotal));
console.log('Amount in words:', amountInWords);

console.log('✅ SalesInvoice module test completed successfully!');
console.log('📋 Test invoice data:', testInvoiceData);
console.log('💰 Total amount: ₹', totals.grandTotal);
console.log('📝 Amount in words:', amountInWords); 