const mongoose = require('mongoose');
const Gunny = require('./models/Gunny');
const User = require('./models/User');
const Branch = require('./models/Branch');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testGunnyDelete() {
  try {
    console.log('=== Testing Gunny Delete Functionality ===');
    
    // Check if there are any gunny records
    const gunnyCount = await Gunny.countDocuments();
    console.log('Total gunny records in database:', gunnyCount);
    
    if (gunnyCount === 0) {
      console.log('No gunny records found. Please create some records first.');
      return;
    }
    
    // Get a sample gunny record
    const sampleGunny = await Gunny.findOne().populate('branch_id', 'name');
    console.log('Sample gunny record:', {
      _id: sampleGunny._id,
      issueMemo: sampleGunny.issueMemo,
      branch_id: sampleGunny.branch_id,
      createdBy: sampleGunny.createdBy
    });
    
    // Check if there are any users
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);
    
    let sampleUser = null;
    if (userCount > 0) {
      sampleUser = await User.findOne().select('-password');
      console.log('Sample user:', {
        _id: sampleUser._id,
        name: sampleUser.name,
        role: sampleUser.role,
        isSuperAdmin: sampleUser.isSuperAdmin,
        branch_id: sampleUser.branch_id
      });
    }
    
    // Test the delete query logic
    if (sampleUser) {
      const testUserId = sampleUser._id;
      const testUserBranchId = sampleUser.branch_id;
      const testUserIsSuperAdmin = sampleUser.isSuperAdmin;
      
      console.log('\n=== Testing Delete Query Logic ===');
      console.log('Test user ID:', testUserId);
      console.log('Test user branch_id:', testUserBranchId);
      console.log('Test user isSuperAdmin:', testUserIsSuperAdmin);
      
      let query = { _id: sampleGunny._id };
      if (!testUserIsSuperAdmin) {
        query.branch_id = testUserBranchId;
      }
      
      console.log('Final delete query:', JSON.stringify(query, null, 2));
      
      // Check if a record would be found with this query
      const wouldFind = await Gunny.findOne(query);
      console.log('Would find record with query:', !!wouldFind);
      
      if (wouldFind) {
        console.log('Record found - delete should work');
      } else {
        console.log('Record NOT found - delete will fail with "not found" error');
      }
    }
    
  } catch (error) {
    console.error('Error testing gunny delete:', error);
  } finally {
    mongoose.connection.close();
  }
}

testGunnyDelete();
