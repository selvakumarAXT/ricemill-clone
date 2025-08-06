const mongoose = require('mongoose');
require('dotenv').config();
const FinancialTransaction = require('./models/FinancialTransaction');
const User = require('./models/User');
const Branch = require('./models/Branch');

const seedFinancialTransactions = async () => {
  try {
    console.log('🌱 Starting Financial Transactions seeding...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');

    // Clear existing transactions
    await FinancialTransaction.deleteMany({});
    console.log('✅ Cleared existing financial transactions');

    // Get a superadmin user and a branch for creating transactions
    const superadmin = await User.findOne({ role: 'superadmin' });
    const branch = await Branch.findOne();

    if (!superadmin) {
      console.log('❌ No superadmin user found. Please run createSuperadmin.js first.');
      return;
    }

    if (!branch) {
      console.log('❌ No branch found. Please run seedAllModules.js first.');
      return;
    }

    const sampleTransactions = [
      {
        transactionDate: new Date('2024-01-15'),
        transactionType: 'income',
        category: 'rice_sales',
        description: 'Rice sales to ABC Traders - Premium Basmati',
        amount: 75000,
        paymentMethod: 'bank_transfer',
        reference: 'INV-2024-001',
        vendor: '',
        customer: 'ABC Traders',
        status: 'completed',
        remarks: 'Payment received on time. Quality rice delivered.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-16'),
        transactionType: 'expense',
        category: 'paddy_purchase',
        description: 'Paddy purchase from XYZ Suppliers - Sona Masoori',
        amount: 45000,
        paymentMethod: 'cash',
        reference: 'PO-2024-001',
        vendor: 'XYZ Suppliers',
        customer: '',
        status: 'completed',
        remarks: 'Quality paddy received. Moisture content within acceptable range.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-17'),
        transactionType: 'expense',
        category: 'labor',
        description: 'Daily labor wages for rice processing',
        amount: 8000,
        paymentMethod: 'cash',
        reference: 'LAB-2024-001',
        vendor: '',
        customer: '',
        status: 'completed',
        remarks: 'Payment for 8 workers for 8 hours each.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-18'),
        transactionType: 'expense',
        category: 'electricity',
        description: 'Monthly electricity bill for rice mill',
        amount: 12000,
        paymentMethod: 'bank_transfer',
        reference: 'ELEC-2024-001',
        vendor: 'State Electricity Board',
        customer: '',
        status: 'completed',
        remarks: 'Electricity consumption for rice processing operations.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-19'),
        transactionType: 'income',
        category: 'rice_sales',
        description: 'Rice sales to Local Market - Regular Rice',
        amount: 35000,
        paymentMethod: 'upi',
        reference: 'INV-2024-002',
        vendor: '',
        customer: 'Local Market Traders',
        status: 'completed',
        remarks: 'Quick sale to local market. Good profit margin.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-20'),
        transactionType: 'expense',
        category: 'maintenance',
        description: 'Rice mill machinery maintenance',
        amount: 15000,
        paymentMethod: 'cheque',
        reference: 'MAINT-2024-001',
        vendor: 'ABC Engineering Services',
        customer: '',
        status: 'completed',
        remarks: 'Regular maintenance of rice processing equipment.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-21'),
        transactionType: 'expense',
        category: 'transport',
        description: 'Transportation cost for rice delivery',
        amount: 5000,
        paymentMethod: 'cash',
        reference: 'TRANS-2024-001',
        vendor: 'City Transport Services',
        customer: '',
        status: 'completed',
        remarks: 'Delivery charges for rice to various customers.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-22'),
        transactionType: 'income',
        category: 'rice_sales',
        description: 'Bulk rice order from Hotel Chain',
        amount: 120000,
        paymentMethod: 'bank_transfer',
        reference: 'INV-2024-003',
        vendor: '',
        customer: 'Premium Hotel Chain',
        status: 'completed',
        remarks: 'Large order for premium quality rice. Payment received in advance.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-23'),
        transactionType: 'expense',
        category: 'rent',
        description: 'Monthly rent for rice mill premises',
        amount: 25000,
        paymentMethod: 'bank_transfer',
        reference: 'RENT-2024-001',
        vendor: 'Property Owner',
        customer: '',
        status: 'completed',
        remarks: 'Monthly rent payment for rice mill facility.',
        branch_id: branch._id,
        createdBy: superadmin._id
      },
      {
        transactionDate: new Date('2024-01-24'),
        transactionType: 'expense',
        category: 'utilities',
        description: 'Water and other utility bills',
        amount: 3000,
        paymentMethod: 'cash',
        reference: 'UTIL-2024-001',
        vendor: 'Municipal Corporation',
        customer: '',
        status: 'completed',
        remarks: 'Water supply and other utility charges.',
        branch_id: branch._id,
        createdBy: superadmin._id
      }
    ];

    // Create transactions
    const createdTransactions = await FinancialTransaction.insertMany(sampleTransactions);
    console.log(`✅ Created ${createdTransactions.length} financial transactions`);

    // Calculate and display summary
    const totalIncome = sampleTransactions
      .filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = sampleTransactions
      .filter(t => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpenses;

    console.log('\n📊 Financial Summary:');
    console.log(`💰 Total Income: ₹${totalIncome.toLocaleString()}`);
    console.log(`💸 Total Expenses: ₹${totalExpenses.toLocaleString()}`);
    console.log(`📈 Net Profit: ₹${netProfit.toLocaleString()}`);
    console.log(`📋 Total Transactions: ${createdTransactions.length}`);

    console.log('\n🎉 Financial Transactions seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding financial transactions:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedFinancialTransactions();
}

module.exports = seedFinancialTransactions; 