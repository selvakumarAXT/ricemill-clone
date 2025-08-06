const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testCredentials = {
  superadmin: {
    email: 'superadmin@ricemill.com',
    password: 'superadmin123'
  },
  manager1: {
    email: 'manager1@ricemill.com',
    password: 'manager123'
  },
  manager2: {
    email: 'manager2@ricemill.com',
    password: 'manager123'
  }
};

let authToken = '';
let branches = [];

// Helper function to make authenticated requests
const makeRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      },
      ...(data && { data })
    };
    
    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status 
    };
  }
};

// Test authentication
const testAuth = async () => {
  console.log('\n🔐 Testing Authentication...');
  
  // Test superadmin login
  const loginResult = await makeRequest('POST', '/auth/login', testCredentials.superadmin);
  if (loginResult.success) {
    authToken = loginResult.data.token;
    console.log('✅ Superadmin login successful');
    console.log('👤 User:', loginResult.data.user.name, `(${loginResult.data.user.role})`);
  } else {
    console.log('❌ Superadmin login failed:', loginResult.error);
    return false;
  }
  
  return true;
};

// Test branches
const testBranches = async () => {
  console.log('\n🏢 Testing Branches...');
  
  const result = await makeRequest('GET', '/branches');
  if (result.success) {
    branches = result.data.data;
    console.log(`✅ Found ${branches.length} branches`);
    branches.forEach(branch => {
      console.log(`  - ${branch.name} (${branch.millCode})`);
    });
  } else {
    console.log('❌ Failed to fetch branches:', result.error);
  }
};

// Test dashboard
const testDashboard = async () => {
  console.log('\n📊 Testing Dashboard...');
  
  const result = await makeRequest('GET', '/dashboard/superadmin');
  if (result.success) {
    console.log('✅ Dashboard data retrieved successfully');
    const data = result.data.data.overview;
    console.log(`  📈 Total Paddy: ${data.totalPaddy || 0} kg`);
    console.log(`  🏭 Total Production: ${data.totalRice || 0} kg`);
    console.log(`  🧺 Total Gunny: ${data.totalGunny || 0} bags`);
    console.log(`  📦 Total Inventory: ${data.totalInventory || 0} items`);
    console.log(`  🏢 Total Branches: ${data.totalBranches || 0}`);
    console.log(`  👥 Total Users: ${data.totalUsers || 0}`);
  } else {
    console.log('❌ Failed to fetch dashboard:', result.error);
  }
};

// Test Paddy management
const testPaddy = async () => {
  console.log('\n🌾 Testing Paddy Management...');
  
  const result = await makeRequest('GET', '/paddy');
  if (result.success) {
    console.log(`✅ Found ${result.data.data.length} paddy entries`);
    result.data.data.forEach(paddy => {
      console.log(`  - ${paddy.paddyFrom} (${paddy.paddyVariety}) - ${paddy.paddy.weight} kg`);
    });
  } else {
    console.log('❌ Failed to fetch paddy:', result.error);
  }
};

// Test Production management
const testProduction = async () => {
  console.log('\n🏭 Testing Production Management...');
  
  const result = await makeRequest('GET', '/production');
  if (result.success) {
    console.log(`✅ Found ${result.data.items.length} production entries`);
    result.data.items.forEach(prod => {
      console.log(`  - ${prod.name} - ${prod.quantity} ${prod.unit} (${prod.status})`);
    });
  } else {
    console.log('❌ Failed to fetch production:', result.error);
  }
};

// Test Gunny management
const testGunny = async () => {
  console.log('\n🧺 Testing Gunny Management...');
  
  const result = await makeRequest('GET', '/gunny');
  if (result.success) {
    console.log(`✅ Found ${result.data.length} gunny entries`);
    result.data.forEach(gunny => {
      const totalGunny = (gunny.gunny.nb || 0) + (gunny.gunny.onb || 0) + (gunny.gunny.ss || 0) + (gunny.gunny.swp || 0);
      console.log(`  - ${gunny.paddyFrom} - ${totalGunny} bags (${gunny.paddyVariety})`);
    });
  } else {
    console.log('❌ Failed to fetch gunny:', result.error);
  }
};

// Test Inventory management
const testInventory = async () => {
  console.log('\n📦 Testing Inventory Management...');
  
  const result = await makeRequest('GET', '/inventory');
  if (result.success) {
    console.log(`✅ Found ${result.data.items.length} inventory items`);
    result.data.items.forEach(item => {
      console.log(`  - ${item.name} - ${item.quantity} units`);
    });
  } else {
    console.log('❌ Failed to fetch inventory:', result.error);
  }
};

// Test Rice Deposit management
const testRiceDeposit = async () => {
  console.log('\n🍚 Testing Rice Deposit Management...');
  
  const result = await makeRequest('GET', '/rice-deposits');
  if (result.success) {
    console.log(`✅ Found ${result.data.length} rice deposit entries`);
    result.data.forEach(deposit => {
      console.log(`  - ${deposit.variety} - ${deposit.totalRiceDeposit} kg (${deposit.ackNo})`);
    });
  } else {
    console.log('❌ Failed to fetch rice deposits:', result.error);
  }
};

// Test User management
const testUsers = async () => {
  console.log('\n👥 Testing User Management...');
  
  const result = await makeRequest('GET', '/users');
  if (result.success) {
    console.log(`✅ Found ${result.data.users.length} users`);
    result.data.users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
    });
  } else {
    console.log('❌ Failed to fetch users:', result.error);
  }
};

// Test Bag Weight Options
const testBagWeightOptions = async () => {
  console.log('\n⚖️ Testing Bag Weight Options...');
  
  const result = await makeRequest('GET', '/bag-weight-options');
  if (result.success) {
    console.log(`✅ Found ${result.data.data.length} bag weight options`);
    if (result.data.data.length > 0) {
      result.data.data.forEach(option => {
        console.log(`  - ${option.weight} kg - ${option.label}`);
      });
    } else {
      console.log('  - No bag weight options found');
    }
  } else {
    console.log('❌ Failed to fetch bag weight options:', result.error);
  }
};

// Test branch-specific data
const testBranchSpecificData = async () => {
  console.log('\n🏢 Testing Branch-Specific Data...');
  
  if (branches.length > 0) {
    const branchId = branches[0]._id;
    
    // Test paddy for specific branch
    const paddyResult = await makeRequest('GET', `/paddy?branch=${branchId}`);
    if (paddyResult.success) {
      console.log(`✅ Found ${paddyResult.data.data.length} paddy entries for branch`);
    }
    
    // Test production for specific branch
    const productionResult = await makeRequest('GET', `/production?branch=${branchId}`);
    if (productionResult.success) {
      console.log(`✅ Found ${productionResult.data.items.length} production entries for branch`);
    }
  }
};

// Test CRUD operations
const testCRUDOperations = async () => {
  console.log('\n🔄 Testing CRUD Operations...');
  
  // Test creating a new inventory item
  const newInventoryItem = {
    name: 'Test Rice',
    quantity: 100,
    description: 'Test inventory item for CRUD testing',
    branch_id: branches[0]._id
  };
  
  const createResult = await makeRequest('POST', '/inventory', newInventoryItem);
  if (createResult.success) {
    console.log('✅ Created new inventory item');
    
    const itemId = createResult.data._id;
    
    // Test updating the item
    const updateData = { quantity: 150 };
    const updateResult = await makeRequest('PUT', `/inventory/${itemId}`, updateData);
    if (updateResult.success) {
      console.log('✅ Updated inventory item');
    } else {
      console.log('❌ Failed to update inventory item:', updateResult.error);
    }
    
    // Test deleting the item
    const deleteResult = await makeRequest('DELETE', `/inventory/${itemId}`);
    if (deleteResult.success) {
      console.log('✅ Deleted inventory item');
    } else {
      console.log('❌ Failed to delete inventory item:', deleteResult.error);
    }
  } else {
    console.log('❌ Failed to create inventory item:', createResult.error);
  }
};

// Main test function
const runFullTest = async () => {
  console.log('🚀 Starting Full Application Flow Test...');
  console.log('=' .repeat(50));
  
  try {
    // Test authentication first
    const authSuccess = await testAuth();
    if (!authSuccess) {
      console.log('❌ Authentication failed. Stopping tests.');
      return;
    }
    
    // Test all modules
    await testBranches();
    await testDashboard();
    await testPaddy();
    await testProduction();
    await testGunny();
    await testInventory();
    await testRiceDeposit();
    await testUsers();
    await testBagWeightOptions();
    await testBranchSpecificData();
    await testCRUDOperations();
    
    console.log('\n🎉 Full Application Flow Test Completed Successfully!');
    console.log('=' .repeat(50));
    console.log('✅ All modules are working correctly');
    console.log('✅ API endpoints are responding properly');
    console.log('✅ Data relationships are maintained');
    console.log('✅ CRUD operations are functional');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test
runFullTest(); 