import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BranchFilter from '../components/common/BranchFilter';
import ResponsiveFilters from '../components/common/ResponsiveFilters';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [branchFilter, setBranchFilter] = useState('');
  const { currentBranchId } = useSelector((state) => state.branch);

  const reportTypes = [
    {
      id: 'production',
      title: 'Production Report',
      description: 'Daily, weekly, and monthly production statistics',
      icon: '📊',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Revenue and sales performance analysis',
      icon: '💰',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'inventory',
      title: 'Inventory Report',
      description: 'Stock levels and inventory movement tracking',
      icon: '📦',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'financial',
      title: 'Financial Report',
      description: 'Profit, loss, and expense analysis',
      icon: '📈',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'quality',
      title: 'Quality Report',
      description: 'Product quality metrics and standards',
      icon: '✅',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'employee',
      title: 'Employee Report',
      description: 'Staff performance and attendance tracking',
      icon: '👥',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const generateReport = async (reportType) => {
    setLoading(true);
    setSelectedReport(reportType);
    
    // Simulate API call
    setTimeout(() => {
      const mockData = generateMockReportData(reportType);
      setReportData(mockData);
      setLoading(false);
    }, 1500);
  };

  const generateMockReportData = (reportType) => {
    // Use effective branch filter
    const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter;
    
    const baseData = {
      period: dateRange,
      branch: effectiveBranchFilter || 'All Branches',
      generatedAt: new Date().toLocaleString(),
      summary: {
        total: 0,
        average: 0,
        growth: 0
      }
    };

    switch (reportType) {
      case 'production':
        return {
          ...baseData,
          title: 'Production Report',
          summary: {
            total: 1250,
            average: 41.7,
            growth: 12.5
          },
          data: {
            daily: [
              { date: '2024-01-01', quantity: 45, quality: 98 },
              { date: '2024-01-02', quantity: 52, quality: 97 },
              { date: '2024-01-03', quantity: 48, quality: 99 },
              { date: '2024-01-04', quantity: 55, quality: 96 },
              { date: '2024-01-05', quantity: 50, quality: 98 }
            ],
            categories: ['Raw Rice', 'Polished Rice', 'Basmati Rice'],
            productionByType: [
              { type: 'Raw Rice', quantity: 500, percentage: 40 },
              { type: 'Polished Rice', quantity: 450, percentage: 36 },
              { type: 'Basmati Rice', quantity: 300, percentage: 24 }
            ]
          }
        };
      
      case 'sales':
        return {
          ...baseData,
          title: 'Sales Report',
          summary: {
            total: 85000,
            average: 2833.3,
            growth: 8.2
          },
          data: {
            daily: [
              { date: '2024-01-01', revenue: 3200, units: 45 },
              { date: '2024-01-02', revenue: 3800, units: 52 },
              { date: '2024-01-03', revenue: 3500, units: 48 },
              { date: '2024-01-04', revenue: 4200, units: 55 },
              { date: '2024-01-05', revenue: 3800, units: 50 }
            ],
            topProducts: [
              { name: 'Premium Basmati', revenue: 25000, units: 150 },
              { name: 'Standard Rice', revenue: 20000, units: 200 },
              { name: 'Organic Rice', revenue: 15000, units: 100 }
            ]
          }
        };
      
      case 'inventory':
        return {
          ...baseData,
          title: 'Inventory Report',
          summary: {
            total: 1500,
            average: 500,
            growth: -5.2
          },
          data: {
            stockLevels: [
              { item: 'Raw Paddy', current: 800, min: 200, max: 1000 },
              { item: 'Polished Rice', current: 400, min: 100, max: 500 },
              { item: 'Basmati Rice', current: 300, min: 50, max: 400 }
            ],
            lowStock: [
              { item: 'Organic Rice', current: 25, min: 50 },
              { item: 'Premium Basmati', current: 30, min: 100 }
            ]
          }
        };
      
      case 'financial':
        return {
          ...baseData,
          title: 'Financial Report',
          summary: {
            total: 125000,
            average: 4166.7,
            growth: 15.3
          },
          data: {
            revenue: 85000,
            expenses: 45000,
            profit: 40000,
            profitMargin: 47.1,
            expensesBreakdown: [
              { category: 'Raw Materials', amount: 25000, percentage: 55.6 },
              { category: 'Labor', amount: 12000, percentage: 26.7 },
              { category: 'Utilities', amount: 5000, percentage: 11.1 },
              { category: 'Other', amount: 3000, percentage: 6.7 }
            ]
          }
        };
      
      case 'quality':
        return {
          ...baseData,
          title: 'Quality Report',
          summary: {
            total: 98.2,
            average: 98.2,
            growth: 1.5
          },
          data: {
            qualityMetrics: [
              { metric: 'Moisture Content', value: 12.5, target: 12.0, status: 'Good' },
              { metric: 'Broken Grains', value: 2.1, target: 3.0, status: 'Excellent' },
              { metric: 'Foreign Matter', value: 0.5, target: 1.0, status: 'Excellent' },
              { metric: 'Color Grade', value: 4.8, target: 4.5, status: 'Good' }
            ],
            qualityTrends: [
              { date: '2024-01-01', score: 97.5 },
              { date: '2024-01-02', score: 98.0 },
              { date: '2024-01-03', score: 98.5 },
              { date: '2024-01-04', score: 98.2 },
              { date: '2024-01-05', score: 98.8 }
            ]
          }
        };
      
      case 'employee':
        return {
          ...baseData,
          title: 'Employee Report',
          summary: {
            total: 25,
            average: 25,
            growth: 0
          },
          data: {
            attendance: {
              present: 23,
              absent: 2,
              percentage: 92
            },
            performance: [
              { employee: 'John Doe', attendance: 95, productivity: 88, rating: 'Excellent' },
              { employee: 'Jane Smith', attendance: 92, productivity: 85, rating: 'Good' },
              { employee: 'Mike Johnson', attendance: 88, productivity: 82, rating: 'Good' }
            ],
            departments: [
              { name: 'Production', employees: 12, attendance: 94 },
              { name: 'Quality Control', employees: 5, attendance: 96 },
              { name: 'Maintenance', employees: 3, attendance: 90 },
              { name: 'Administration', employees: 5, attendance: 88 }
            ]
          }
        };
      
      default:
        return baseData;
    }
  };

  const exportReport = (format = 'pdf') => {
    if (!reportData) return;
    
    // Simulate export functionality
    console.log(`Exporting ${selectedReport} report as ${format}`);
    alert(`Report exported as ${format.toUpperCase()}`);
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    const { title, summary, data, period, branch, generatedAt } = reportData;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Report Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <p className="text-sm text-gray-600">
                Period: {period} • Branch: {branch} • Generated: {generatedAt}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => exportReport('pdf')}
                variant="outline"
                icon="download"
                className="text-xs"
              >
                Export PDF
              </Button>
              <Button
                onClick={() => exportReport('excel')}
                variant="outline"
                icon="download"
                className="text-xs"
              >
                Export Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-800">Total</h4>
              <p className="text-2xl font-bold text-blue-900">{summary.total.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800">Average</h4>
              <p className="text-2xl font-bold text-green-900">{summary.average.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <h4 className="text-sm font-medium text-purple-800">Growth</h4>
              <p className={`text-2xl font-bold ${summary.growth >= 0 ? 'text-purple-900' : 'text-red-600'}`}>
                {summary.growth >= 0 ? '+' : ''}{summary.growth}%
              </p>
            </div>
          </div>

          {/* Detailed Data */}
          <div className="space-y-6">
            {selectedReport === 'production' && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Production by Type</h4>
                  <div className="space-y-3">
                    {data.productionByType.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700">{item.type}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {item.quantity} ({item.percentage}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'sales' && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h4>
                  <div className="space-y-3">
                    {data.topProducts.map((product, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="font-medium text-gray-800">{product.name}</span>
                          <p className="text-sm text-gray-600">{product.units} units sold</p>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ₹{product.revenue.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'inventory' && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Stock Levels</h4>
                  <div className="space-y-3">
                    {data.stockLevels.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                        <span className="font-medium text-gray-800">{item.item}</span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            Min: {item.min} | Max: {item.max}
                          </span>
                          <span className={`font-bold ${
                            item.current < item.min ? 'text-red-600' : 
                            item.current > item.max * 0.8 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {item.current}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {data.lowStock.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="text-lg font-semibold text-red-800 mb-4">Low Stock Alerts</h4>
                    <div className="space-y-2">
                      {data.lowStock.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-red-700">{item.item}</span>
                          <span className="text-red-600 font-bold">
                            {item.current} (Min: {item.min})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {selectedReport === 'financial' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-800">Revenue</h4>
                    <p className="text-2xl font-bold text-green-900">₹{data.revenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="text-sm font-medium text-red-800">Expenses</h4>
                    <p className="text-2xl font-bold text-red-900">₹{data.expenses.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800">Profit</h4>
                    <p className="text-2xl font-bold text-blue-900">₹{data.profit.toLocaleString()}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Expenses Breakdown</h4>
                  <div className="space-y-3">
                    {data.expensesBreakdown.map((expense, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700">{expense.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${expense.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-20 text-right">
                            ₹{expense.amount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'quality' && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Quality Metrics</h4>
                  <div className="space-y-3">
                    {data.qualityMetrics.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="font-medium text-gray-800">{metric.metric}</span>
                          <p className="text-sm text-gray-600">Target: {metric.target}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-900">{metric.value}</span>
                          <p className={`text-sm font-medium ${
                            metric.status === 'Excellent' ? 'text-green-600' :
                            metric.status === 'Good' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {metric.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedReport === 'employee' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800">Attendance</h4>
                    <p className="text-2xl font-bold text-blue-900">{data.attendance.percentage}%</p>
                    <p className="text-sm text-blue-600">
                      {data.attendance.present} present, {data.attendance.absent} absent
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-800">Total Employees</h4>
                    <p className="text-2xl font-bold text-green-900">{summary.total}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Department Overview</h4>
                  <div className="space-y-3">
                    {data.departments.map((dept, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                        <div>
                          <span className="font-medium text-gray-800">{dept.name}</span>
                          <p className="text-sm text-gray-600">{dept.employees} employees</p>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{dept.attendance}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            View detailed reports and analytics for your rice mill
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Filters */}
        <ResponsiveFilters title="Report Filters" className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Report Period:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <BranchFilter
            value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          />
        </ResponsiveFilters>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((report) => (
            <div
              key={report.id}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => generateReport(report.id)}
            >
              <div className="flex items-center space-x-4">
                <div className={`text-3xl bg-gradient-to-r ${report.color} bg-clip-text text-transparent`}>
                  {report.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                  <p className="text-gray-600 text-sm">{report.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-gray-600">Generating report...</span>
          </div>
        )}

        {/* Report Content */}
        {!loading && reportData && renderReportContent()}

        {/* Empty State */}
        {!loading && !reportData && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Report</h3>
            <p className="text-gray-600">
              Choose a report type from above to view detailed analytics and insights.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports; 