const Production = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Production Management</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage rice production processes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Production</h3>
          <div className="text-3xl font-bold text-indigo-600 mb-2">567 kg</div>
          <p className="text-gray-600">Target: 600 kg</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiency Rate</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">94.5%</div>
          <p className="text-gray-600">Above target by 4.5%</p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Production Batches</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center">Production management features coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Production; 