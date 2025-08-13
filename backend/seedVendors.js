const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vendor = require('./models/Vendor');
const Branch = require('./models/Branch');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Sample vendor data
const sampleVendors = [
  {
    vendorCode: 'V001',
    vendorName: 'ABC Rice Suppliers',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'rajesh@abcrice.com',
    address: '123 Rice Market, Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    gstNumber: '27ABCDE1234F1Z5',
    panNumber: 'ABCDE1234F',
    vendorType: 'supplier',
    creditLimit: 500000,
    paymentTerms: '30_days',
    rating: 4,
    status: 'active',
    remarks: 'Reliable supplier with good quality rice',
    totalOrders: 45,
    totalAmount: 2500000,
    totalPaid: 2000000,
    totalDue: 500000,
    outstandingBalance: 500000,
    lastOrderDate: new Date('2024-01-15'),
    lastPaymentDate: new Date('2024-01-10')
  },
  {
    vendorCode: 'V002',
    vendorName: 'XYZ Grain Traders',
    contactPerson: 'Priya Sharma',
    phone: '+91 8765432109',
    email: 'priya@xyzgrains.com',
    address: '456 Grain Market, Industrial Area',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    gstNumber: '07FGHIJ5678G2Z6',
    panNumber: 'FGHIJ5678G',
    vendorType: 'supplier',
    creditLimit: 300000,
    paymentTerms: '15_days',
    rating: 3,
    status: 'active',
    remarks: 'Good quality grains, timely delivery',
    totalOrders: 32,
    totalAmount: 1800000,
    totalPaid: 1500000,
    totalDue: 300000,
    outstandingBalance: 300000,
    lastOrderDate: new Date('2024-01-10'),
    lastPaymentDate: new Date('2024-01-05')
  },
  {
    vendorCode: 'V003',
    vendorName: 'PQR Equipment Solutions',
    contactPerson: 'Amit Patel',
    phone: '+91 7654321098',
    email: 'amit@pqrequipment.com',
    address: '789 Industrial Estate, Tech Park',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    gstNumber: '29KLMNO9012H3Z7',
    panNumber: 'KLMNO9012H',
    vendorType: 'service_provider',
    creditLimit: 200000,
    paymentTerms: 'immediate',
    rating: 5,
    status: 'active',
    remarks: 'Excellent service provider for equipment maintenance',
    totalOrders: 15,
    totalAmount: 800000,
    totalPaid: 800000,
    totalDue: 0,
    outstandingBalance: 0,
    lastOrderDate: new Date('2024-01-12'),
    lastPaymentDate: new Date('2024-01-12')
  },
  {
    vendorCode: 'V004',
    vendorName: 'LMN Transport Services',
    contactPerson: 'Suresh Reddy',
    phone: '+91 6543210987',
    email: 'suresh@lmntransport.com',
    address: '321 Transport Hub, Highway Road',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    gstNumber: '36OPQRS3456I4Z8',
    panNumber: 'OPQRS3456I',
    vendorType: 'contractor',
    creditLimit: 150000,
    paymentTerms: '7_days',
    rating: 4,
    status: 'active',
    remarks: 'Reliable transport contractor for rice delivery',
    totalOrders: 28,
    totalAmount: 1200000,
    totalPaid: 1100000,
    totalDue: 100000,
    outstandingBalance: 100000,
    lastOrderDate: new Date('2024-01-08'),
    lastPaymentDate: new Date('2024-01-01')
  },
  {
    vendorCode: 'V005',
    vendorName: 'STU Packaging Solutions',
    contactPerson: 'Neha Singh',
    phone: '+91 5432109876',
    email: 'neha@stupackaging.com',
    address: '654 Packaging Zone, Industrial Area',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600001',
    gstNumber: '33TUVWX7890J5Z9',
    panNumber: 'TUVWX7890J',
    vendorType: 'supplier',
    creditLimit: 400000,
    paymentTerms: '30_days',
    rating: 4,
    status: 'active',
    remarks: 'Quality packaging materials supplier',
    totalOrders: 38,
    totalAmount: 2200000,
    totalPaid: 2000000,
    totalDue: 200000,
    outstandingBalance: 200000,
    lastOrderDate: new Date('2024-01-14'),
    lastPaymentDate: new Date('2024-01-01')
  }
];

// Seed vendors function
const seedVendors = async () => {
  try {
    console.log('🌱 Starting vendor seeding...');
    
    // Get the first branch and user for seeding
    const branch = await Branch.findOne();
    const user = await User.findOne();
    
    if (!branch) {
      console.error('❌ No branch found. Please create a branch first.');
      return;
    }
    
    if (!user) {
      console.error('❌ No user found. Please create a user first.');
      return;
    }
    
    console.log(`📍 Using branch: ${branch.name} (${branch._id})`);
    console.log(`👤 Using user: ${user.name} (${user._id})`);
    
    // Clear existing vendors
    await Vendor.deleteMany({});
    console.log('🗑️ Cleared existing vendors');
    
    // Add branch_id and createdBy to each vendor
    const vendorsWithContext = sampleVendors.map(vendor => ({
      ...vendor,
      branch_id: branch._id,
      createdBy: user._id
    }));
    
    // Insert vendors
    const insertedVendors = await Vendor.insertMany(vendorsWithContext);
    console.log(`✅ Successfully seeded ${insertedVendors.length} vendors`);
    
    // Display seeded vendors
    console.log('\n📋 Seeded Vendors:');
    insertedVendors.forEach(vendor => {
      console.log(`  - ${vendor.vendorCode}: ${vendor.vendorName} (${vendor.vendorType})`);
    });
    
    console.log('\n🎉 Vendor seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding vendors:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding
if (require.main === module) {
  connectDB().then(() => {
    seedVendors();
  });
}

module.exports = { seedVendors };
