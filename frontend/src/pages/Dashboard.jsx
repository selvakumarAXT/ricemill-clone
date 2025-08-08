import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BranchFilter from '../components/common/BranchFilter';
import { dashboardService } from '../services/dashboardService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({});
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-06-30'
  });
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchDashboardData();
  }, [currentBranchId, selectedPeriod, dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      
      if (user?.role === 'superadmin') {
        // Fetch superadmin dashboard data
        response = await dashboardService.getDashboardData({
          period: selectedPeriod,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
      } else {
        // Fetch branch-specific dashboard data
        const branchId = currentBranchId || user?.branchId;
        if (!branchId) {
          throw new Error('Branch ID not found');
        }
        response = await dashboardService.getBranchDashboard(branchId, {
          period: selectedPeriod,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        });
      }

      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-IN').format(number || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'current': return 'text-green-600 bg-green-100';
      case 'overdue_1_15': return 'text-yellow-600 bg-yellow-100';
      case 'overdue_16_30': return 'text-orange-600 bg-orange-100';
      case 'overdue_30_plus': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Extract data from API response
  const {
    overview = {},
    growth = {},
    branchStats = [],
    recentActivities = [],
    qualityMetrics = {},
    efficiencyMetrics = {},
    alerts = []
  } = dashboardData;

  const {
    totalPaddy = 0,
    totalRice = 0,
    totalGunny = 0,
    totalInventory = 0,
    totalBranches = 0,
    totalUsers = 0,
    totalRevenue = 0,
    totalExpenses = 0,
    profit = 0,
    efficiency = 0,
    qualityScore = 0
  } = overview;

  return (
    <div className="min-h-screen bg-white">
    

      {/* Controls */}
      <div className="px-4 py-4 bg-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex space-x-2">
           
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Last Updated: {new Date().toLocaleString()}</span>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">To</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <Button variant="secondary" onClick={fetchDashboardData} className="p-2">
              🔄 Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Sales/Revenue */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Revenue</h3>
              <span className="text-green-500">📈</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">
                Growth: {growth.revenue || 0}%
              </div>
            </div>
            {/* Bar chart */}
            <div className="mt-4 flex items-end space-x-1 h-16">
              {[60, 80, 45, 90, 70, 85].map((height, index) => (
                <div
                  key={index}
                  className="bg-green-500 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                />
              ))}
            </div>
          </div>

          {/* Purchase/Expenses */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Expenses</h3>
              <span className="text-blue-500">💰</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-sm text-gray-600">
                This month
              </div>
            </div>
            {/* Bar chart */}
            <div className="mt-4 flex items-end space-x-1 h-16">
              {[0, 0, 0, 40, 0, 0].map((height, index) => (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${height}%`, width: '12px' }}
                />
              ))}
            </div>
          </div>

          {/* Profit */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Net Profit</h3>
              <span className="text-green-500">💵</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(profit)}
              </div>
              <div className="text-sm text-gray-600">
                Growth: {growth.profit || 0}%
              </div>
            </div>
          </div>

          {/* Efficiency */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Production Efficiency</h3>
              <span className="text-purple-500">⚡</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-600">
                {efficiency}%
              </div>
              <div className="text-sm text-gray-600">
                Quality Score: {qualityScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Production Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Paddy */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Paddy</h3>
              <span className="text-yellow-500">🌾</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-yellow-600">
                {formatNumber(totalPaddy)} kg
              </div>
              <div className="text-sm text-gray-600">
                Growth: {growth.paddy || 0}%
              </div>
            </div>
          </div>

          {/* Total Rice */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Rice</h3>
              <span className="text-white-500">🍚</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-600">
                {formatNumber(totalRice)} kg
              </div>
              <div className="text-sm text-gray-600">
                Growth: {growth.rice || 0}%
              </div>
            </div>
          </div>

          {/* Total Gunny */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Gunny</h3>
              <span className="text-brown-500">👜</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-amber-600">
                {formatNumber(totalGunny)} bags
              </div>
              <div className="text-sm text-gray-600">
                Inventory items
              </div>
            </div>
          </div>

          {/* Total Inventory */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Inventory</h3>
              <span className="text-blue-500">📦</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(totalInventory)} items
              </div>
              <div className="text-sm text-gray-600">
                Stock items
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        {user?.role === 'superadmin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
            {/* Total Branches */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Branches</h3>
                <span className="text-green-500">🏢</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(totalBranches)}
                </div>
                <div className="text-sm text-gray-600">
                  Active branches
                </div>
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                <span className="text-blue-500">👥</span>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(totalUsers)}
                </div>
                <div className="text-sm text-gray-600">
                  Active users
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quality & Efficiency Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Quality Metrics */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Average Quality Score</span>
                <span className="text-lg font-bold text-green-600">{qualityMetrics.averageQuality || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quality Trend</span>
                <span className={`text-sm font-medium ${
                  qualityMetrics.qualityTrend === 'improving' ? 'text-green-600' : 
                  qualityMetrics.qualityTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {qualityMetrics.qualityTrend || 'stable'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Quality Issues</span>
                <span className="text-sm text-red-600">{qualityMetrics.qualityIssues || 0}</span>
              </div>
            </div>
          </div>

          {/* Efficiency Metrics */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Efficiency Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Efficiency</span>
                <span className="text-lg font-bold text-blue-600">{efficiencyMetrics.overallEfficiency || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Max Efficiency</span>
                <span className="text-sm text-green-600">{efficiencyMetrics.maxEfficiency || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Min Efficiency</span>
                <span className="text-sm text-red-600">{efficiencyMetrics.minEfficiency || 0}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Activities</h3>
              <Button variant="secondary" className="text-sm px-3 py-1">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.action}</div>
                    <div className="text-xs text-gray-600">
                      {activity.branchName} • {activity.timeAgo}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{activity.amount}</div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No recent activities
                </div>
              )}
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">System Alerts</h3>
              <Button variant="secondary" className="text-sm px-3 py-1">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className={`flex items-center space-x-3 p-2 rounded-lg ${
                  alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                  alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                  alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    alert.type === 'warning' ? 'bg-yellow-500' :
                    alert.type === 'error' ? 'bg-red-500' :
                    alert.type === 'success' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{alert.message}</div>
                    {alert.count > 0 && (
                      <div className="text-xs text-gray-600">{alert.count} items affected</div>
                    )}
                  </div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No alerts
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Branch Statistics (Superadmin only) */}
        {user?.role === 'superadmin' && branchStats.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {branchStats.slice(0, 6).map((branch, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{branch.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      branch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">Code: {branch.millCode}</div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>Paddy Entries: {branch.paddyCount}</div>
                    <div>Production: {branch.productionCount}</div>
                    <div>Users: {branch.userCount}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 