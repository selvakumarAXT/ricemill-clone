const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('🔌 Testing database connection...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');
    
    // Test if we can access the database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Test if FinancialTransaction model can be created
    const FinancialTransaction = require('./models/FinancialTransaction');
    console.log('✅ FinancialTransaction model loaded successfully');
    
    // Test if we can query the collection
    const count = await FinancialTransaction.countDocuments();
    console.log(`📊 Current financial transactions count: ${count}`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

testConnection(); 