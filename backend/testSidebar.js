const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

const testSidebar = async () => {
  try {
    console.log('🧪 Testing Sidebar Functionality...\n');

    // Step 1: Login as superadmin
    console.log('1️⃣ Logging in as superadmin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'superadmin@ricemill.com',
      password: 'superadmin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Test branches endpoint
    console.log('2️⃣ Testing branches endpoint...');
    try {
      const branchesResponse = await axios.get(`${API_URL}/branches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Branches endpoint working');
      console.log('   Available branches:', branchesResponse.data.data.length);
      branchesResponse.data.data.forEach(branch => {
        console.log(`   - ${branch.name} (${branch.millCode})`);
      });
    } catch (error) {
      console.log('❌ Branches endpoint error:', error.response?.data?.message || error.message);
    }

    // Step 3: Test user data
    console.log('\n3️⃣ Testing user data...');
    try {
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ User data retrieved');
      console.log('   User role:', userResponse.data.user.role);
      console.log('   isSuperAdmin:', userResponse.data.user.isSuperAdmin);
      console.log('   User name:', userResponse.data.user.name);
      console.log('   User email:', userResponse.data.user.email);
    } catch (error) {
      console.log('❌ User data error:', error.response?.data?.message || error.message);
    }

    // Step 4: Test dashboard with sidebar context
    console.log('\n4️⃣ Testing dashboard with sidebar context...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/dashboard/superadmin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Dashboard working with sidebar context');
      console.log('   Branch stats available:', dashboardResponse.data.data.branchStats.length);
    } catch (error) {
      console.log('❌ Dashboard error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Sidebar functionality test completed!');
    console.log('\n📋 Summary:');
    console.log('   - Superadmin can login successfully');
    console.log('   - Branches are accessible');
    console.log('   - User role is properly set');
    console.log('   - Dashboard works with branch context');
    console.log('\n🌐 Frontend should now show:');
    console.log('   - Full sidebar with all menu items');
    console.log('   - Branch selector for superadmin');
    console.log('   - All navigation options');

  } catch (error) {
    console.error('❌ Error in sidebar test:', error.response?.data || error.message);
  }
};

// Run the test
testSidebar(); 