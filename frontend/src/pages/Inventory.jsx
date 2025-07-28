import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import inventoryService from '../services/inventoryService';
import TableFilters from '../components/common/TableFilters';
import BranchFilter from '../components/common/BranchFilter';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const { currentBranchId } = useSelector((state) => state.branch);

  useEffect(() => {
    fetchInventory();
    // eslint-disable-next-line
  }, [currentBranchId]);

  const fetchInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await inventoryService.getAllInventory(currentBranchId);
      setInventory(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="mt-2 text-gray-600">
          Track and manage rice mill inventory
        </p>
      </div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <TableFilters
            searchValue={inventoryFilter}
            searchPlaceholder="Search inventory items..."
            onSearchChange={(e) => setInventoryFilter(e.target.value)}
            showSelect={false}
          />
          <BranchFilter
            value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {inventory
            .filter(item => {
              // Text search filter
              const q = inventoryFilter.toLowerCase();
              const matchesText = !inventoryFilter || (
                item.name?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
              );

              // Branch filter - use currentBranchId if set, otherwise use branchFilter
              const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter;
              const matchesBranch = !effectiveBranchFilter || item.branch_id === effectiveBranchFilter;

              return matchesText && matchesBranch;
            })
            .map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.name}</h3>
              <div className="text-3xl font-bold text-indigo-600 mb-2">{item.quantity}</div>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      )}

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