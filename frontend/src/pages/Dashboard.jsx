import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import ReactApexChart from 'react-apexcharts';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BranchFilter from '../components/common/BranchFilter';
import OutstandingProgressBar from '../components/common/OutstandingProgressBar';
import SouthIndiaSalesChart from '../components/charts/SouthIndiaSalesChart';

import { dashboardService } from '../services/dashboardService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({});
  const [selectedPeriod] = useState('current_month');
  const [dateRange, setDateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-06-30'
  });
  const [activeTab, setActiveTab] = useState('analytics');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { currentBranchId } = useSelector((state) => state.branch);
  const { user } = useSelector((state) => state.auth);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      
      if (user?.role === 'superadmin') {
        // Fetch superadmin dashboard data with optional branch filtering
        response = await dashboardService.getDashboardData({
          period: selectedPeriod,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
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
        setLastUpdated(new Date());
      } else {
        setError(response.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.role, currentBranchId, user?.branchId, selectedPeriod, dateRange]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchDashboardData]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle date range changes
  const handleDateRangeChange = (newDateRange) => {
    setDateRange(newDateRange);
    // Data will be refetched automatically due to useEffect dependency
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Manual refresh
  const handleManualRefresh = () => {
    fetchDashboardData();
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

  // Chart configurations
  const salesChartOptions = {
    chart: {
      type: 'bar',
      height: 100,
      toolbar: { show: false },
      sparkline: { enabled: true }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '100%',
        borderRadius: 4
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    colors: ['#10B981'],
    grid: { show: false },
    xaxis: { labels: { show: false } },
    yaxis: { labels: { show: false } },
    tooltip: { enabled: false }
  };

  const purchaseChartOptions = {
    ...salesChartOptions,
    colors: ['#3B82F6']
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Extract data from API response with defaults
  const {
    overview = {},
    sales = {},
    outstanding = {},
    products = {},
    customers = {},
    invoices = {},
    geographical = {},
    purchaseInvoices = []
  } = dashboardData;


  
  const {
    totalRevenue = 0,
    totalExpenses = 0,
    gstAmount = 0,
    totalPurchase = 0,
    totalIncome = 0
  } = overview;

  const {
    salesData = [0, 0, 0, 0, 0, 0],
    purchaseData = [0, 0, 0, 0, 0, 0],
    newCustomerSales = [0, 0,0, 0, 0, 0],
    existingCustomerSales = [0, 0, 0, 0, 0, 0],
    invoiceCounts = { sales: [0, 0, 0, 0, 0, 0], purchases: [0, 0, 0, 0, 0, 0] },
    invoiceAmounts = { sales: [0, 0, 0, 0, 0, 0], purchases: [0, 0, 0, 0, 0, 0] }
  } = sales;

  // Generate dynamic month labels based on actual data length
  const generateMonthLabels = (dataLength) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const labels = [];
    
    for (let i = dataLength - 1; i >= 0; i--) {
      const monthDate = new Date(currentDate);
      monthDate.setMonth(currentDate.getMonth() - i);
      const monthName = months[monthDate.getMonth()];
      const year = monthDate.getFullYear();
      labels.push(`${monthName} ${year}`);
    }
    
    return labels;
  };

  // Generate dynamic month labels for charts
  // Use real month data from backend if available, otherwise fallback to generated labels
  const monthLabels = dashboardData.sales?.months || generateMonthLabels(salesData.length);
  
  // Debug: Log the month data being used
  console.log('🔍 Month Data Debug:');
  console.log('  Backend months:', dashboardData.sales?.months);
  console.log('  Generated months:', generateMonthLabels(salesData.length));
  console.log('  Final monthLabels:', monthLabels);
  console.log('  salesData length:', salesData.length);

  const {
    salesOutstanding = {
      current: 0,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_30_plus: 0
    },
      purchaseOutstanding = {
      current: 0,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_30_plus: 0
    }
  } = outstanding;

  const {
    bestSelling = [],
    leastSelling = [],
    lowStock = []
  } = products;

  const {
    topCustomers = [],
    topVendors = []
  } = customers;

  const {
    dueInvoices = []
  } = invoices;

  const totalSalesOutstanding = salesOutstanding.current + salesOutstanding.overdue_1_15 + salesOutstanding.overdue_16_30 + salesOutstanding.overdue_30_plus;
  const totalPurchaseOutstanding = purchaseOutstanding.current + purchaseOutstanding.overdue_1_15 + purchaseOutstanding.overdue_16_30 + purchaseOutstanding.overdue_30_plus;

  // Chart configurations
  const newVsExistingChartOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    colors: ['#10B981', '#6B7280'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4
    },
    xaxis: {
      categories: monthLabels,
      labels: { style: { colors: '#6B7280', fontSize: '12px' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#6B7280', fontSize: '12px' },
        formatter: (value) => `${value.toFixed(1)}`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#6B7280' }
    },
    tooltip: {
      y: {
        formatter: (value) => `${value.toFixed(1)}%`
      }
    }
  };

  const invoiceCountChartOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4
      }
    },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    colors: ['#10B981', '#6B7280'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4
    },
    xaxis: {
      categories: monthLabels,
      labels: { style: { colors: '#6B7280', fontSize: '12px' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#6B7280', fontSize: '12px' }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#6B7280' }
    }
  };

  const invoiceAmountChartOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: [3, 2]
    },
    colors: ['#10B981', '#6B7280'],
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 4
    },
    xaxis: {
      categories: monthLabels,
      labels: { style: { colors: '#6B7280', fontSize: '12px' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#6B7280', fontSize: '12px' },
        formatter: (value) => `${value}K`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#6B7280' }
    },
    tooltip: {
      y: {
        formatter: (value) => `₹${value}K`
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
    

      {/* Main Dashboard */}
      <div className="px-6 pb-6">
        {/* Tabs and Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-end mb-6">
            {/* <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('quickLinks')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'quickLinks' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Quick Links
              </button>
            </div> */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Last Updated: {lastUpdated.toLocaleTimeString()}
              </span>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange({ ...dateRange, startDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-500">To</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange({ ...dateRange, endDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button 
                variant="secondary" 
                onClick={handleManualRefresh} 
                className="px-3 py-1.5 text-md"
                disabled={loading}
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </Button>
              <Button 
                variant={autoRefresh ? "primary" : "secondary"}
                onClick={toggleAutoRefresh} 
                className="px-3 py-1.5 text-md"
              >
                {autoRefresh ? '⏸️ Stop Auto-refresh' : '▶️ Auto-refresh'}
              </Button>
            </div>
          </div>

          {/* Branch Filter Indicator */}
          {user?.role === 'superadmin' && currentBranchId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-blue-800">
                    Branch Filter Active
                  </span>
                  <span className="text-sm text-blue-600">
                    Showing data for selected branch only
                  </span>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => window.location.reload()} 
                  className="px-3 py-1.5 text-sm text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Clear Filter
                </Button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sales */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Sale</h3>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-gray-600">+GST {formatCurrency(gstAmount)}</div>
            </div>

            {/* Purchase */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Purchase</h3>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(totalPurchase)}</div>
            </div>

            {/* Expense */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Expense</h3>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</div>
            </div>

            {/* Income */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Income</h3>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(totalIncome)}</div>
            </div>
          </div>
        </div>

        {/* Outstanding Balances Progress Bars */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales Outstanding */}
          <OutstandingProgressBar
            title="Sales Outstanding"
            data={salesOutstanding}
            total={totalSalesOutstanding}
          />

          {/* Purchase Outstanding */}
          <OutstandingProgressBar
            title="Purchase Outstanding"
            data={purchaseOutstanding}
            total={totalPurchaseOutstanding}
          />
        </div>

        {/* Outstanding Balances and Sales Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Sales Outstanding */}
          {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Outstanding</h3>
            <div className="text-2xl font-bold text-gray-900 mb-4">
              Total Receivables {formatCurrency(totalSalesOutstanding)}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">CURRENT</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(salesOutstanding.current)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">OVERDUE 1-15 Days</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(salesOutstanding.overdue_1_15)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">16-30 Days</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(salesOutstanding.overdue_16_30)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">30+ Days</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(salesOutstanding.overdue_30_plus)}</span>
              </div>
            </div>
          </div> */}

          {/* Purchase Outstanding */}
          {/* <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Outstanding</h3>
            <div className="text-2xl font-bold text-gray-900 mb-4">
              Total Payables {formatCurrency(totalPurchaseOutstanding)}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">CURRENT</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(purchaseOutstanding.current)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">OVERDUE 1-15 Days</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(purchaseOutstanding.overdue_1_15)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">16-30 Days</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(purchaseOutstanding.overdue_16_30)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">30+ Days</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(purchaseOutstanding.overdue_30_plus)}</span>
              </div>
            </div>
          </div> */}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
  {/* South India Sales Chart */}
  <div className="mb-6">
          <SouthIndiaSalesChart 
            data={geographical}
            title="South India Sales Overview"
            height={300}
          />
        </div>

        {/* New VS Existing Customer Sale */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">New VS Existing Customer Sale</h3>
          <ReactApexChart
            options={newVsExistingChartOptions}
            series={[
              { name: 'New Customer Sale', data: newCustomerSales },
              { name: 'Existing Customer Sale', data: existingCustomerSales }
            ]}
            type="bar"
            height={300}
          />
        </div>
          </div>
      

        {/* Invoice Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Invoice Count Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Count Summary</h3>
            <ReactApexChart
              options={invoiceCountChartOptions}
              series={[
                { name: 'Sale', data: invoiceCounts.sales },
                { name: 'Purchase', data: invoiceCounts.purchases }
              ]}
              type="bar"
              height={300}
            />
          </div>

          {/* Invoice Amount Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Amount Summary</h3>
            <ReactApexChart
              options={invoiceAmountChartOptions}
              series={[
                { name: 'Sale', data: invoiceAmounts.sales },
                { name: 'Purchase', data: invoiceAmounts.purchases }
              ]}
              type="line"
              height={300}
            />
          </div>
        </div>

        {/* Product and Customer/Vendor Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          {/* Best Selling Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Best Selling Products</h3>
            <div className="space-y-3">
              {bestSelling.length > 0 ? (
                bestSelling.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{product.name}</span>
                    <span className="text-sm font-medium">{formatNumber(product.quantity)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Least Selling Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Least Selling Products</h3>
            <div className="space-y-3">
              {leastSelling.length > 0 ? (
                leastSelling.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{product.name}</span>
                    <span className="text-sm font-medium">{formatNumber(product.quantity)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Low Stock</h3>
            <div className="space-y-3">
              {lowStock.length > 0 ? (
                lowStock.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{product.name}</span>
                    <span className={`text-sm font-medium ${product.quantity < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatNumber(product.quantity)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No low stock items
                </div>
              )}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Customers</h3>
            <div className="space-y-3">
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate">{customer.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(customer.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No customer data
                </div>
              )}
            </div>
          </div>

          {/* Top Vendors */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Vendors</h3>
            <div className="space-y-3">
              {topVendors.length > 0 ? (
                topVendors.map((vendor, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate">{vendor.name}</span>
                    <span className="text-sm font-medium">{formatCurrency(vendor.amount)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No vendor data
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Due Invoices */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales Invoice Due */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Invoice Due</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Invoice No.</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Company Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Due Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Due From</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Remaining Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dueInvoices.length > 0 ? (
                    dueInvoices.map((invoice, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{invoice.invoiceNo}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.companyName}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.dueDate}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.dueFrom}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(invoice.remainingPayment)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-4">
                        No outstanding invoices
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">
                Total Outstanding: {formatCurrency(totalSalesOutstanding)}
              </div>
            </div>
          </div>

          {/* Purchase Invoice Due */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Invoice Due</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Invoice No.</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Company Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Due Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Due From</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2 px-4">Remaining Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchaseInvoices.length > 0 ? (
                    purchaseInvoices.map((invoice, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{invoice.invoiceNo}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.companyName}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.dueDate}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{invoice.dueFrom}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{formatCurrency(invoice.remainingPayment)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-4">
                        No outstanding purchase invoices
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">
                Total Outstanding: {formatCurrency(totalPurchaseOutstanding)}
              </div>
            </div>
          </div>
        </div>

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