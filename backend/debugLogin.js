const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('./config/database');

const debugLogin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    const email = 'superadmin@ricemill.com';
    const password = 'superadmin123';

    console.log('🔍 Debugging login for:', email);

    // Step 1: Find user
    const user = await User.findOne({ email }).select('+password');
    console.log('1️⃣ User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('   User details:');
    console.log('   - ID:', user._id);
    console.log('   - Name:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Role:', user.role);
    console.log('   - isActive:', user.isActive);
    console.log('   - Password hash:', user.password ? 'Present' : 'Missing');

    // Step 2: Test password directly
    console.log('\n2️⃣ Testing password directly...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('   Direct bcrypt compare:', isMatch ? '✅ Match' : '❌ No match');

    // Step 3: Test matchPassword method
    console.log('\n3️⃣ Testing matchPassword method...');
    const methodMatch = await user.matchPassword(password);
    console.log('   matchPassword method:', methodMatch ? '✅ Match' : '❌ No match');

    // Step 4: Test with different password
    console.log('\n4️⃣ Testing with wrong password...');
    const wrongMatch = await user.matchPassword('wrongpassword');
    console.log('   Wrong password test:', wrongMatch ? '❌ Should not match' : '✅ Correctly rejected');

    // Step 5: Check if user is active
    console.log('\n5️⃣ Checking user status...');
    console.log('   isActive:', user.isActive);
    console.log('   isSuperAdmin:', user.isSuperAdmin);

    if (!isMatch) {
      console.log('\n🔄 Password mismatch detected. Updating password...');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      console.log('✅ Password updated');
      
      // Test again
      const newMatch = await user.matchPassword(password);
      console.log('   New password test:', newMatch ? '✅ Match' : '❌ Still no match');
    }

  } catch (error) {
    console.error('❌ Error debugging login:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
debugLogin(); 