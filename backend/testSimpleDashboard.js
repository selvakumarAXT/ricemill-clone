const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

const testSimpleDashboard = async () => {
  try {
    console.log('🧪 Testing Simple Dashboard Access...\n');

    // Step 1: Login as superadmin
    console.log('1️⃣ Logging in as superadmin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'superadmin@ricemill.com',
      password: 'superadmin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Test basic endpoints first
    console.log('2️⃣ Testing basic endpoints...');
    
    // Test paddy endpoint
    try {
      const paddyResponse = await axios.get(`${API_URL}/paddy`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Paddy endpoint working');
    } catch (error) {
      console.log('❌ Paddy endpoint error:', error.response?.data?.message || error.message);
    }

    // Test production endpoint
    try {
      const productionResponse = await axios.get(`${API_URL}/production`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Production endpoint working');
    } catch (error) {
      console.log('❌ Production endpoint error:', error.response?.data?.message || error.message);
    }

    // Test gunny endpoint
    try {
      const gunnyResponse = await axios.get(`${API_URL}/gunny`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Gunny endpoint working');
    } catch (error) {
      console.log('❌ Gunny endpoint error:', error.response?.data?.message || error.message);
    }

    // Test inventory endpoint
    try {
      const inventoryResponse = await axios.get(`${API_URL}/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Inventory endpoint working');
    } catch (error) {
      console.log('❌ Inventory endpoint error:', error.response?.data?.message || error.message);
    }

    // Step 3: Test dashboard endpoint
    console.log('\n3️⃣ Testing dashboard endpoint...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/dashboard/superadmin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('✅ Dashboard endpoint working!');
      console.log('   Data received:', Object.keys(dashboardResponse.data.data));
    } catch (error) {
      console.log('❌ Dashboard endpoint error:', error.response?.data?.message || error.message);
      if (error.response?.data?.stack) {
        console.log('   Stack trace:', error.response.data.stack);
      }
    }

  } catch (error) {
    console.error('❌ Error in test:', error.response?.data || error.message);
  }
};

// Run the test
testSimpleDashboard(); 