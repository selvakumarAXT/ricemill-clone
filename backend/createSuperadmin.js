const mongoose = require('mongoose');
const User = require('./models/User');
const Branch = require('./models/Branch');
require('dotenv').config();

const connectDB = require('./config/database');

const createSuperadmin = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Check if superadmin already exists
    const existingSuperadmin = await User.findOne({ role: 'superadmin' });
    if (existingSuperadmin) {
      console.log('ℹ️  Superadmin already exists:', existingSuperadmin.email);
      return;
    }

    // Create superadmin user
    const superadminData = {
      name: 'Super Admin',
      email: 'superadmin@ricemill.com',
      password: 'superadmin123',
      role: 'superadmin',
      isSuperAdmin: true,
      isActive: true
    };

    const superadmin = await User.create(superadminData);
    console.log('✅ Superadmin created successfully:');
    console.log('   Email:', superadmin.email);
    console.log('   Password: superadmin123');
    console.log('   Role:', superadmin.role);
    console.log('   ID:', superadmin._id);

    // Create a default branch if none exists
    const existingBranches = await Branch.find();
    if (existingBranches.length === 0) {
      const defaultBranch = await Branch.create({
        name: 'Main Branch',
        millCode: 'MB001',
        address: 'Main Rice Mill Location',
        contactInfo: {
          phone: '+91-9876543210',
          email: 'main@ricemill.com'
        },
        gstn: 'GST123456789',
        isActive: true
      });
      console.log('✅ Default branch created:', defaultBranch.name);
    }

    console.log('\n🎉 Setup complete! You can now login with:');
    console.log('   Email: superadmin@ricemill.com');
    console.log('   Password: superadmin123');

  } catch (error) {
    console.error('❌ Error creating superadmin:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
createSuperadmin(); 