const Inventory = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="mt-2 text-gray-600">
          Track and manage rice mill inventory
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Rice</h3>
          <div className="text-3xl font-bold text-yellow-600 mb-2">2,450 kg</div>
          <p className="text-gray-600">Available stock</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processed Rice</h3>
          <div className="text-3xl font-bold text-green-600 mb-2">1,280 kg</div>
          <p className="text-gray-600">Ready for sale</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Packaging</h3>
          <div className="text-3xl font-bold text-blue-600 mb-2">340</div>
          <p className="text-gray-600">Bags available</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center">Detailed inventory management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Inventory; 