const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

const testDashboard = async () => {
  try {
    console.log('🧪 Testing Dashboard Access...\n');

    // Step 1: Login as superadmin
    console.log('1️⃣ Logging in as superadmin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'superadmin@ricemill.com',
      password: 'superadmin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Test superadmin dashboard
    console.log('2️⃣ Testing superadmin dashboard...');
    const dashboardResponse = await axios.get(`${API_URL}/dashboard/superadmin`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Dashboard data retrieved successfully!');
    console.log('\n📊 Dashboard Overview:');
    console.log('   Total Paddy:', dashboardResponse.data.data.overview.totalPaddy, 'kg');
    console.log('   Total Rice:', dashboardResponse.data.data.overview.totalRice, 'kg');
    console.log('   Total Gunny:', dashboardResponse.data.data.overview.totalGunny, 'bags');
    console.log('   Total Revenue:', dashboardResponse.data.data.overview.totalRevenue);
    console.log('   Net Profit:', dashboardResponse.data.data.overview.profit);
    console.log('   Efficiency:', dashboardResponse.data.data.overview.efficiency, '%');
    console.log('   Quality Score:', dashboardResponse.data.data.overview.qualityScore);
    console.log('   Total Branches:', dashboardResponse.data.data.overview.totalBranches);
    console.log('   Total Users:', dashboardResponse.data.data.overview.totalUsers);

    console.log('\n📈 Growth Metrics:');
    console.log('   Paddy Growth:', dashboardResponse.data.data.growth.paddy, '%');
    console.log('   Rice Growth:', dashboardResponse.data.data.growth.rice, '%');
    console.log('   Revenue Growth:', dashboardResponse.data.data.growth.revenue, '%');
    console.log('   Profit Growth:', dashboardResponse.data.data.growth.profit, '%');

    console.log('\n🏢 Branch Statistics:');
    dashboardResponse.data.data.branchStats.forEach(branch => {
      console.log(`   ${branch.name}: ${branch.paddyCount} paddy, ${branch.productionCount} production, ${branch.userCount} users`);
    });

    console.log('\n📋 Recent Activities:', dashboardResponse.data.data.recentActivities.length, 'activities');

    console.log('\n🚨 System Alerts:', dashboardResponse.data.data.alerts.length, 'alerts');

    console.log('\n🎉 Dashboard test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing dashboard:', error.response?.data || error.message);
  }
};

// Run the test
testDashboard(); 