import { useEffect, useState } from 'react';
import productionService from '../services/productionService';

const Production = ({ selectedBranchId }) => {
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduction();
    // eslint-disable-next-line
  }, [selectedBranchId]);

  const fetchProduction = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productionService.getAllProduction(selectedBranchId);
      setProduction(res.items || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch production');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Production Management</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage rice production processes
        </p>
      </div>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {production.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{item.name}</h3>
              <div className="text-3xl font-bold text-indigo-600 mb-2">{item.quantity}</div>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      )}

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