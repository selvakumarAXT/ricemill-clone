const mongoose = require('mongoose');
const BagWeightOption = require('./models/BagWeightOption');
const Branch = require('./models/Branch');
const User = require('./models/User');
require('dotenv').config();

const connectDB = require('./config/database');

const defaultBagWeights = [
  { weight: 40, label: '40 kg', isDefault: false },
  { weight: 45, label: '45 kg', isDefault: false },
  { weight: 50, label: '50 kg', isDefault: true }, // Default option
  { weight: 55, label: '55 kg', isDefault: false },
  { weight: 60, label: '60 kg', isDefault: false },
];

const seedBagWeightOptions = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get all branches
    const branches = await Branch.find({ isActive: true });
    console.log(`📋 Found ${branches.length} active branches`);

    // Get a superadmin user for creating options
    const superadmin = await User.findOne({ isSuperAdmin: true });
    if (!superadmin) {
      console.error('❌ No superadmin user found. Please create a superadmin first.');
      process.exit(1);
    }

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const branch of branches) {
      console.log(`\n🏢 Processing branch: ${branch.name} (${branch.millCode})`);
      
      for (const weightOption of defaultBagWeights) {
        try {
          // Check if option already exists
          const existingOption = await BagWeightOption.findOne({
            branch_id: branch._id,
            weight: weightOption.weight,
            isActive: true
          });

          if (existingOption) {
            console.log(`  ⏭️  Skipped ${weightOption.label} (already exists)`);
            totalSkipped++;
            continue;
          }

          // Create new option
          await BagWeightOption.create({
            weight: weightOption.weight,
            label: weightOption.label,
            isDefault: weightOption.isDefault,
            createdBy: superadmin._id,
            branch_id: branch._id
          });

          console.log(`  ✅ Created ${weightOption.label}${weightOption.isDefault ? ' (default)' : ''}`);
          totalCreated++;
        } catch (error) {
          console.error(`  ❌ Error creating ${weightOption.label}:`, error.message);
        }
      }
    }

    console.log(`\n🎉 Seeding completed!`);
    console.log(`✅ Created: ${totalCreated} options`);
    console.log(`⏭️  Skipped: ${totalSkipped} options (already existed)`);
    console.log(`📊 Total: ${totalCreated + totalSkipped} options processed`);

  } catch (error) {
    console.error('❌ Error seeding bag weight options:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding function
seedBagWeightOptions(); 