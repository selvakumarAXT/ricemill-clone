const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Database connection - you can change this to your new database name
const MONGODB_URI = process.env.MONGODB_URI 

console.log(`🔗 Connecting to: ${MONGODB_URI}`);

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log(`✅ Connected to MongoDB database: ${db.name}`);
  
  try {
    // Check if we want to start fresh (uncomment the next line if you want to drop all users)
    // await User.deleteMany({});
    // console.log('🗑️  All users deleted, starting fresh...');
    
    // Find existing superadmin
    let superadmin = await User.findOne({ role: 'superadmin' });
    
    if (superadmin) {
      console.log('👑 Found existing superadmin, updating password...');
      console.log(`   User ID: ${superadmin._id}`);
      console.log(`   Email: ${superadmin.email}`);
      console.log(`   Created: ${superadmin.createdAt}`);
      
      // Set the password directly (will be hashed by pre-save middleware)
      superadmin.password = 'superadmin123';
      await superadmin.save();
      
      console.log('✅ Superadmin password updated successfully');
    } else {
      console.log('👑 Creating new superadmin...');
      
      // Create new superadmin (password will be hashed by pre-save middleware)
      superadmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@ricemill.com',
        password: 'superadmin123',
        role: 'superadmin',
        isSuperAdmin: true,
        phone: '+1234567890',
        isActive: true
      });
      
      console.log('✅ Superadmin created successfully');
    }
    
    // Test the password using the model's matchPassword method
    const testUser = await User.findOne({ email: 'superadmin@ricemill.com' }).select('+password');
    const isPasswordValid = await testUser.matchPassword('superadmin123');
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
    }
    
    console.log('🔑 Login credentials: superadmin@ricemill.com / superadmin123');
    
    // Show all users in the database
    const allUsers = await User.find({}).select('name email role createdAt');
    console.log(`\n👥 Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ${user.role} - Created: ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing superadmin:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
});