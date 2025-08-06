const mongoose = require('mongoose');
const Paddy = require('./models/Paddy');
const Production = require('./models/Production');
const Gunny = require('./models/Gunny');
const Inventory = require('./models/Inventory');
const Branch = require('./models/Branch');
const User = require('./models/User');
require('dotenv').config();

const connectDB = require('./config/database');

const seedSampleData = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get or create branches
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
        },
        {
          name: 'North Branch',
          millCode: 'NB002',
          address: 'North Region Rice Mill',
          contactInfo: { phone: '+91-9876543211', email: 'north@ricemill.com' },
          gstn: 'GST123456790',
          isActive: true
        }
      ]);
      console.log('✅ Created sample branches');
    }

    // Get superadmin user
    const superadmin = await User.findOne({ role: 'superadmin' });
    if (!superadmin) {
      console.error('❌ No superadmin found. Please run createSuperadmin.js first.');
      return;
    }

    // Create sample paddy entries
    const paddyCount = await Paddy.countDocuments();
    if (paddyCount === 0) {
      const paddyEntries = [
        {
          paddyVariety: 'Basmati',
          paddyFrom: 'Farmer A',
          paddy: { bags: 50, weight: 2500 },
          gunny: { nb: 45, onb: 5, ss: 0, swp: 0 },
          issueDate: new Date(),
          branch_id: branches[0]._id,
          created_by: superadmin._id
        },
        {
          paddyVariety: 'Sona Masoori',
          paddyFrom: 'Farmer B',
          paddy: { bags: 75, weight: 3750 },
          gunny: { nb: 70, onb: 5, ss: 0, swp: 0 },
          issueDate: new Date(),
          branch_id: branches[0]._id,
          created_by: superadmin._id
        },
        {
          paddyVariety: 'Basmati',
          paddyFrom: 'Farmer C',
          paddy: { bags: 60, weight: 3000 },
          gunny: { nb: 55, onb: 5, ss: 0, swp: 0 },
          issueDate: new Date(),
          branch_id: branches[1]._id,
          created_by: superadmin._id
        }
      ];

      await Paddy.insertMany(paddyEntries);
      console.log('✅ Created sample paddy entries');
    }

    // Create sample production records
    const productionCount = await Production.countDocuments();
    if (productionCount === 0) {
      const paddyEntries = await Paddy.find();
      if (paddyEntries.length > 0) {
        const productionEntries = [
          {
            name: 'Basmati Rice Production',
            description: 'Production of Basmati rice from paddy',
            quantity: 1750,
            unit: 'kg',
            productionDate: new Date(),
            quality: 'Excellent',
            status: 'Completed',
            batchNumber: 'BATCH001',
            operator: 'John Doe',
            notes: 'High quality basmati rice production',
            branch_id: branches[0]._id,
            createdBy: superadmin._id
          }
        ];

        if (paddyEntries.length > 1) {
          productionEntries.push({
            name: 'Sona Masoori Rice Production',
            description: 'Production of Sona Masoori rice from paddy',
            quantity: 2625,
            unit: 'kg',
            productionDate: new Date(),
            quality: 'Good',
            status: 'Completed',
            batchNumber: 'BATCH002',
            operator: 'Jane Smith',
            notes: 'Standard quality sona masoori rice production',
            branch_id: branches[0]._id,
            createdBy: superadmin._id
          });
        }

        await Production.insertMany(productionEntries);
        console.log('✅ Created sample production records');
      }
    }

    // Create sample gunny entries
    const gunnyCount = await Gunny.countDocuments();
    if (gunnyCount === 0) {
      const gunnyEntries = [
        {
          issueDate: new Date(),
          issueMemo: 'GUNNY001',
          lorryNumber: 'KA01AB1234',
          paddyFrom: 'Farmer A',
          paddyVariety: 'Basmati',
          gunny: { nb: 100, onb: 10, ss: 5, swp: 2 },
          paddy: { bags: 50, weight: 2500 },
          branch_id: branches[0]._id,
          createdBy: superadmin._id
        },
        {
          issueDate: new Date(),
          issueMemo: 'GUNNY002',
          lorryNumber: 'KA02CD5678',
          paddyFrom: 'Farmer B',
          paddyVariety: 'Sona Masoori',
          gunny: { nb: 150, onb: 15, ss: 8, swp: 3 },
          paddy: { bags: 75, weight: 3750 },
          branch_id: branches[1]._id,
          createdBy: superadmin._id
        }
      ];

      await Gunny.insertMany(gunnyEntries);
      console.log('✅ Created sample gunny entries');
    }

    // Create sample inventory items
    const inventoryCount = await Inventory.countDocuments();
    if (inventoryCount === 0) {
      const inventoryItems = [
        {
          name: 'Rice Bags',
          quantity: 500,
          description: 'Standard rice packaging bags',
          branch_id: branches[0]._id,
          created_by: superadmin._id
        },
        {
          name: 'Gunny Bags',
          quantity: 200,
          description: 'Jute gunny bags for paddy storage',
          branch_id: branches[0]._id,
          created_by: superadmin._id
        },
        {
          name: 'Weighing Scale',
          quantity: 5,
          description: 'Digital weighing scales for accurate measurements',
          branch_id: branches[0]._id,
          created_by: superadmin._id
        },
        {
          name: 'Rice Bags',
          quantity: 300,
          description: 'Standard rice packaging bags',
          branch_id: branches[1]._id,
          created_by: superadmin._id
        }
      ];

      await Inventory.insertMany(inventoryItems);
      console.log('✅ Created sample inventory items');
    }

    console.log('\n🎉 Sample data seeding complete!');
    console.log('📊 Dashboard now has meaningful data to display');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the script
seedSampleData(); 