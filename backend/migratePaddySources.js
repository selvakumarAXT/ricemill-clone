const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Paddy = require('./models/Paddy');
const Gunny = require('./models/Gunny');

// Load environment variables
dotenv.config();

// Migration mapping for existing invalid paddy sources
const paddySourceMapping = {
  'Muthu Kumar': 'Local Farmers',
  'Lakshmi Devi': 'Traders',
  'Ramesh Singh': 'Cooperative Societies',
  'Theni': 'Local Farmers', // Map "Theni" to "Local Farmers"
  // Add more mappings as needed
};

async function migratePaddySources() {
  try {
    console.log('🔄 Starting paddy source migration...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Update Paddy records
    console.log('📝 Updating Paddy records...');
    
    // Use a simpler approach with multiple updateMany calls
    let paddyUpdatedCount = 0;
    for (const [oldValue, newValue] of Object.entries(paddySourceMapping)) {
      const result = await Paddy.updateMany(
        { paddyFrom: oldValue },
        { $set: { paddyFrom: newValue } }
      );
      paddyUpdatedCount += result.modifiedCount;
    }
    console.log(`✅ Updated ${paddyUpdatedCount} Paddy records`);
    
    // Update Gunny records
    console.log('📝 Updating Gunny records...');
    
    // Use a simpler approach with multiple updateMany calls
    let gunnyUpdatedCount = 0;
    for (const [oldValue, newValue] of Object.entries(paddySourceMapping)) {
      const result = await Gunny.updateMany(
        { paddyFrom: oldValue },
        { $set: { paddyFrom: newValue } }
      );
      gunnyUpdatedCount += result.modifiedCount;
    }
    console.log(`✅ Updated ${gunnyUpdatedCount} Gunny records`);
    
    // Show summary of current paddy sources
    console.log('\n📊 Current paddy sources in database:');
    
    const paddySources = await Paddy.aggregate([
      { $group: { _id: '$paddyFrom', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('Paddy records:');
    paddySources.forEach(source => {
      console.log(`  ${source._id}: ${source.count} records`);
    });
    
    const gunnySources = await Gunny.aggregate([
      { $group: { _id: '$paddyFrom', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('Gunny records:');
    gunnySources.forEach(source => {
      console.log(`  ${source._id}: ${source.count} records`);
    });
    
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run migration if called directly
if (require.main === module) {
  migratePaddySources();
}

module.exports = migratePaddySources;
