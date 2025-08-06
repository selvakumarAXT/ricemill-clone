const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Database connection
mongoose.connect('mongodb://localhost:27017/ricemill', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  
  try {
    // Find existing superadmin
    let superadmin = await User.findOne({ email: 'superadmin@ricemill.com' });
    
    if (superadmin) {
      console.log('👑 Found existing superadmin, updating password...');
      
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
    
  } catch (error) {
    console.error('❌ Error fixing superadmin:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}); 