const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const users = [
  {
    name: 'Admin User',
    email: 'admin@ricemill.com',
    password: 'Admin123!',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Manager One',
    email: 'manager1@ricemill.com',
    password: 'Manager123!',
    role: 'manager',
    isActive: true
  },
  {
    name: 'Manager Two',
    email: 'manager2@ricemill.com',
    password: 'Manager123!',
    role: 'manager',
    isActive: true
  },
  {
    name: 'Employee One',
    email: 'employee1@ricemill.com',
    password: 'Employee123!',
    role: 'employee',
    isActive: true
  },
  {
    name: 'Employee Two',
    email: 'employee2@ricemill.com',
    password: 'Employee123!',
    role: 'employee',
    isActive: true
  },
  {
    name: 'Employee Three',
    email: 'employee3@ricemill.com',
    password: 'Employee123!',
    role: 'employee',
    isActive: true
  },
  {
    name: 'John Doe',
    email: 'john.doe@ricemill.com',
    password: 'John123!',
    role: 'employee',
    isActive: true
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@ricemill.com',
    password: 'Jane123!',
    role: 'manager',
    isActive: true
  },
  {
    name: 'Test Admin',
    email: 'testadmin@ricemill.com',
    password: 'TestAdmin123!',
    role: 'admin',
    isActive: true
  },
  {
    name: 'Inactive User',
    email: 'inactive@ricemill.com',
    password: 'Inactive123!',
    role: 'employee',
    isActive: false
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Cleared existing users');

    // Create users
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n🌱 Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('====================');
    
    // Display login credentials
    users.forEach(user => {
      console.log(`\n${user.role.toUpperCase()} - ${user.name}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Status: ${user.isActive ? 'Active' : 'Inactive'}`);
    });

    console.log('\n✨ You can now login with any of these credentials!');
    
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Add confirmation prompt
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  WARNING: This will delete all existing users in the database!');
rl.question('Are you sure you want to continue? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    rl.close();
    seedDatabase();
  } else {
    console.log('❌ Seed operation cancelled.');
    rl.close();
    process.exit();
  }
}); 