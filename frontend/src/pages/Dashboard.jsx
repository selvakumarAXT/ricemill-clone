import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactApexChart from 'react-apexcharts';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BranchFilter from '../components/common/BranchFilter';
import IndiaMap from '../components/charts/IndiaMap';
import { dashboardService } from '../services/dashboardService';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({});
  const [selectedPeriod] = useState('current_month');
  const [dateRange] = useState({
    startDate: '2025-01-01',
    endDate: '2025-06-30'
  });
  const [activeTab, setActiveTab] = useState('analytics');
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
      categories: ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'],
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
      categories: ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'],
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
      categories: ['Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025'],
      labels: { style: { colors: '#6B7280', fontSize: '12px' } }
    },
    yaxis: {
      labels: { 
        style: { colors: '#6B7280', fontSize: '12px' },
        formatter: (value) => `${(value / 1000).toFixed(0)}K`
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#6B7280' }
    },
    tooltip: {
      y: {
        formatter: (value) => `₹${(value / 1000).toFixed(0)}K`
      }
    }
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
    geographical = {}
  } = dashboardData;

  const {
    totalRevenue = 1480080,
    totalExpenses = 0,
    gstAmount = 53016
  } = overview;

  const {
    salesData = [60, 80, 45, 90, 70, 85],
    purchaseData = [0, 0, 0, 40, 0, 0],
    newCustomerSales = [0, 35, 0, 0, 0, 0],
    existingCustomerSales = [100, 65, 100, 100, 100, 100],
    invoiceCounts = { sales: [15, 22, 20, 18, 16, 14], purchases: [0, 0, 0, 5, 0, 0] },
    invoiceAmounts = { sales: [1200, 2800, 2500, 1800, 2200, 2000], purchases: [0, 0, 0, 800, 0, 0] }
  } = sales;

  const {
    salesOutstanding = {
      current: 595088,
      overdue_1_15: 2238008,
      overdue_16_30: 1053623,
      overdue_30_plus: 20558961.80
    },
    purchaseOutstanding = {
      current: 0,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_30_plus: 0
    }
  } = outstanding;

  const {
    bestSelling = [
      { name: 'HUSK', quantity: 607610 },
      { name: 'BRAN', quantity: 173900 },
      { name: 'RICE BROKEN', quantity: 161330 },
      { name: 'BLACKRICE', quantity: 33250 },
      { name: 'RICE NOOK', quantity: 26140 }
    ],
    leastSelling = [
      { name: 'PADDY', quantity: 1111.79 },
      { name: 'RICE NOOK', quantity: 26140 },
      { name: 'BLACKRICE', quantity: 33250 },
      { name: 'RICE BROKEN', quantity: 161330 },
      { name: 'BRAN', quantity: 173900 }
    ],
    lowStock = [
      { name: 'HUSK', quantity: -1046710 },
      { name: 'RICE BROKEN', quantity: -321220 },
      { name: 'BLACKRICE', quantity: -33250 },
      { name: 'PADDY', quantity: -1515.37 }
    ]
  } = products;

  const {
    topCustomers = [
      { name: 'SRI BALAMURAGAN TRADERS', amount: 4691295 },
      { name: 'Oviya Traders', amount: 3608727 },
      { name: 'HARISH UMI', amount: 1762902 },
      { name: 'PRAGYA ENTERPRISES', amount: 999999 },
      { name: 'ESWAR AND CO', amount: 520000 }
    ],
    topVendors = [
      { name: 'ESWAR & CO', amount: 1750000 },
      { name: 'Priyanka', amount: 410000 },
      { name: 'Vikram Selvam', amount: 120000 },
      { name: 'Venkatesan', amount: 100000 }
    ]
  } = customers;

  const {
    dueInvoices = [
      { invoiceNo: '10', companyName: 'M/S.SVMA AGRO PRODUCTS PVT LTD', name: '', phone: '', dueDate: '08-May-24', dueFrom: '449 Days', remainingPayment: 5903.80 },
      { invoiceNo: '14', companyName: '', name: 'RAJESH', phone: '', dueDate: '08-May-24', dueFrom: '449 Days', remainingPayment: 300000 },
      { invoiceNo: '16', companyName: '', name: 'RAJESH', phone: '', dueDate: '09-May-24', dueFrom: '448 Days', remainingPayment: 100000 },
      { invoiceNo: '18', companyName: 'M/S.SVMA AGRO PRODUCTS PVT LTD', name: '', phone: '', dueDate: '15-May-24', dueFrom: '442 Days', remainingPayment: 513576 },
      { invoiceNo: '19', companyName: 'M/S.SVMA AGRO PRODUCTS PVT LTD', name: '', phone: '', dueDate: '15-May-24', dueFrom: '442 Days', remainingPayment: 50840 }
    ]
  } = invoices;

  const totalSalesOutstanding = salesOutstanding.current + salesOutstanding.overdue_1_15 + salesOutstanding.overdue_16_30 + salesOutstanding.overdue_30_plus;
  const totalPurchaseOutstanding = purchaseOutstanding.current + purchaseOutstanding.overdue_1_15 + purchaseOutstanding.overdue_16_30 + purchaseOutstanding.overdue_30_plus;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">SREE ESWAR HI-TECH MODERN RICE MILL</h1>
          <div className="flex items-center space-x-6">
            <span className="text-red-400 font-medium">Dashboard</span>
            <span>Customer/Vendor</span>
            <span>Products/Services</span>
            <span>Sale Invoice</span>
            <span>Purchase Invoice</span>
            <span>Payment</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="secondary" className="bg-white text-green-600">+ Create</Button>
            <select className="bg-white text-green-600 px-3 py-2 rounded">
              <option>F.Y. 2025-2026</option>
            </select>
            <span>Expense/Income</span>
            <span>Other Documents</span>
            <span>Report</span>
            <span>🔔</span>
            <span>👤</span>
            <Button variant="secondary" className="bg-white text-green-600">Send Email</Button>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Complete your profile</h3>
          <p className="text-gray-600">Verify Email! Please check your email and follow the link to verify your email address.</p>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="px-6 pb-6">
        {/* Tabs and Controls */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
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
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Last Updated 7 days ago</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">01-01-2025 To 30-06-2025</span>
                <span className="text-gray-500">📅</span>
              </div>
              <Button variant="secondary" onClick={fetchDashboardData} className="px-4 py-2">
                🔄 Refresh
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sales */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Sale - Aug 2025</h3>
              <div className="h-16 mb-3">
                <ReactApexChart
                  options={salesChartOptions}
                  series={[{ data: salesData }]}
                  type="bar"
                  height={64}
                />
              </div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-gray-600">+GST {formatCurrency(gstAmount)}</div>
            </div>

            {/* Purchase */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Purchase - Aug 2025</h3>
              <div className="h-16 mb-3">
                <ReactApexChart
                  options={purchaseChartOptions}
                  series={[{ data: purchaseData }]}
                  type="bar"
                  height={64}
                />
              </div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(0)}</div>
            </div>

            {/* Expense */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Expense</h3>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(totalExpenses)}</div>
            </div>

            {/* Income */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Income</h3>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(0)}</div>
            </div>
          </div>
        </div>

        {/* Outstanding Balances and Sales Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Sales Outstanding */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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
          </div>

          {/* Purchase Outstanding */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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
          </div>

          {/* Total Sale Map */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Sale (Map)</h3>
            <IndiaMap data={geographical} />
          </div>
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
              {bestSelling.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{product.name}</span>
                  <span className="text-sm font-medium">{formatNumber(product.quantity)}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4">View All</Button>
          </div>

          {/* Least Selling Products */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Least Selling Products</h3>
            <div className="space-y-3">
              {leastSelling.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{product.name}</span>
                  <span className="text-sm font-medium">{formatNumber(product.quantity)}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4">View All</Button>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Low Stock</h3>
            <div className="space-y-3">
              {lowStock.map((product, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{product.name}</span>
                  <span className={`text-sm font-medium ${product.quantity < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatNumber(product.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-4">View All</Button>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Customers</h3>
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">{customer.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(customer.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vendors */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Vendors</h3>
            <div className="space-y-3">
              {topVendors.map((vendor, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">{vendor.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(vendor.amount)}</span>
                </div>
              ))}
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
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Invoice No.</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Company Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Name</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Due Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Due From</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Remaining Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dueInvoices.map((invoice, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 text-sm text-gray-900">{invoice.invoiceNo}</td>
                      <td className="py-2 text-sm text-gray-600">{invoice.companyName}</td>
                      <td className="py-2 text-sm text-gray-600">{invoice.name}</td>
                      <td className="py-2 text-sm text-gray-600">{invoice.dueDate}</td>
                      <td className="py-2 text-sm text-gray-600">{invoice.dueFrom}</td>
                      <td className="py-2 text-sm font-medium text-gray-900">{formatCurrency(invoice.remainingPayment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">
                Total Outstanding: {formatCurrency(totalSalesOutstanding)}
              </div>
              <Button variant="secondary">View All</Button>
            </div>
          </div>

          {/* Purchase Invoice Due */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Purchase Invoice Due</h3>
            <div className="text-center text-gray-500 py-8">
              No records found.
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

      {/* Footer */}
      <div className="bg-gray-100 text-center py-4">
        <span className="text-sm text-gray-500">© 2025 Go GST Bill.</span>
      </div>
    </div>
  );
};

export default Dashboard; 