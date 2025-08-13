const mongoose = require('mongoose');
const User = require('./models/User');
const Branch = require('./models/Branch');
const Paddy = require('./models/Paddy');
const Production = require('./models/Production');
const Gunny = require('./models/Gunny');
const Inventory = require('./models/Inventory');
const { RiceDeposit } = require('./models/RiceDeposit');
const BagWeightOption = require('./models/BagWeightOption');

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
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Paddy.deleteMany({});
    await Production.deleteMany({});
    await Gunny.deleteMany({});
    await Inventory.deleteMany({});
    await RiceDeposit.deleteMany({});
    await BagWeightOption.deleteMany({});
    
    console.log('✅ Data cleared successfully');
    
    // Create Superadmin
    console.log('👑 Creating Superadmin...');
    const superadmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@ricemill.com',
      password: 'superadmin123', // Plain text - model will hash it
      role: 'superadmin',
      isSuperAdmin: true,
      phone: '+1234567890',
      address: 'Main Office, Rice Mill Complex',
      isActive: true
    });
    console.log('✅ Superadmin created:', superadmin.email);
    
    // Create or Update Branches
    console.log('🏢 Creating/Updating Branches...');
    const branches = [];
    
    // Fixed ObjectIds for consistent branch references
    const mainBranchId = new mongoose.Types.ObjectId('6899e6f1261ba5a6420501f7');
    const northBranchId = new mongoose.Types.ObjectId('6899e6f1261ba5a6420501f8');
    const southBranchId = new mongoose.Types.ObjectId('6899e6f1261ba5a6420501f9');
    
    // Main Rice Mill
    const mainBranch = await Branch.findOneAndUpdate(
      { millCode: 'MRM001' },
      {
        _id: mainBranchId,
        name: 'Main Rice Mill',
        millCode: 'MRM001',
        gstn: '33AABCM1234A1Z5',
        address: {
          region: 'Chennai, Tamil Nadu',
          type: 'RR'
        },
        contactInfo: {
          phone: '+91-44-12345678',
          email: 'main@ricemill.com'
        },
        manager: superadmin._id,
        isActive: true
      },
      { upsert: true, new: true }
    );
    branches.push(mainBranch);
    
    // North Branch
    const northBranch = await Branch.findOneAndUpdate(
      { millCode: 'NRB002' },
      {
        _id: northBranchId,
        name: 'North Branch',
        millCode: 'NRB002',
        gstn: '33AABCN1234A1Z6',
        address: {
          region: 'Coimbatore, Tamil Nadu',
          type: 'BR'
        },
        contactInfo: {
          phone: '+91-422-9876543',
          email: 'north@ricemill.com'
        },
        manager: superadmin._id,
        isActive: true
      },
      { upsert: true, new: true }
    );
    branches.push(northBranch);
    
    // South Branch
    const southBranch = await Branch.findOneAndUpdate(
      { millCode: 'SRB003' },
      {
        _id: southBranchId,
        name: 'South Branch',
        millCode: 'SRB003',
        gstn: '33AABCS1234A1Z7',
        address: {
          region: 'Madurai, Tamil Nadu',
          type: 'BR'
        },
        contactInfo: {
          phone: '+91-452-4567890',
          email: 'south@ricemill.com'
        },
        manager: superadmin._id,
        isActive: true
      },
      { upsert: true, new: true }
    );
    branches.push(southBranch);
    
    console.log('✅ Branches created/updated:', branches.length);
    console.log('📍 Branch IDs for reference:');
    console.log(`   Main Branch: ${mainBranch._id}`);
    console.log(`   North Branch: ${northBranch._id}`);
    console.log(`   South Branch: ${southBranch._id}`);
    
    // Create Regular Users
    console.log('👥 Creating Regular Users...');
    const users = await User.create([
      {
        name: 'Branch Manager 1',
        email: 'manager1@ricemill.com',
        password: 'manager123',
        role: 'manager',
        branch_id: branches[0]._id,
        phone: '+91-9876543210',
        isActive: true
      },
      {
        name: 'Branch Manager 2',
        email: 'manager2@ricemill.com',
        password: 'manager123',
        role: 'manager',
        branch_id: branches[1]._id,
        phone: '+91-9876543211',
        isActive: true
      },
      {
        name: 'Operator 1',
        email: 'operator1@ricemill.com',
        password: 'operator123',
        role: 'manager',
        branch_id: branches[0]._id,
        phone: '+91-9876543212',
        isActive: true
      }
    ]);
    console.log('✅ Users created:', users.length);
    
    // Create Bag Weight Options
    console.log('⚖️ Creating Bag Weight Options...');
    const bagWeights = await BagWeightOption.create([
      {
        weight: 25,
        label: '25 kg',
        isActive: true,
        branch_id: branches[0]._id,
        createdBy: superadmin._id
      },
      {
        weight: 50,
        label: '50 kg',
        isActive: true,
        branch_id: branches[0]._id,
        createdBy: superadmin._id
      },
      {
        weight: 100,
        label: '100 kg',
        isActive: true,
        branch_id: branches[0]._id,
        createdBy: superadmin._id
      }
    ]);
    console.log('✅ Bag Weight Options created:', bagWeights.length);
    
    // Create Paddy Entries
    console.log('🌾 Creating Paddy Entries...');
    const paddyEntries = await Paddy.create([
      {
        issueDate: new Date('2024-01-15'),
        issueMemo: 'PM-001-2024',
        lorryNumber: 'TN-01-AB-1234',
        paddyFrom: 'Local Farmers',
        paddyVariety: 'A',
        moisture: 12.5,
        gunny: {
          nb: 180,
          onb: 15,
          ss: 5,
          swp: 0
        },
        paddy: {
          bags: 200,
          weight: 5000
        },
        bagWeight: 25,
        branch_id: branches[0]._id,
        createdBy: users[0]._id
      },
      {
        issueDate: new Date('2024-01-20'),
        issueMemo: 'PM-002-2024',
        lorryNumber: 'TN-02-CD-5678',
        paddyFrom: 'Traders',
        paddyVariety: 'C',
        moisture: 11.8,
        gunny: {
          nb: 110,
          onb: 8,
          ss: 2,
          swp: 0
        },
        paddy: {
          bags: 120,
          weight: 3000
        },
        bagWeight: 25,
        branch_id: branches[1]._id,
        createdBy: users[1]._id
      },
      {
        issueDate: new Date('2024-01-25'),
        issueMemo: 'PM-003-2024',
        lorryNumber: 'TN-03-EF-9012',
        paddyFrom: 'Cooperative Societies',
        paddyVariety: 'A',
        moisture: 13.2,
        gunny: {
          nb: 150,
          onb: 8,
          ss: 2,
          swp: 0
        },
        paddy: {
          bags: 160,
          weight: 4000
        },
        bagWeight: 25,
        branch_id: branches[2]._id,
        createdBy: superadmin._id
      }
    ]);
    console.log('✅ Paddy Entries created:', paddyEntries.length);
    
    // Create Production Entries
    console.log('🏭 Creating Production Entries...');
    const productionEntries = await Production.create([
      {
        name: 'Sona Masoori Rice',
        description: 'Premium quality sona masoori rice production',
        quantity: 3500,
        unit: 'kg',
        productionDate: new Date('2024-01-16'),
        quality: 'Excellent',
        status: 'Completed',
        operator: 'Operator 1',
        notes: 'Excellent quality output',
        branch_id: branches[0]._id,
        createdBy: users[2]._id
      },
      {
        name: 'Basmati Rice',
        description: 'Premium basmati rice production',
        quantity: 2100,
        unit: 'kg',
        productionDate: new Date('2024-01-21'),
        quality: 'Excellent',
        status: 'Completed',
        operator: 'Operator 2',
        notes: 'High-grade basmati rice',
        branch_id: branches[1]._id,
        createdBy: users[1]._id
      },
      {
        name: 'Ponni Rice',
        description: 'Standard ponni rice production',
        quantity: 2800,
        unit: 'kg',
        productionDate: new Date('2024-01-26'),
        quality: 'Good',
        status: 'In Progress',
        operator: 'Operator 3',
        notes: 'Good quality ponni rice',
        branch_id: branches[2]._id,
        createdBy: superadmin._id
      }
    ]);
    console.log('✅ Production Entries created:', productionEntries.length);
    
    // Create Gunny Entries
    console.log('🧺 Creating Gunny Entries...');
    const gunnyEntries = await Gunny.create([
      {
        issueDate: new Date('2024-01-15'),
        issueMemo: 'GM-001-2024',
        lorryNumber: 'TN-01-AB-1234',
        paddyFrom: 'Local Farmers',
        paddyVariety: 'A',
        gunny: {
          nb: 180,
          onb: 15,
          ss: 5,
          swp: 0
        },
        paddy: {
          bags: 200,
          weight: 5000
        },
        branch_id: branches[0]._id,
        createdBy: users[0]._id
      },
      {
        issueDate: new Date('2024-01-20'),
        issueMemo: 'GM-002-2024',
        lorryNumber: 'TN-02-CD-5678',
        paddyFrom: 'Traders',
        paddyVariety: 'C',
        gunny: {
          nb: 110,
          onb: 8,
          ss: 2,
          swp: 0
        },
        paddy: {
          bags: 120,
          weight: 3000
        },
        branch_id: branches[1]._id,
        createdBy: users[1]._id
      },
      {
        issueDate: new Date('2024-01-25'),
        issueMemo: 'GM-003-2024',
        lorryNumber: 'TN-03-EF-9012',
        paddyFrom: 'Cooperative Societies',
        paddyVariety: 'A',
        gunny: {
          nb: 150,
          onb: 8,
          ss: 2,
          swp: 0
        },
        paddy: {
          bags: 160,
          weight: 4000
        },
        branch_id: branches[2]._id,
        createdBy: superadmin._id
      }
    ]);
    console.log('✅ Gunny Entries created:', gunnyEntries.length);
    
    // Create Inventory Entries
    console.log('📦 Creating Inventory Entries...');
    const inventoryEntries = await Inventory.create([
      {
        name: 'Sona Masoori Rice',
        quantity: 3500,
        description: 'Premium quality rice from internal production',
        branch_id: branches[0]._id,
        created_by: users[0]._id
      },
      {
        name: 'Basmati Rice',
        quantity: 2100,
        description: 'Premium basmati rice from internal production',
        branch_id: branches[1]._id,
        created_by: users[1]._id
      },
      {
        name: 'Gunny Bags',
        quantity: 500,
        description: '25kg capacity bags for packaging',
        branch_id: branches[0]._id,
        created_by: users[0]._id
      }
    ]);
    console.log('✅ Inventory Entries created:', inventoryEntries.length);
    
    // Create Rice Deposit Entries
    console.log('🍚 Creating Rice Deposit Entries...');
    const riceDeposits = await RiceDeposit.create([
      {
        date: new Date('2024-01-18'),
        truckMemo: 'TM-001-2024',
        lorryNumber: 'TN-01-GH-3456',
        depositGodown: 'Godown A',
        variety: 'Sona Masoori',
        godownDate: new Date('2024-01-18'),
        ackNo: 'ACK-001-2024',
        riceBag: 40,
        riceBagFrk: 0,
        depositWeight: 1000,
        depositWeightFrk: 0,
        totalRiceDeposit: 1000,
        moisture: 12.5,
        sampleNumber: 'SAMPLE-001',
        gunny: {
          onb: 35,
          ss: 5,
          swp: 0
        },
        gunnyUsedFromPaddy: {
          nb: 35,
          onb: 5,
          ss: 0,
          swp: 0
        },
        gunnyBags: 40,
        gunnyWeight: 100,
        paddyReference: paddyEntries[0]._id,
        branch_id: branches[0]._id,
        createdBy: users[0]._id
      },
      {
        date: new Date('2024-01-22'),
        truckMemo: 'TM-002-2024',
        lorryNumber: 'TN-02-IJ-7890',
        depositGodown: 'Godown B',
        variety: 'Basmati',
        godownDate: new Date('2024-01-22'),
        ackNo: 'ACK-002-2024',
        riceBag: 20,
        riceBagFrk: 0,
        depositWeight: 500,
        depositWeightFrk: 0,
        totalRiceDeposit: 500,
        moisture: 11.8,
        sampleNumber: 'SAMPLE-002',
        gunny: {
          onb: 18,
          ss: 2,
          swp: 0
        },
        gunnyUsedFromPaddy: {
          nb: 18,
          onb: 2,
          ss: 0,
          swp: 0
        },
        gunnyBags: 20,
        gunnyWeight: 50,
        paddyReference: paddyEntries[1]._id,
        branch_id: branches[1]._id,
        createdBy: users[1]._id
      }
    ]);
    console.log('✅ Rice Deposit Entries created:', riceDeposits.length);
    
    console.log('\n🎉 All modules seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Superadmin: 1`);
    console.log(`- Branches: ${branches.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Bag Weight Options: ${bagWeights.length}`);
    console.log(`- Paddy Entries: ${paddyEntries.length}`);
    console.log(`- Production Entries: ${productionEntries.length}`);
    console.log(`- Gunny Entries: ${gunnyEntries.length}`);
    console.log(`- Inventory Entries: ${inventoryEntries.length}`);
    console.log(`- Rice Deposit Entries: ${riceDeposits.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Superadmin: superadmin@ricemill.com / superadmin123');
    console.log('Manager 1: manager1@ricemill.com / manager123');
    console.log('Manager 2: manager2@ricemill.com / manager123');
    console.log('Operator 1: operator1@ricemill.com / operator123');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
});