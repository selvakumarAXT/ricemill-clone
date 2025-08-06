const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');

const checkUser = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Find superadmin user
    const superadmin = await User.findOne({ role: 'superadmin' }).select('+password');
    
    if (!superadmin) {
      console.log('❌ No superadmin user found');
      return;
    }

    console.log('✅ Superadmin user found:');
    console.log('   ID:', superadmin._id);
    console.log('   Name:', superadmin.name);
    console.log('   Email:', superadmin.email);
    console.log('   Role:', superadmin.role);
    console.log('   isSuperAdmin:', superadmin.isSuperAdmin);
    console.log('   isActive:', superadmin.isActive);
    console.log('   Password hash:', superadmin.password ? 'Present' : 'Missing');

    // Test password
    const testPassword = 'superadmin123';
    const isPasswordValid = await bcrypt.compare(testPassword, superadmin.password);
    console.log('   Password test:', isPasswordValid ? '✅ Valid' : '❌ Invalid');

    // Create new password if needed
    if (!isPasswordValid) {
      console.log('\n🔄 Updating password...');
      const salt = await bcrypt.genSalt(10);
      superadmin.password = await bcrypt.hash(testPassword, salt);
      await superadmin.save();
      console.log('✅ Password updated successfully');
    }

  } catch (error) {
    console.error('❌ Error checking user:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
checkUser(); 