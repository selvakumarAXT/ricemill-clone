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
    
    // Create Bag Weight Options if they don't exist
    console.log('⚖️ Creating Bag Weight Options...');
    const existingBagWeights = await BagWeightOption.find({});
    if (existingBagWeights.length === 0) {
      const bagWeights = await BagWeightOption.create([
        {
          weight: 25,
          label: '25 kg',
          isActive: true,
          branch_id: branches[0]._id,
          createdBy: superadmin._id
        },
        {
          weight: 50,
          label: '50 kg',
          isActive: true,
          branch_id: branches[0]._id,
          createdBy: superadmin._id
        },
        {
          weight: 100,
          label: '100 kg',
          isActive: true,
          branch_id: branches[0]._id,
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
        const invoiceDate = new Date(monthDate);
        invoiceDate.setDate(Math.floor(Math.random() * 28) + 1);
        
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
          branch_id: branches[Math.floor(Math.random() * branches.length)]._id,
          createdBy: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id,
          createdBy_name: 'System Generated'
        });
        
        totalSalesInvoices++;
      }
      
      // Generate 20-35 financial transactions per month
      const transactionsPerMonth = Math.floor(Math.random() * 16) + 20; // 20-35
      
      for (let i = 0; i < transactionsPerMonth; i++) {
        const transactionDate = new Date(monthDate);
        transactionDate.setDate(Math.floor(Math.random() * 28) + 1);
        
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
          branch_id: branches[Math.floor(Math.random() * branches.length)]._id,
          createdBy: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id
        });
        
        totalFinancialTransactions++;
      }
      
      // Generate 8-15 production entries per month
      const productionPerMonth = Math.floor(Math.random() * 8) + 8; // 8-15
      
      for (let i = 0; i < productionPerMonth; i++) {
        const productionDate = new Date(monthDate);
        productionDate.setDate(Math.floor(Math.random() * 28) + 1);
        
        const riceVariety = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
        const quantity = Math.floor(Math.random() * 2000) + 500; // 500-2500 kg
        
        await Production.create({
          name: riceVariety,
          description: `Production of ${riceVariety} rice`,
          quantity: quantity,
          unit: 'kg',
          productionDate: productionDate,
          quality: ['Excellent', 'Good', 'Average', 'Poor'][Math.floor(Math.random() * 3)],
          status: 'Completed',
          operator: `Operator ${Math.floor(Math.random() * 3) + 1}`,
          notes: `Quality ${riceVariety} rice production`,
          branch_id: branches[Math.floor(Math.random() * branches.length)]._id,
          createdBy: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id
        });
        
        totalProductionEntries++;
      }
      
      // Generate 10-20 paddy entries per month
      const paddyPerMonth = Math.floor(Math.random() * 11) + 10; // 10-20
      
      for (let i = 0; i < paddyPerMonth; i++) {
        const issueDate = new Date(monthDate);
        issueDate.setDate(Math.floor(Math.random() * 28) + 1);
        
        const paddyFrom = vendorNames[Math.floor(Math.random() * vendorNames.length)];
        const paddyVariety = ['A', 'C'][Math.floor(Math.random() * 2)]; // Only A and C as per schema
        const bags = Math.floor(Math.random() * 200) + 50; // 50-250 bags
        const weight = bags * 25; // 25kg per bag
        
        await Paddy.create({
          issueDate: issueDate,
          issueMemo: `PM-${monthDate.getFullYear()}${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          lorryNumber: `TN-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
          paddyFrom: paddyFrom,
          paddyVariety: paddyVariety,
          moisture: Math.random() * 5 + 10, // 10-15%
          gunny: {
            nb: Math.floor(bags * 0.9), // 90% new bags
            onb: Math.floor(bags * 0.08), // 8% old new bags
            ss: Math.floor(bags * 0.02), // 2% second sale
            swp: 0
          },
          paddy: {
            bags: bags,
            weight: weight
          },
          bagWeight: 25,
          branch_id: branches[Math.floor(Math.random() * branches.length)]._id,
          createdBy: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id
        });
        
        totalPaddyEntries++;
      }
      
      // Generate inventory updates
      const riceVariety = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
      const quantity = Math.floor(Math.random() * 1000) + 200; // 200-1200 kg
      
      await Inventory.create({
        name: riceVariety,
        quantity: quantity,
        description: `Stock of ${riceVariety} rice`,
        branch_id: branches[Math.floor(Math.random() * branches.length)]._id,
        created_by: users.length > 0 ? users[Math.floor(Math.random() * users.length)]._id : superadmin._id
      });
      
      totalInventoryEntries++;
    }
    
    // Create some additional recent data for better dashboard visualization
    console.log('📈 Creating additional recent data for better charts...');
    
    // Create some outstanding invoices for dashboard alerts
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
        branch_id: branches[0]._id,
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
        branch_id: branches[1]._id,
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
    console.log(`- Data spans: 6 months (${months[0].toLocaleDateString()} to ${months[months.length - 1].toLocaleDateString()})`);
    
    console.log('\n📈 Dashboard Features Now Available:');
    console.log('- 6 months of historical sales data');
    console.log('- Geographical sales across South Indian states');
    console.log('- Financial transactions (income/expenses)');
    console.log('- Production and paddy entry trends');
    console.log('- Outstanding invoices and payment tracking');
    console.log('- Branch-wise data distribution');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Start your backend: npm run dev');
    console.log('2. Start your frontend: npm run dev');
    console.log('3. Login and explore the dashboard!');
    
  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
});
