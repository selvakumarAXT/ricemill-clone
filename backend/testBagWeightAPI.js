const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./config/database');

const testBagWeightAPI = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get a superadmin user
    const superadmin = await User.findOne({ isSuperAdmin: true });
    if (!superadmin) {
      console.error('❌ No superadmin user found');
      process.exit(1);
    }

    console.log('👤 Found superadmin:', superadmin.email);

    // Generate JWT token
    const token = jwt.sign({ id: superadmin._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    console.log('🔑 Generated token:', token.substring(0, 20) + '...');

    // Test the API with curl
    const curlCommand = `curl -X GET "http://localhost:3001/api/bag-weight-options" \\
      -H "Content-Type: application/json" \\
      -H "Authorization: Bearer ${token}" \\
      -v`;

    console.log('\n🌐 Testing API with curl command:');
    console.log(curlCommand);

    // Execute the curl command
    const { exec } = require('child_process');
    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Curl error:', error);
        return;
      }
      if (stderr) {
        console.log('⚠️  Curl stderr:', stderr);
      }
      console.log('📦 API Response:');
      console.log(stdout);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the test
testBagWeightAPI(); 