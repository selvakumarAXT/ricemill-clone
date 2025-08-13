const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Branch = require('./models/Branch');
const Paddy = require('./models/Paddy');
const Production = require('./models/Production');
const Gunny = require('./models/Gunny');
const Inventory = require('./models/Inventory');
const { RiceDeposit } = require('./models/RiceDeposit');
const BagWeightOption = require('./models/BagWeightOption');
const SalesInvoice = require('./models/SalesInvoice');
const FinancialTransaction = require('./models/FinancialTransaction');

// Invoice number generator function
const generateInvoiceNumber = (transactionType, category, date, sequence) => {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const categoryCode = category.replace('_', '').toUpperCase();
  const seq = String(sequence).padStart(3, '0');
  
  if (transactionType === 'expense') {
    return `PUR-${categoryCode}-${year}${month}-${seq}`;
  } else {
    return `INC-${categoryCode}-${year}${month}-${seq}`;
  }
};

// Enhanced description generator
const generateDescription = (transactionType, category, vendor, amount) => {
  if (transactionType === 'expense') {
    const descriptions = {
      'paddy_purchase': `Paddy Purchase Invoice - ${vendor} - ${amount} kg`,
      'labor': `Labor Payment - ${vendor} - ${amount} workers`,
      'electricity': `Electricity Bill - ${vendor} - Meter Reading`,
      'maintenance': `Maintenance Service - ${vendor} - Equipment Repair`,
      'insurance': `Insurance Premium - ${vendor} - Policy Renewal`,
      'transport': `Transportation - ${vendor} - Delivery Charges`,
      'rent': `Rent Payment - ${vendor} - Property Lease`,
      'utilities': `Utility Bill - ${vendor} - Water/Internet`,
      'taxes': `Tax Payment - ${vendor} - GST/Income Tax`,
      'other': `Other Expense - ${vendor} - ${amount}`
    };
    return descriptions[category] || `Expense - ${vendor} - ${amount}`;
  } else {
    return `Income from ${category.replace('_', ' ')} - ${vendor}`;
  }
};

// Database connection
mongoose.connect('mongodb://localhost:27017/ricemill', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Clear existing dashboard-related data (keep users and branches)
    console.log('🧹 Clearing existing dashboard data...');
    await SalesInvoice.deleteMany({});
    await FinancialTransaction.deleteMany({});
    await Production.deleteMany({});
    await Paddy.deleteMany({});
    await Inventory.deleteMany({});
    await RiceDeposit.deleteMany({});
    await Gunny.deleteMany({});
    await BagWeightOption.deleteMany({});
    
    console.log('✅ Dashboard data cleared successfully');
    
    // Get existing users and branches (don't recreate them)
    console.log('🔍 Getting existing users and branches...');
    const superadmin = await User.findOne({ role: 'superadmin' });
    const branches = await Branch.find({});
    const users = await User.find({ role: { $ne: 'superadmin' } });
    
    if (!superadmin) {
      console.log('❌ No superadmin found. Please run seedAllModules.js first.');
      return;
    }
    
    if (branches.length === 0) {
      console.log('❌ No branches found. Please run seedAllModules.js first.');
      return;
    }
    
    console.log(`✅ Found ${branches.length} branches and ${users.length} users`);
    
    // Log branch details for verification
    branches.forEach(branch => {
      console.log(`📍 Branch: ${branch.name} (${branch.millCode}) - ID: ${branch._id}`);
    });
    
    // Get specific branch references for proper data distribution
    const mainBranch = branches.find(b => b.millCode === 'MRM001');
    const northBranch = branches.find(b => b.millCode === 'NRB002');
    const southBranch = branches.find(b => b.millCode === 'SRB003');
    
    if (!mainBranch || !northBranch || !southBranch) {
      console.log('❌ Required branches not found. Please check your branch setup.');
      return;
    }
    
    console.log('✅ All required branches found for data seeding');
    
    // Create Bag Weight Options if they don't exist
    console.log('⚖️ Creating Bag Weight Options...');
    const existingBagWeights = await BagWeightOption.find({});
    if (existingBagWeights.length === 0) {
      const bagWeights = await BagWeightOption.create([
        {
          weight: 25,
          label: '25 kg',
          isActive: true,
          branch_id: mainBranch._id,
          createdBy: superadmin._id
        },
        {
          weight: 50,
          label: '50 kg',
          isActive: true,
          branch_id: mainBranch._id,
          createdBy: superadmin._id
        },
        {
          weight: 100,
          label: '100 kg',
          isActive: true,
          branch_id: mainBranch._id,
          createdBy: superadmin._id
        }
      ]);
      console.log('✅ Bag Weight Options created:', bagWeights.length);
    } else {
      console.log('✅ Bag Weight Options already exist');
    }
    
    // Generate 7 months of data for Jan-Jul 2025
    console.log('📅 Generating 7 months of dashboard data for Jan-Jul 2025...');
    
    const months = [];
    
    // Generate dates for January to July 2025
    for (let i = 0; i < 7; i++) {
      const monthDate = new Date(2025, i, 1); // 0=Jan, 1=Feb, ..., 6=Jul
      months.push(monthDate);
    }

    // Better distribution strategy - ensure each branch gets balanced data
    const branchArray = [mainBranch, northBranch, southBranch];
    let branchIndex = 0;
    
    const getNextBranch = () => {
      const currentBranch = branchArray[branchIndex];
      branchIndex = (branchIndex + 1) % branchArray.length;
      return currentBranch;
    };
    
    // Helper function to generate random dates within a month
    const getRandomDateInMonth = (monthDate) => {
      const startOfMonth = new Date(monthDate);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const randomTime = startOfMonth.getTime() + Math.random() * (endOfMonth.getTime() - startOfMonth.getTime());
      return new Date(randomTime);
    };
    
    // South Indian states for geographical data
    const southIndianStates = [
      'Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala'
    ];
    
    // Rice varieties for production and sales
    const riceVarieties = [
      'Sona Masoori', 'Basmati', 'Ponni', 'IR20', 'IR36', 'ADT43', 'CO51'
    ];
    
    // Customer names for sales invoices
    const customerNames = [
      'ESWAR & CO', 'Priyanka Traders', 'Vikram Selvam', 'Venkatesan Foods',
      'Lakshmi Rice Mills', 'Ramesh Kumar', 'Sundar Trading Co', 'Ganesh Foods',
      'Murugan Enterprises', 'Karthik Traders', 'Arun Rice Mills', 'Bharat Foods',
      'Chennai Rice Co', 'Madurai Traders', 'Coimbatore Foods', 'Salem Rice Mills'
    ];
    
    // Vendor names for financial transactions
    const vendorNames = [
      'ESWAR & CO - Paddy Suppliers',
      'Tamil Nadu Electricity Board',
      'LIC Insurance Company',
      'Murugan Transport Services',
      'Arun Rice Mills',
      'Bharat Foods Ltd',
      'Salem Rice Mills',
      'Ganesh Foods Corporation',
      'Venkatesan Trading Co',
      'Ramesh Singh & Sons',
      'Murugan Co - Equipment',
      'Arun Mills - Maintenance'
    ];
    
    let totalSalesInvoices = 0;
    let totalFinancialTransactions = 0;
    let totalProductionEntries = 0;
    let totalPaddyEntries = 0;
    let totalInventoryEntries = 0;
    
    // Generate data for each month
    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const monthDate = months[monthIndex];
      const monthName = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      console.log(`📊 Generating data for ${monthName}...`);
      
      // Generate 15-25 sales invoices per month
      const invoicesPerMonth = Math.floor(Math.random() * 11) + 15; // 15-25
      
      for (let i = 0; i < invoicesPerMonth; i++) {
        const invoiceDate = getRandomDateInMonth(monthDate);
        
        // Determine status first, then calculate due date accordingly
        const status = Math.random() > 0.3 ? 'paid' : (Math.random() > 0.5 ? 'pending' : 'overdue');
        
        // Create some invoices that are overdue (past due date)
        let dueDate;
        if (status === 'overdue') {
          // For overdue invoices, set due date in the past
          dueDate = new Date(invoiceDate);
          dueDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 30) - 1); // 1-31 days in the past
        } else {
          // For current/pending invoices, set due date in the future
          dueDate = new Date(invoiceDate);
          dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 15); // 15-45 days
        }
        
        const customerState = southIndianStates[Math.floor(Math.random() * southIndianStates.length)];
        const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
        const riceVariety = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
        
        const quantity = Math.floor(Math.random() * 500) + 100; // 100-600 kg
        const pricePerKg = Math.floor(Math.random() * 20) + 30; // ₹30-50 per kg
        const totalAmount = quantity * pricePerKg;
        
        const paidAmount = status === 'paid' ? totalAmount : (status === 'pending' ? totalAmount * 0.6 : 0);
        
        await SalesInvoice.create({
          invoiceNumber: `INV-${monthDate.getFullYear()}${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          invoiceDate: invoiceDate,
          dueDate: dueDate,
          customer: {
            name: customerName,
            address: `${customerState}, India`,
            placeOfSupply: customerState,
            gstinPan: `GSTIN${Math.random().toString(36).substring(2, 15).toUpperCase()}`
          },
          items: [{
            productName: riceVariety,
            quantity: quantity,
            price: pricePerKg,
            uom: 'kg',
            hsnSacCode: '1006',
            total: totalAmount
          }],
          totals: {
            totalQuantity: quantity,
            totalAmount: totalAmount,
            grandTotal: totalAmount
          },
          payment: {
            paymentType: Math.random() > 0.5 ? 'CREDIT' : 'CASH'
          },
          status: status,
          paidAmount: paidAmount,
          paidDate: status === 'paid' ? invoiceDate : null,
          // Distribute invoices across branches for testing
          branch_id: getNextBranch()._id,
          createdBy: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id,
          createdBy_name: 'System Generated'
        });
        
        totalSalesInvoices++;
      }
      
      // Generate 20-35 financial transactions per month
      const transactionsPerMonth = Math.floor(Math.random() * 16) + 20; // 20-35
      
      for (let i = 0; i < transactionsPerMonth; i++) {
        const transactionDate = getRandomDateInMonth(monthDate);
        
        const transactionType = Math.random() > 0.4 ? 'income' : 'expense';
        const categories = transactionType === 'income' 
          ? ['rice_sales', 'other']
          : ['paddy_purchase', 'labor', 'electricity', 'maintenance', 'transport', 'rent', 'utilities', 'insurance', 'taxes', 'other'];
        
        const category = categories[Math.floor(Math.random() * categories.length)];
        const amount = transactionType === 'income' 
          ? Math.floor(Math.random() * 50000) + 10000 // ₹10k-60k
          : Math.floor(Math.random() * 20000) + 5000; // ₹5k-25k
        
        // For expenses, create some pending transactions to show outstanding amounts
        let transactionStatus = 'completed';
        if (transactionType === 'expense' && Math.random() > 0.7) { // 30% of expenses are pending
          transactionStatus = 'pending';
        }
        
        const vendor = transactionType === 'expense' ? vendorNames[Math.floor(Math.random() * vendorNames.length)] : null;
        const customer = transactionType === 'income' ? customerNames[Math.floor(Math.random() * customerNames.length)] : null;
        
        await FinancialTransaction.create({
          transactionDate: transactionDate,
          transactionType: transactionType,
          category: category,
          description: generateDescription(transactionType, category, vendor || customer, amount),
          amount: amount,
          paymentMethod: ['cash', 'bank_transfer', 'cheque', 'upi', 'card'][Math.floor(Math.random() * 5)],
          vendor: vendor,
          customer: customer,
          reference: generateInvoiceNumber(transactionType, category, transactionDate, totalFinancialTransactions + 1),
          status: transactionStatus,
          // Distribute transactions across branches for testing
          branch_id: getNextBranch()._id,
          createdBy: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id
        });
        
        totalFinancialTransactions++;
      }
      
      // Generate 8-15 production entries per month
      const productionPerMonth = Math.floor(Math.random() * 8) + 8; // 8-15
      
      for (let i = 0; i < productionPerMonth; i++) {
        const productionDate = getRandomDateInMonth(monthDate);
        
        const riceVariety = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
        await Production.create({
          name: riceVariety,
          description: `Production of ${riceVariety} rice`,
          quantity: Math.floor(Math.random() * 2000) + 1000, // 1000-3000 kg
          unit: 'kg',
          productionDate: productionDate,
          quality: ['Excellent', 'Good', 'Average'][Math.floor(Math.random() * 3)],
          status: ['Completed', 'In Progress', 'Pending'][Math.floor(Math.random() * 3)],
          operator: `Operator ${Math.floor(Math.random() * 3) + 1}`,
          notes: `Quality ${riceVariety} rice production`,
          // Distribute production across branches for testing
          branch_id: getNextBranch()._id,
          createdBy: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id
        });
        
        totalProductionEntries++;
      }
      
      // Generate 10-20 paddy entries per month
      const paddyPerMonth = Math.floor(Math.random() * 11) + 10; // 10-20
      
      for (let i = 0; i < paddyPerMonth; i++) {
        const paddyDate = getRandomDateInMonth(monthDate);
        
        await Paddy.create({
          issueDate: paddyDate,
          issueMemo: `PM-${monthDate.getFullYear()}${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          lorryNumber: `TN-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${String(Math.floor(Math.random() * 9999) + 1000)}`,
          paddyFrom: vendorNames[Math.floor(Math.random() * vendorNames.length)],
          paddyVariety: ['A', 'C'][Math.floor(Math.random() * 2)], // Only A and C as per schema
          moisture: (Math.random() * 3) + 11, // 11-14%
          gunny: {
            nb: Math.floor(Math.random() * 200) + 100, // 100-300 bags
            onb: Math.floor(Math.random() * 20) + 5,   // 5-25 bags
            ss: Math.floor(Math.random() * 10) + 1,    // 1-11 bags
            swp: 0
          },
          paddy: {
            bags: Math.floor(Math.random() * 300) + 100, // 100-400 bags
            weight: Math.floor(Math.random() * 5000) + 2000 // 2000-7000 kg
          },
          bagWeight: [25, 50, 100][Math.floor(Math.random() * 3)],
          // Distribute paddy entries across branches for testing
          branch_id: getNextBranch()._id,
          createdBy: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id
        });
        
        totalPaddyEntries++;
        
        // Generate inventory updates for each paddy entry
        const riceVariety = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
        
        await Inventory.create({
          name: riceVariety,
          quantity: Math.floor(Math.random() * 1000) + 500, // 500-1500 kg
          description: `Stock of ${riceVariety} rice`,
          // Distribute inventory across branches for testing
          branch_id: getNextBranch()._id,
          created_by: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id
        });
        
        totalInventoryEntries++;
      }
    }
    
    // Create some additional recent data for better dashboard visualization
    console.log('📈 Creating additional recent data for better charts...');
    
    // Create additional branch-specific data to ensure balanced distribution
    console.log('🏢 Creating additional branch-specific data...');
    
    // Add more data for North Branch
    for (let i = 0; i < 15; i++) {
      await Production.create({
        name: riceVarieties[Math.floor(Math.random() * riceVarieties.length)],
        description: `North Branch Production ${i + 1}`,
        quantity: Math.floor(Math.random() * 1500) + 800,
        unit: 'kg',
        productionDate: getRandomDateInMonth(months[Math.floor(Math.random() * months.length)]),
        quality: ['Excellent', 'Good', 'Average'][Math.floor(Math.random() * 3)],
        status: ['Completed', 'In Progress', 'Pending'][Math.floor(Math.random() * 3)],
        operator: `North Operator ${i + 1}`,
        notes: `North Branch specific production`,
        branch_id: northBranch._id,
        createdBy: superadmin._id
      });
      
      await Paddy.create({
        issueDate: getRandomDateInMonth(months[Math.floor(Math.random() * months.length)]),
        issueMemo: `NB-PM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        lorryNumber: `TN-NB-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${String(Math.floor(Math.random() * 9999) + 1000)}`,
        paddyFrom: vendorNames[Math.floor(Math.random() * vendorNames.length)],
        paddyVariety: ['A', 'C'][Math.floor(Math.random() * 2)],
        moisture: (Math.random() * 3) + 11,
        gunny: {
          nb: Math.floor(Math.random() * 150) + 80,
          onb: Math.floor(Math.random() * 15) + 3,
          ss: Math.floor(Math.random() * 8) + 1,
          swp: 0
        },
        paddy: {
          bags: Math.floor(Math.random() * 250) + 80,
          weight: Math.floor(Math.random() * 4000) + 1500
        },
        bagWeight: [25, 50, 100][Math.floor(Math.random() * 3)],
        branch_id: northBranch._id,
        createdBy: superadmin._id
      });
    }
    
    // Add more data for South Branch
    for (let i = 0; i < 15; i++) {
      await Production.create({
        name: riceVarieties[Math.floor(Math.random() * riceVarieties.length)],
        description: `South Branch Production ${i + 1}`,
        quantity: Math.floor(Math.random() * 1500) + 800,
        unit: 'kg',
        productionDate: getRandomDateInMonth(months[Math.floor(Math.random() * months.length)]),
        quality: ['Excellent', 'Good', 'Average'][Math.floor(Math.random() * 3)],
        status: ['Completed', 'In Progress', 'Pending'][Math.floor(Math.random() * 3)],
        operator: `South Operator ${i + 1}`,
        notes: `South Branch specific production`,
        branch_id: southBranch._id,
        createdBy: superadmin._id
      });
      
      await Paddy.create({
        issueDate: getRandomDateInMonth(months[Math.floor(Math.random() * months.length)]),
        issueMemo: `SB-PM-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        lorryNumber: `TN-SB-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${String(Math.floor(Math.random() * 9999) + 1000)}`,
        paddyFrom: vendorNames[Math.floor(Math.random() * vendorNames.length)],
        paddyVariety: ['A', 'C'][Math.floor(Math.random() * 2)],
        moisture: (Math.random() * 3) + 11,
        gunny: {
          nb: Math.floor(Math.random() * 150) + 80,
          onb: Math.floor(Math.random() * 15) + 3,
          ss: Math.floor(Math.random() * 8) + 1,
          swp: 0
        },
        paddy: {
          bags: Math.floor(Math.random() * 250) + 80,
          weight: Math.floor(Math.random() * 4000) + 1500
        },
        bagWeight: [25, 50, 100][Math.floor(Math.random() * 3)],
        branch_id: southBranch._id,
        createdBy: superadmin._id
      });
    }
    
    // Create some outstanding invoices for dashboard alerts
    console.log('📋 Creating outstanding invoices for alerts...');
    
    // Add more financial transactions for North and South branches
    console.log('💰 Adding additional financial data for North and South branches...');
    
    // North Branch additional transactions
    for (let i = 0; i < 20; i++) {
      await FinancialTransaction.create({
        transactionDate: getRandomDateInMonth(months[Math.floor(Math.random() * months.length)]),
        transactionType: Math.random() > 0.5 ? 'income' : 'expense',
        category: Math.random() > 0.5 ? 'rice_sales' : 'paddy_purchase',
        description: `North Branch Transaction ${i + 1}`,
        amount: Math.floor(Math.random() * 30000) + 15000,
        paymentMethod: ['cash', 'bank_transfer', 'cheque', 'upi', 'card'][Math.floor(Math.random() * 5)],
        vendor: Math.random() > 0.5 ? vendorNames[Math.floor(Math.random() * vendorNames.length)] : null,
        customer: Math.random() > 0.5 ? customerNames[Math.floor(Math.random() * customerNames.length)] : null,
        reference: `NB-TXN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        status: 'completed',
        branch_id: northBranch._id,
        createdBy: superadmin._id
      });
    }
    
    // South Branch additional transactions
    for (let i = 0; i < 20; i++) {
      await FinancialTransaction.create({
        transactionDate: getRandomDateInMonth(months[Math.floor(Math.random() * months.length)]),
        transactionType: Math.random() > 0.5 ? 'income' : 'expense',
        category: Math.random() > 0.5 ? 'rice_sales' : 'paddy_purchase',
        description: `South Branch Transaction ${i + 1}`,
        amount: Math.floor(Math.random() * 30000) + 15000,
        paymentMethod: ['cash', 'bank_transfer', 'cheque', 'upi', 'card'][Math.floor(Math.random() * 5)],
        vendor: Math.random() > 0.5 ? vendorNames[Math.floor(Math.random() * vendorNames.length)] : null,
        customer: Math.random() > 0.5 ? customerNames[Math.floor(Math.random() * customerNames.length)] : null,
        reference: `SB-TXN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        status: 'completed',
        branch_id: southBranch._id,
        createdBy: superadmin._id
      });
    }
    
    // Add more sales invoices for North and South branches
    console.log('📄 Adding additional sales invoices for North and South branches...');
    
    // North Branch additional invoices
    for (let i = 0; i < 15; i++) {
      const invoiceDate = getRandomDateInMonth(months[Math.floor(Math.random() * months.length)]);
      const totalAmount = Math.floor(Math.random() * 40000) + 20000;
      const paidAmount = Math.random() > 0.3 ? totalAmount : Math.floor(totalAmount * 0.7);
      const status = paidAmount === totalAmount ? 'paid' : 'pending';
      
      await SalesInvoice.create({
        invoiceNumber: `NB-INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        invoiceDate: invoiceDate,
        dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        customer: {
          name: customerNames[Math.floor(Math.random() * customerNames.length)],
          address: `${southIndianStates[Math.floor(Math.random() * southIndianStates.length)]}, India`,
          placeOfSupply: southIndianStates[Math.floor(Math.random() * southIndianStates.length)],
          gstinPan: `GSTINNB${String(i + 1).padStart(3, '0')}`
        },
        items: [{
          productName: riceVarieties[Math.floor(Math.random() * riceVarieties.length)],
          quantity: Math.floor(Math.random() * 500) + 200,
          price: Math.floor(Math.random() * 20) + 35,
          uom: 'kg',
          hsnSacCode: '1006',
          total: Math.floor(Math.random() * 15000) + 8000
        }],
        totals: {
          totalQuantity: Math.floor(Math.random() * 500) + 200,
          totalAmount: totalAmount,
          grandTotal: totalAmount
        },
        payment: {
          paymentType: Math.random() > 0.5 ? 'CREDIT' : 'CASH'
        },
        status: status,
        paidAmount: paidAmount,
        paidDate: status === 'paid' ? invoiceDate : null,
        branch_id: northBranch._id,
        createdBy: superadmin._id,
        createdBy_name: 'System Generated'
      });
    }
    
    // South Branch additional invoices
    for (let i = 0; i < 15; i++) {
      const invoiceDate = getRandomDateInMonth(months[Math.floor(Math.random() * months.length)]);
      const totalAmount = Math.floor(Math.random() * 40000) + 20000;
      const paidAmount = Math.random() > 0.3 ? totalAmount : Math.floor(totalAmount * 0.7);
      const status = paidAmount === totalAmount ? 'paid' : 'pending';
      
      await SalesInvoice.create({
        invoiceNumber: `SB-INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
        invoiceDate: invoiceDate,
        dueDate: new Date(invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        customer: {
          name: customerNames[Math.floor(Math.random() * customerNames.length)],
          address: `${southIndianStates[Math.floor(Math.random() * southIndianStates.length)]}, India`,
          placeOfSupply: southIndianStates[Math.floor(Math.random() * southIndianStates.length)],
          gstinPan: `GSTINSB${String(i + 1).padStart(3, '0')}`
        },
        items: [{
          productName: riceVarieties[Math.floor(Math.random() * riceVarieties.length)],
          quantity: Math.floor(Math.random() * 500) + 200,
          price: Math.floor(Math.random() * 20) + 35,
          uom: 'kg',
          hsnSacCode: '1006',
          total: Math.floor(Math.random() * 15000) + 8000
        }],
        totals: {
          totalQuantity: Math.floor(Math.random() * 500) + 200,
          totalAmount: totalAmount,
          grandTotal: totalAmount
        },
        payment: {
          paymentType: Math.random() > 0.5 ? 'CREDIT' : 'CASH'
        },
        status: status,
        paidAmount: paidAmount,
        paidDate: status === 'paid' ? invoiceDate : null,
        branch_id: southBranch._id,
        createdBy: superadmin._id,
        createdBy_name: 'System Generated'
      });
    }
    
    const outstandingInvoices = [
      {
        invoiceNumber: 'INV-2024-001-OVERDUE',
        invoiceDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        customer: {
          name: 'Overdue Customer 1',
          address: 'Tamil Nadu, India',
          placeOfSupply: 'Tamil Nadu',
          gstinPan: 'GSTINOVERDUE001'
        },
        items: [{
          productName: 'Sona Masoori',
          quantity: 300,
          price: 40,
          uom: 'kg',
          hsnSacCode: '1006',
          total: 12000
        }],
        totals: {
          totalQuantity: 300,
          totalAmount: 12000,
          grandTotal: 12000
        },
        payment: {
          paymentType: 'CREDIT'
        },
        status: 'overdue',
        paidAmount: 0,
        branch_id: mainBranch._id,
        createdBy: users.length > 0 ? users[0]._id : superadmin._id,
        createdBy_name: 'System Generated'
      },
      {
        invoiceNumber: 'INV-2024-002-PARTIAL',
        invoiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        customer: {
          name: 'Partial Payment Customer',
          address: 'Karnataka, India',
          placeOfSupply: 'Karnataka',
          gstinPan: 'GSTINPARTIAL002'
        },
        items: [{
          productName: 'Basmati',
          quantity: 250,
          price: 45,
          uom: 'kg',
          hsnSacCode: '1006',
          total: 11250
        }],
        totals: {
          totalQuantity: 250,
          totalAmount: 11250,
          grandTotal: 11250
        },
        payment: {
          paymentType: 'CREDIT'
        },
        status: 'pending',
        paidAmount: 6750, // 60% paid
        branch_id: northBranch._id,
        createdBy: users.length > 0 ? users[1]._id : superadmin._id,
        createdBy_name: 'System Generated'
      }
    ];
    
    for (const invoice of outstandingInvoices) {
      await SalesInvoice.create(invoice);
      totalSalesInvoices++;
    }
    
    console.log('\n🎉 Dashboard data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Sales Invoices: ${totalSalesInvoices}`);
    console.log(`- Financial Transactions: ${totalFinancialTransactions}`);
    console.log(`- Production Entries: ${totalProductionEntries}`);
    console.log(`- Paddy Entries: ${totalPaddyEntries}`);
    console.log(`- Inventory Items: ${totalInventoryEntries}`);
    console.log(`- Data spans: 7 months (${months[0].toLocaleDateString()} to ${months[months.length - 1].toLocaleDateString()})`);
    
    console.log('\n📈 Dashboard Features Now Available:');
    console.log('- 7 months of historical sales data');
    console.log('- Geographical sales across South Indian states');
    console.log('- Financial transactions (income/expenses)');
    console.log('- Production and paddy entry trends');
    console.log('- Outstanding invoices and payment tracking');
    console.log('- Branch-wise data distribution for testing');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Start your backend: npm run dev');
    console.log('2. Start your frontend: npm run dev');
    console.log('3. Login and explore the dashboard with branch filtering!');
    
  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
});