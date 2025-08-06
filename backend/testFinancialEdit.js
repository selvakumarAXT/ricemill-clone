const mongoose = require('mongoose');
require('dotenv').config();
const FinancialTransaction = require('./models/FinancialTransaction');

const testFinancialEdit = async () => {
  try {
    console.log('🧪 Testing Financial Transaction Edit Functionality...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');
    
    // Get a sample transaction
    const transaction = await FinancialTransaction.findOne();
    if (!transaction) {
      console.log('❌ No transactions found. Please run seedFinancialTransactions.js first.');
      return;
    }
    
    console.log('\n📋 Sample Transaction:');
    console.log('ID:', transaction._id);
    console.log('Description:', transaction.description);
    console.log('Amount:', transaction.amount);
    console.log('Type:', transaction.transactionType);
    console.log('Category:', transaction.category);
    console.log('Date:', transaction.transactionDate);
    
    // Test updating the transaction
    const updateData = {
      description: 'Updated: ' + transaction.description,
      amount: transaction.amount + 1000,
      remarks: 'This transaction was updated for testing'
    };
    
    console.log('\n🔄 Testing update with data:', updateData);
    
    const updatedTransaction = await FinancialTransaction.findByIdAndUpdate(
      transaction._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    console.log('\n✅ Updated Transaction:');
    console.log('Description:', updatedTransaction.description);
    console.log('Amount:', updatedTransaction.amount);
    console.log('Remarks:', updatedTransaction.remarks);
    
    // Verify the update worked
    if (updatedTransaction.description === updateData.description && 
        updatedTransaction.amount === updateData.amount) {
      console.log('\n🎉 Update test PASSED!');
    } else {
      console.log('\n❌ Update test FAILED!');
    }
    
    // Test date formatting for frontend
    const formattedDate = new Date(transaction.transactionDate).toISOString().split('T')[0];
    console.log('\n📅 Date formatting test:');
    console.log('Original date:', transaction.transactionDate);
    console.log('Formatted date (YYYY-MM-DD):', formattedDate);
    
  } catch (error) {
    console.error('❌ Error testing financial edit:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testFinancialEdit(); 