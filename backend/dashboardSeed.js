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
require('dotenv').config();

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ricemill', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Clear existing dashboard-related data
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
    
    // Get existing users and branches
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
    
    // Get specific branch references
    const mainBranch = branches.find(b => b.millCode === 'MRM001') || branches[0];
    const northBranch = branches.find(b => b.millCode === 'NRB002') || branches[1] || branches[0];
    const southBranch = branches.find(b => b.millCode === 'SRB003') || branches[2] || branches[0];
    
    console.log('✅ Branches ready for data seeding');
    
    // Create Bag Weight Options
    console.log('⚖️ Creating Bag Weight Options...');
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
    
    // Generate 6 months of data (Jan-Jun 2025)
    console.log('📅 Generating 6 months of dashboard data for Jan-Jun 2025...');
    
    const months = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(2025, i, 1);
      months.push(monthDate);
    }
    
    const branchArray = [mainBranch, northBranch, southBranch];
    let branchIndex = 0;
    
    const getNextBranch = () => {
      const currentBranch = branchArray[branchIndex];
      branchIndex = (branchIndex + 1) % branchArray.length;
      return currentBranch;
    };
    
    const getRandomDateInMonth = (monthDate) => {
      const startOfMonth = new Date(monthDate);
      const endOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      const randomTime = startOfMonth.getTime() + Math.random() * (endOfMonth.getTime() - startOfMonth.getTime());
      return new Date(randomTime);
    };
    
    // Data arrays for variety
    const southIndianStates = ['Tamil Nadu', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Kerala'];
    const riceVarieties = ['Sona Masoori', 'Basmati', 'Ponni', 'IR20', 'IR36', 'ADT43', 'CO51'];
    const customerNames = [
      'ESWAR & CO', 'Priyanka Traders', 'Vikram Selvam', 'Venkatesan Foods',
      'Lakshmi Rice Mills', 'Ramesh Kumar', 'Sundar Trading Co', 'Ganesh Foods',
      'Murugan Enterprises', 'Karthik Traders', 'Arun Rice Mills', 'Bharat Foods'
    ];
    const vendorNames = [
      'ESWAR & CO - Paddy Suppliers', 'Tamil Nadu Electricity Board', 'LIC Insurance Company',
      'Murugan Transport Services', 'Arun Rice Mills', 'Bharat Foods Ltd'
    ];
    
    // Generate Sales Invoices
    console.log('📊 Creating Sales Invoices...');
    const salesInvoices = [];
    
    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const monthDate = months[monthIndex];
      const invoicesPerMonth = 15 + Math.floor(Math.random() * 10); // 15-25 invoices per month
      
      for (let i = 0; i < invoicesPerMonth; i++) {
        const invoiceDate = getRandomDateInMonth(monthDate);
        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        
        const customer = customerNames[Math.floor(Math.random() * customerNames.length)];
        const riceVariety = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
        const quantity = 50 + Math.floor(Math.random() * 200); // 50-250 kg
        const rate = 45 + Math.floor(Math.random() * 25); // 45-70 per kg
        const subtotal = quantity * rate;
        const gst = Math.round(subtotal * 0.18); // 18% GST
        const grandTotal = subtotal + gst;
        
        const paymentStatus = Math.random() > 0.3 ? 'completed' : 
                             Math.random() > 0.5 ? 'partial' : 'pending';
        
        const status = paymentStatus === 'completed' ? 'paid' : 
                      paymentStatus === 'partial' ? 'sent' : 'draft';
        
        const salesInvoice = {
          invoiceNumber: `SI-${monthDate.getFullYear()}${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          invoiceDate,
          dueDate,
          customer: {
            name: customer,
            email: `${customer.toLowerCase().replace(/\s+/g, '.')}@email.com`,
            phone: `+91${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            address: `${southIndianStates[Math.floor(Math.random() * southIndianStates.length)]}`,
            gstin: `GSTIN${Math.floor(Math.random() * 9000000000) + 1000000000}`
          },
          branch_id: getNextBranch()._id,
          items: [{
            name: riceVariety,
            quantity,
            unit: 'kg',
            rate,
            amount: subtotal,
            gst
          }],
          totals: {
            subtotal,
            gst,
            grandTotal
          },
          paymentStatus,
          status,
          createdBy: superadmin._id,
          isActive: true,
          isDeleted: false
        };
        
        salesInvoices.push(salesInvoice);
      }
    }
    
    const createdSalesInvoices = await SalesInvoice.create(salesInvoices);
    console.log('✅ Sales Invoices created:', createdSalesInvoices.length);
    
    // Generate Financial Transactions
    console.log('💰 Creating Financial Transactions...');
    const financialTransactions = [];
    
    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const monthDate = months[monthIndex];
      const transactionsPerMonth = 20 + Math.floor(Math.random() * 15); // 20-35 transactions per month
      
      for (let i = 0; i < transactionsPerMonth; i++) {
        const transactionDate = getRandomDateInMonth(monthDate);
        const isExpense = Math.random() > 0.4; // 60% expenses, 40% income
        
        let category, amount, vendor, description;
        
        if (isExpense) {
          const expenseCategories = ['paddy_purchase', 'labor', 'electricity', 'maintenance', 'transport', 'rent'];
          category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
          amount = category === 'paddy_purchase' ? 
                   50000 + Math.floor(Math.random() * 200000) : // 50k-250k for paddy
                   5000 + Math.floor(Math.random() * 50000);   // 5k-55k for others
          vendor = vendorNames[Math.floor(Math.random() * vendorNames.length)];
          description = `${category.replace('_', ' ')} - ${vendor}`;
        } else {
          const incomeCategories = ['rice_sales', 'paddy_purchase', 'labor', 'electricity', 'maintenance', 'transport', 'rent', 'utilities', 'insurance', 'taxes', 'other'];
          category = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
          amount = 10000 + Math.floor(Math.random() * 100000); // 10k-110k
          vendor = customerNames[Math.floor(Math.random() * customerNames.length)];
          description = `Income from ${category.replace('_', ' ')} - ${vendor}`;
        }
        
        const transaction = {
          transactionNumber: `TXN-${monthDate.getFullYear()}${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          transactionDate,
          transactionType: isExpense ? 'expense' : 'income',
          category,
          amount,
          vendor,
          description,
          paymentMethod: ['cash', 'bank_transfer', 'cheque', 'upi', 'card'][Math.floor(Math.random() * 5)],
          status: 'completed',
          branch_id: getNextBranch()._id,
          createdBy: superadmin._id
        };
        
        financialTransactions.push(transaction);
      }
    }
    
    const createdFinancialTransactions = await FinancialTransaction.create(financialTransactions);
    console.log('✅ Financial Transactions created:', createdFinancialTransactions.length);
    
    // Generate Production Data
    console.log('🏭 Creating Production Data...');
    const productionData = [];
    
    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const monthDate = months[monthIndex];
      const productionPerMonth = 8 + Math.floor(Math.random() * 5); // 8-12 production records per month
      
      for (let i = 0; i < productionPerMonth; i++) {
        const productionDate = getRandomDateInMonth(monthDate);
        const riceVariety = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
        const inputQuantity = 1000 + Math.floor(Math.random() * 2000); // 1000-3000 kg paddy
        const outputQuantity = Math.round(inputQuantity * 0.65); // 65% conversion rate
        const efficiency = 65 + Math.floor(Math.random() * 10); // 65-75% efficiency
        
        const production = {
          name: `${riceVariety} Production`,
          description: `Production of ${riceVariety} rice from paddy`,
          quantity: outputQuantity,
          unit: 'kg',
          productionDate,
          quality: ['Excellent', 'Good', 'Average', 'Poor'][Math.floor(Math.random() * 4)],
          status: 'Completed',
          batchNumber: `BATCH-${monthDate.getFullYear()}${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          operator: `Operator ${i + 1}`,
          notes: `Efficiency: ${efficiency}%, Input: ${inputQuantity}kg paddy, Output: ${outputQuantity}kg rice`,
          branch_id: getNextBranch()._id,
          createdBy: superadmin._id
        };
        
        productionData.push(production);
      }
    }
    
    const createdProduction = await Production.create(productionData);
    console.log('✅ Production Data created:', createdProduction.length);
    
    // Generate Paddy Data
    console.log('🌾 Creating Paddy Data...');
    const paddyData = [];
    
    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const monthDate = months[monthIndex];
      const paddyPerMonth = 10 + Math.floor(Math.random() * 8); // 10-17 paddy records per month
      
      for (let i = 0; i < paddyPerMonth; i++) {
        const purchaseDate = getRandomDateInMonth(monthDate);
        const quantity = 500 + Math.floor(Math.random() * 1500); // 500-2000 kg
        const rate = 25 + Math.floor(Math.random() * 10); // 25-35 per kg
        const totalAmount = quantity * rate;
        
        const paddy = {
          issueDate: purchaseDate,
          issueMemo: `Paddy Purchase - ${vendorNames[Math.floor(Math.random() * vendorNames.length)]}`,
          lorryNumber: `TN-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 9999)}`,
          paddyFrom: vendorNames[Math.floor(Math.random() * vendorNames.length)],
          paddyVariety: ['A', 'C'][Math.floor(Math.random() * 2)],
          moisture: 12 + Math.floor(Math.random() * 8), // 12-20% moisture
          gunny: {
            nb: Math.floor(quantity / 50), // Number of bags
            onb: 0,
            ss: 0,
            swp: 0
          },
          paddy: {
            bags: Math.ceil(quantity / 50),
            weight: quantity
          },
          bagWeight: 50,
          branch_id: getNextBranch()._id,
          createdBy: superadmin._id
        };
        
        paddyData.push(paddy);
      }
    }
    
    const createdPaddy = await Paddy.create(paddyData);
    console.log('✅ Paddy Data created:', createdPaddy.length);
    
    // Generate Inventory Data
    console.log('📦 Creating Inventory Data...');
    const inventoryData = [];
    
    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const monthDate = months[monthIndex];
      const inventoryPerMonth = 5 + Math.floor(Math.random() * 5); // 5-9 inventory records per month
      
      for (let i = 0; i < inventoryPerMonth; i++) {
        const inventoryDate = getRandomDateInMonth(monthDate);
        const itemName = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
        const quantity = 100 + Math.floor(Math.random() * 400); // 100-500 kg
        const unitPrice = 45 + Math.floor(Math.random() * 25); // 45-70 per kg
        
        const inventory = {
          name: itemName,
          quantity,
          description: `Inventory of ${itemName} rice variety`,
          branch_id: getNextBranch()._id,
          created_by: superadmin._id
        };
        
        inventoryData.push(inventory);
      }
    }
    
    const createdInventory = await Inventory.create(inventoryData);
    console.log('✅ Inventory Data created:', createdInventory.length);
    
    // Generate Rice Deposit Data
    console.log('🍚 Creating Rice Deposit Data...');
    const riceDepositData = [];
    
    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const monthDate = months[monthIndex];
      const depositsPerMonth = 6 + Math.floor(Math.random() * 6); // 6-11 deposits per month
      
      for (let i = 0; i < depositsPerMonth; i++) {
        const depositDate = getRandomDateInMonth(monthDate);
        const riceVariety = riceVarieties[Math.floor(Math.random() * riceVarieties.length)];
        const quantity = 200 + Math.floor(Math.random() * 800); // 200-1000 kg
        const bagWeight = bagWeights[Math.floor(Math.random() * bagWeights.length)].weight;
        const numberOfBags = Math.ceil(quantity / bagWeight);
        
        // Get a random paddy reference that has enough gunny bags
        const randomPaddyIndex = Math.floor(Math.random() * createdPaddy.length);
        const selectedPaddy = createdPaddy[randomPaddyIndex];
        const availableGunnyBags = selectedPaddy.gunny.nb || 0;
        
        // Ensure we don't exceed available gunny bags
        const actualNumberOfBags = Math.min(numberOfBags, availableGunnyBags);
        const actualQuantity = actualNumberOfBags * bagWeight;
        
        const riceDeposit = {
          date: depositDate,
          truckMemo: `Rice Deposit - ${riceVariety}`,
          lorryNumber: `TN-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 9999)}`,
          depositGodown: `Godown ${Math.floor(Math.random() * 5) + 1}`,
          variety: riceVariety,
          godownDate: depositDate,
          ackNo: `ACK-${depositDate.getFullYear()}${String(depositDate.getMonth() + 1).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`,
          riceBag: actualNumberOfBags,
          riceBagFrk: 0,
          depositWeight: actualQuantity,
          depositWeightFrk: 0,
          totalRiceDeposit: actualQuantity,
          moisture: 12 + Math.floor(Math.random() * 8), // 12-20% moisture
          sampleNumber: `SAMPLE-${Math.floor(Math.random() * 1000)}`,
          gunny: {
            onb: actualNumberOfBags,
            ss: 0,
            swp: 0
          },
          gunnyUsedFromPaddy: {
            nb: actualNumberOfBags,
            onb: 0,
            ss: 0,
            swp: 0
          },
          gunnyBags: actualNumberOfBags,
          gunnyWeight: actualNumberOfBags * bagWeight,
          paddyReference: selectedPaddy._id,
          branch_id: getNextBranch()._id,
          createdBy: superadmin._id
        };
        
        riceDepositData.push(riceDeposit);
      }
    }
    
    const createdRiceDeposits = await RiceDeposit.create(riceDepositData);
    console.log('✅ Rice Deposit Data created:', createdRiceDeposits.length);
    
    // Generate Gunny Data
    console.log('🛍️ Creating Gunny Data...');
    const gunnyData = [];
    
    for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
      const monthDate = months[monthIndex];
      const gunnyPerMonth = 4 + Math.floor(Math.random() * 4); // 4-7 gunny records per month
      
      for (let i = 0; i < gunnyPerMonth; i++) {
        const purchaseDate = getRandomDateInMonth(monthDate);
        const quantity = 100 + Math.floor(Math.random() * 400); // 100-500 bags
        const rate = 15 + Math.floor(Math.random() * 10); // 15-25 per bag
        
        const gunny = {
          issueDate: purchaseDate,
          issueMemo: `Gunny Purchase - ${quantity} bags`,
          lorryNumber: `TN-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 9999)}`,
          paddyFrom: vendorNames[Math.floor(Math.random() * vendorNames.length)],
          paddyVariety: ['A', 'C'][Math.floor(Math.random() * 2)],
          gunny: {
            nb: quantity,
            onb: 0,
            ss: 0,
            swp: 0
          },
          paddy: {
            bags: 0,
            weight: 0
          },
          branch_id: getNextBranch()._id,
          createdBy: superadmin._id
        };
        
        gunnyData.push(gunny);
      }
    }
    
    const createdGunny = await Gunny.create(gunnyData);
    console.log('✅ Gunny Data created:', createdGunny.length);
    
    // Summary
    console.log('\n🎉 Dashboard Seed Data Creation Complete!');
    console.log('📊 Summary of Created Data:');
    console.log(`   • Sales Invoices: ${createdSalesInvoices.length}`);
    console.log(`   • Financial Transactions: ${createdFinancialTransactions.length}`);
    console.log(`   • Production Records: ${createdProduction.length}`);
    console.log(`   • Paddy Records: ${createdPaddy.length}`);
    console.log(`   • Inventory Records: ${createdInventory.length}`);
    console.log(`   • Rice Deposits: ${createdRiceDeposits.length}`);
    console.log(`   • Gunny Records: ${createdGunny.length}`);
    console.log(`   • Bag Weight Options: ${bagWeights.length}`);
    console.log('\n🚀 Your dashboard is now ready with comprehensive data!');
    
  } catch (error) {
    console.error('❌ Error creating dashboard seed data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
});
