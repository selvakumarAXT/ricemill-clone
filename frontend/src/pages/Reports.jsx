const Reports = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600">
          View detailed reports and analytics for your rice mill
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Production Report</h3>
          <p className="text-gray-600">Daily, weekly, and monthly production statistics</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Report</h3>
          <p className="text-gray-600">Revenue and sales performance analysis</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Report</h3>
          <p className="text-gray-600">Stock levels and inventory movement tracking</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Report</h3>
          <p className="text-gray-600">Profit, loss, and expense analysis</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Report</h3>
          <p className="text-gray-600">Product quality metrics and standards</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Report</h3>
          <p className="text-gray-600">Staff performance and attendance tracking</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center">Advanced reporting features coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Reports; 