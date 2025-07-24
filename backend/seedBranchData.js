const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Branch = require('./models/Branch');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Sample branches data
const branches = [
  {
    name: 'Main Branch - Mumbai',
    code: 'MUM001',
    address: {
      street: '123 Rice Mill Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    contactInfo: {
      phone: '+91-9876543210',
      email: 'mumbai@ricemill.com'
    },
    settings: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      operatingHours: {
        start: '08:00',
        end: '20:00'
      }
    }
  },
  {
    name: 'Branch - Delhi',
    code: 'DEL001',
    address: {
      street: '456 Industrial Area',
      city: 'New Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    contactInfo: {
      phone: '+91-9876543211',
      email: 'delhi@ricemill.com'
    },
    settings: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      operatingHours: {
        start: '09:00',
        end: '18:00'
      }
    }
  },
  {
    name: 'Branch - Bangalore',
    code: 'BLR001',
    address: {
      street: '789 Tech Park',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    contactInfo: {
      phone: '+91-9876543212',
      email: 'bangalore@ricemill.com'
    },
    settings: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      operatingHours: {
        start: '08:30',
        end: '19:00'
      }
    }
  }
];

// Updated users with super admin and branch assignments
const users = [
  // Super Admin
  {
    name: 'Super Admin',
    email: 'superadmin@ricemill.com',
    password: 'SuperAdmin123!',
    role: 'superadmin',
    isSuperAdmin: true,
    branch_id: null
  },
  // Mumbai Branch
  {
    name: 'Mumbai Branch Admin',
    email: 'admin@ricemill.com',
    password: 'Admin123!',
    role: 'admin',
    branchCode: 'MUM001'
  },
  {
    name: 'Mumbai Accountant',
    email: 'accountant@ricemill.com',
    password: 'Accountant123!',
    role: 'accountant',
    branchCode: 'MUM001'
  },
  {
    name: 'Mumbai QC Officer',
    email: 'qc@ricemill.com',
    password: 'QC123!',
    role: 'qc',
    branchCode: 'MUM001'
  },
  {
    name: 'Mumbai Sales Staff',
    email: 'sales@ricemill.com',
    password: 'Sales123!',
    role: 'sales',
    branchCode: 'MUM001'
  },
  // Delhi Branch
  {
    name: 'Delhi Branch Admin',
    email: 'admin.delhi@ricemill.com',
    password: 'Admin123!',
    role: 'admin',
    branchCode: 'DEL001'
  },
  {
    name: 'Delhi Accountant',
    email: 'accountant.delhi@ricemill.com',
    password: 'Accountant123!',
    role: 'accountant',
    branchCode: 'DEL001'
  },
  {
    name: 'Delhi QC Officer',
    email: 'qc.delhi@ricemill.com',
    password: 'QC123!',
    role: 'qc',
    branchCode: 'DEL001'
  },
  {
    name: 'Delhi Sales Staff',
    email: 'sales.delhi@ricemill.com',
    password: 'Sales123!',
    role: 'sales',
    branchCode: 'DEL001'
  },
  // Bangalore Branch
  {
    name: 'Bangalore Branch Admin',
    email: 'admin.blr@ricemill.com',
    password: 'Admin123!',
    role: 'admin',
    branchCode: 'BLR001'
  },
  {
    name: 'Bangalore Accountant',
    email: 'accountant.blr@ricemill.com',
    password: 'Accountant123!',
    role: 'accountant',
    branchCode: 'BLR001'
  },
  {
    name: 'Bangalore QC Officer',
    email: 'qc.blr@ricemill.com',
    password: 'QC123!',
    role: 'qc',
    branchCode: 'BLR001'
  },
  {
    name: 'Bangalore Sales Staff',
    email: 'sales.blr@ricemill.com',
    password: 'Sales123!',
    role: 'sales',
    branchCode: 'BLR001'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🔄 Starting branch and user seeding...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Branch.deleteMany({});
    await User.deleteMany({});

    // Create branches
    console.log('🏢 Creating branches...');
    const createdBranches = await Branch.create(branches);
    console.log(`✅ Created ${createdBranches.length} branches`);

    // Create branch map for quick lookup
    const branchMap = {};
    createdBranches.forEach(branch => {
      branchMap[branch.code] = branch._id;
    });

    // Process users and assign branch_id
    const usersToCreate = [];
    for (const userData of users) {
      const { branchCode, ...userFields } = userData;
      
      // Don't hash password here - let the User model's pre-save hook handle it
      
      // Assign branch_id if not super admin
      if (!userFields.isSuperAdmin && branchCode) {
        userFields.branch_id = branchMap[branchCode];
      }
      
      usersToCreate.push(userFields);
    }

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(usersToCreate);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Assign managers to branches
    console.log('👔 Assigning branch managers...');
    for (const branch of createdBranches) {
      // Find admin/manager for this branch
      const branchAdmin = createdUsers.find(user => 
        user.branch_id && 
        user.branch_id.toString() === branch._id.toString() && 
        (user.role === 'admin' || user.role === 'manager')
      );
      
      if (branchAdmin) {
        await Branch.findByIdAndUpdate(branch._id, { manager: branchAdmin._id });
        console.log(`✅ Assigned ${branchAdmin.name} as manager of ${branch.name}`);
      }
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Super Admin: superadmin@ricemill.com / SuperAdmin123!');
    console.log('Mumbai Admin: admin@ricemill.com / Admin123!');
    console.log('Mumbai Manager: manager1@ricemill.com / Manager123!');
    console.log('Mumbai Employee: employee1@ricemill.com / Employee123!');
    console.log('Delhi Admin: admin.delhi@ricemill.com / Admin123!');
    console.log('Delhi Manager: manager.delhi@ricemill.com / Manager123!');
    console.log('Bangalore Admin: admin.blr@ricemill.com / Admin123!');
    
    console.log('\n🏢 Branches Created:');
    createdBranches.forEach(branch => {
      console.log(`- ${branch.name} (${branch.code})`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  WARNING: This will delete all existing users and branches in the database!');
rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    seedDatabase().then(() => {
      rl.close();
      process.exit(0);
    });
  } else {
    console.log('❌ Seeding cancelled');
    rl.close();
    process.exit(0);
  }
}); 