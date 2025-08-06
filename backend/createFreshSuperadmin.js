const mongoose = require('mongoose');
const User = require('./models/User');
const Branch = require('./models/Branch');
require('dotenv').config();

const connectDB = require('./config/database');

const createFreshSuperadmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Delete existing superadmin
    const deletedUser = await User.findOneAndDelete({ role: 'superadmin' });
    if (deletedUser) {
      console.log('🗑️  Deleted existing superadmin:', deletedUser.email);
    }

    // Create a default branch if none exists
    let branches = await Branch.find();
    if (branches.length === 0) {
      branches = await Branch.create([
        {
          name: 'Main Branch',
          millCode: 'MB001',
          address: 'Main Rice Mill Location',
          contactInfo: { phone: '+91-9876543210', email: 'main@ricemill.com' },
          gstn: 'GST123456789',
          isActive: true
        }
      ]);
      console.log('✅ Created default branch');
    }

    // Create fresh superadmin user
    const superadminData = {
      name: 'Super Admin',
      email: 'superadmin@ricemill.com',
      password: 'superadmin123',
      role: 'superadmin',
      isSuperAdmin: true,
      isActive: true
    };

    const superadmin = await User.create(superadminData);
    console.log('✅ Fresh superadmin created successfully:');
    console.log('   Email:', superadmin.email);
    console.log('   Password: superadmin123');
    console.log('   Role:', superadmin.role);
    console.log('   ID:', superadmin._id);

    // Verify the password works
    const testUser = await User.findOne({ email: superadmin.email }).select('+password');
    const isPasswordValid = await testUser.matchPassword('superadmin123');
    console.log('   Password verification:', isPasswordValid ? '✅ Valid' : '❌ Invalid');

    console.log('\n🎉 Fresh superadmin setup complete!');
    console.log('   Login credentials:');
    console.log('   Email: superadmin@ricemill.com');
    console.log('   Password: superadmin123');

  } catch (error) {
    console.error('❌ Error creating fresh superadmin:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
createFreshSuperadmin(); 