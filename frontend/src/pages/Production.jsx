import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import productionService from '../services/productionService';
import TableFilters from '../components/common/TableFilters';
import BranchFilter from '../components/common/BranchFilter';
import TableList from '../components/common/TableList';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Production = () => {
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [productionFilter, setProductionFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [expandedProduction, setExpandedProduction] = useState(null);
  const { currentBranchId } = useSelector((state) => state.branch);

  useEffect(() => {
    fetchProduction();
    // eslint-disable-next-line
  }, [currentBranchId]);

  const fetchProduction = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productionService.getAllProduction(currentBranchId);
      setProduction(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch production');
    } finally {
      setLoading(false);
    }
  };

  // Define columns for the table
  const columns = [
    { key: "name", label: "Name" },
    { key: "quantity", label: "Quantity", render: (quantity) => (
      <span className="font-semibold text-indigo-600">{quantity}</span>
    )},
    { key: "description", label: "Description" },
    { key: "branch_id", label: "Branch", render: (branch) => branch?.name || "N/A" },
    {
      key: "actions",
      label: "Actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            onClick={() => console.log('Edit production:', record)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
          >
            Edit
          </Button>
          <Button
            onClick={() => console.log('Delete production:', record)}
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredProduction = production.filter(item => {
    // Text search filter
    // Branch filtering is now handled automatically by the API
    const q = productionFilter.toLowerCase();
    const matchesText = !productionFilter || (
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );

    return matchesText;
  });

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex flex-col space-y-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Production Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitor and manage rice production processes</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        <ResponsiveFilters title="Filters & Search" className="mb-6">
          <TableFilters
            searchValue={productionFilter}
            searchPlaceholder="Search production items..."
            onSearchChange={(e) => setProductionFilter(e.target.value)}
            showSelect={false}
          />
          <BranchFilter
            value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          />
        </ResponsiveFilters>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Production Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredProduction.length} records</p>
          </div>
          <TableList
            data={filteredProduction}
            columns={columns}
            actions={(item) => [
              <Button
                key="edit"
                onClick={() => console.log('Edit production:', item)}
                variant="info"
                icon="edit"
              >
                Edit
              </Button>,
              <Button
                key="delete"
                onClick={() => console.log('Delete production:', item)}
                variant="danger"
                icon="delete"
              >
                Delete
              </Button>,
            ]}
            renderDetail={(item) => (
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Name:</span>
                      <span className="text-gray-900 font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Quantity:</span>
                      <span className="text-gray-900 font-medium text-indigo-600">{item.quantity}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24 text-sm font-medium text-gray-600">Branch:</span>
                      <span className="text-gray-900 font-medium">{item.branch_id?.name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Description</h4>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        {/* Mobile Table View */}
        <div className="lg:hidden bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">Production Records</h3>
            <p className="text-sm text-gray-600 mt-1">Total: {filteredProduction.length} records</p>
          </div>
          
          <div className="p-4">
            {filteredProduction.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No production records</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new production record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProduction.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Mobile Table Row */}
                    <div 
                      className="bg-white p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedProduction(expandedProduction === item._id ? null : item._id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                          <div className="text-xs text-gray-500">
                            Quantity: {item.quantity} • {item.branch_id?.name || 'N/A'}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Edit production:', item);
                            }}
                            variant="info"
                            icon="edit"
                            className="text-xs px-2 py-1"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Delete production:', item);
                            }}
                            variant="danger"
                            icon="delete"
                            className="text-xs px-2 py-1"
                          >
                            Delete
                          </Button>
                          <svg 
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedProduction === item._id ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail View */}
                    {expandedProduction === item._id && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 border-t border-gray-200">
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="ml-1 font-medium text-gray-900">{item.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quantity:</span>
                            <span className="ml-1 font-medium text-indigo-600">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Branch:</span>
                            <span className="ml-1 font-medium text-gray-900">{item.branch_id?.name || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="p-3 bg-white rounded-lg border border-gray-200 w-full">
                          <h5 className="text-sm font-semibold text-gray-800 mb-2">Description</h5>
                          <p className="text-gray-700 text-sm">{item.description}</p>
                        </div>
                      </div>
                    )}
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

export default Production; 