import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMe } from '../store/slices/authSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import dashboardService from '../services/dashboardService';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (!user) {
      dispatch(getMe());
    }
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchDashboardData, 30000);
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [dispatch, user, currentBranchId]);

  const fetchDashboardData = async () => {
    try {
      setError('');
      let data;
      
      if (user?.role === 'superadmin') {
        data = await dashboardService.getSuperadminDashboard();
      } else {
        data = await dashboardService.getBranchDashboard(currentBranchId);
      }
      
      setDashboardData(data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '→';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  if (isLoading || loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Loading</h2>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    );
  }

  const isSuperadmin = user?.role === 'superadmin';
  const overview = dashboardData.overview || dashboardData.stats;
  const growth = dashboardData.growth || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {isSuperadmin ? 'Superadmin Dashboard' : 'Branch Dashboard'}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Welcome back, {user?.name}! Here's your comprehensive overview.
            </p>
            {isSuperadmin && (
              <p className="text-xs text-blue-600 mt-1">
                📡 Live data • Auto-refreshing every 30 seconds
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Paddy */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paddy</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(overview.totalPaddy || 0)} kg
                </p>
                {growth.paddy !== undefined && (
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${getGrowthColor(growth.paddy)}`}>
                      {getGrowthIcon(growth.paddy)} {Math.abs(growth.paddy).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
            </div>
          </div>

          {/* Total Rice */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rice</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(overview.totalRice || 0)} kg
                </p>
                {growth.rice !== undefined && (
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${getGrowthColor(growth.rice)}`}>
                      {getGrowthIcon(growth.rice)} {Math.abs(growth.rice).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🍚</span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(overview.totalRevenue || 0)}
                </p>
                {growth.revenue !== undefined && (
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${getGrowthColor(growth.revenue)}`}>
                      {getGrowthIcon(growth.revenue)} {Math.abs(growth.revenue).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(overview.profit || 0)}
                </p>
                {growth.profit !== undefined && (
                  <div className="flex items-center mt-1">
                    <span className={`text-xs font-medium ${getGrowthColor(growth.profit)}`}>
                      {getGrowthIcon(growth.profit)} {Math.abs(growth.profit).toFixed(1)}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1">from last month</span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Gunny */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gunny Bags</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatNumber(overview.totalGunny || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👜</span>
              </div>
            </div>
          </div>

          {/* Total Inventory */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Items</p>
                <p className="text-xl font-bold text-teal-600">
                  {formatNumber(overview.totalInventory || 0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📦</span>
              </div>
            </div>
          </div>

          {/* Total Branches */}
          {isSuperadmin && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Branches</p>
                  <p className="text-xl font-bold text-cyan-600">
                    {overview.totalBranches || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏢</span>
                </div>
              </div>
            </div>
          )}

          {/* Total Users */}
          {isSuperadmin && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-xl font-bold text-pink-600">
                    {overview.totalUsers || 0}
                  </p>
                </div>
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">👥</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Efficiency Chart */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Efficiency</h3>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (overview.efficiency || 0) / 100)}`}
                    className="text-green-500"
                  />
                </svg>
                <div className="absolute">
                  <span className="text-2xl font-bold text-gray-900">
                    {(overview.efficiency || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Rice extraction rate</p>
            </div>
          </div>

          {/* Quality Score */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {(overview.qualityScore || 0).toFixed(1)}
              </div>
              <div className="flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-2xl ${i < Math.floor((overview.qualityScore || 0) / 20) ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">Average quality rating</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/paddy-management">
                <Button className="w-full justify-center" variant="primary">
                  🌾 Add Paddy Entry
                </Button>
              </Link>
              <Link to="/production">
                <Button className="w-full justify-center" variant="secondary">
                  🍚 Record Production
                </Button>
              </Link>
              <Link to="/inventory">
                <Button className="w-full justify-center" variant="outline">
                  📦 Check Inventory
                </Button>
              </Link>
              <Link to="/reports">
                <Button className="w-full justify-center" variant="outline">
                  📊 View Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Branch Statistics (Superadmin Only) */}
        {isSuperadmin && dashboardData.branchStats && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Branch Performance Overview</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData.branchStats.map((branch) => (
                  <div key={branch.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{branch.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        branch.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paddy Entries:</span>
                        <span className="font-medium">{branch.paddyCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Production Records:</span>
                        <span className="font-medium">{branch.productionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Users:</span>
                        <span className="font-medium">{branch.userCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Alerts */}
        {dashboardData.alerts && dashboardData.alerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
              <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {dashboardData.alerts.map((alert, index) => (
                  <div key={index} className={`flex items-center p-3 rounded-lg ${
                    alert.type === 'warning' ? 'bg-red-50 border border-red-200' :
                    alert.type === 'info' ? 'bg-blue-50 border border-blue-200' :
                    'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <span className="mr-3">
                      {alert.type === 'warning' ? '⚠️' : alert.type === 'info' ? 'ℹ️' : '🔔'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <Button 
                onClick={fetchDashboardData}
                variant="outline"
                className="text-xs"
              >
                🔄 Refresh
              </Button>
            </div>
          </div>
          <div className="p-6">
            {(!dashboardData.recentActivities || dashboardData.recentActivities.length === 0) ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activities</h3>
                <p className="text-gray-500">Activities will appear here as they happen</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {activity.type === 'paddy' ? '🌾' : 
                       activity.type === 'production' ? '🍚' : 
                       activity.type === 'inventory' ? '📦' : '📋'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">
                        {activity.amount} • {activity.branchName || ''} • {activity.timeAgo || 'Recently'}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 