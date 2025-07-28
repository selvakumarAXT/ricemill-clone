import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TableFilters from './TableFilters';
import branchService from '../../services/branchService';

const BranchFilter = ({
  value = '',
  onChange,
  placeholder = 'All Branches',
  className = '',
  showLabel = true,
  label = 'Branch'
}) => {
  const { user } = useSelector((state) => state.auth);
  const { currentBranchId } = useSelector((state) => state.branch);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch branches based on user role
  useEffect(() => {
    const fetchBranches = async () => {
      if (!user) return;

      setLoading(true);
      try {
        if (user?.isSuperAdmin) {
          // Superadmin can see all branches
          const response = await branchService.getAllBranches();
          setBranches(response.data || []);
        } else if (user?.branch) {
          // Non-superadmin users only see their assigned branch
          setBranches([user.branch]);
        } else {
          setBranches([]);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [user]);

  // Don't render if no branches or user is not superadmin and has no assigned branch
  if (branches.length === 0 || (!user?.isSuperAdmin && !user?.branch)) {
    return null;
  }

  // For non-superadmin users with assigned branch, don't show filter
  if (!user?.isSuperAdmin && user?.branch) {
    return null;
  }

  // Determine if filter should be disabled
  const isFilterDisabled = currentBranchId && currentBranchId !== 'all';
  
  // If filter is disabled, only show the current branch
  const displayBranches = isFilterDisabled 
    ? branches.filter(branch => branch._id === currentBranchId)
    : branches;
  const branchOptions = displayBranches.map(branch => ({
    value: branch._id,
    label: `${branch.name} (${branch.millCode})`
  }));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TableFilters
        searchValue=""
        selectValue={isFilterDisabled ? currentBranchId : value}
        selectOptions={branchOptions}
        onSelectChange={isFilterDisabled ? undefined : onChange}
        selectPlaceholder={placeholder}
        showSearch={false}
        showSelect={true}
        selectLabel={showLabel ? label : ''}
        disabled={isFilterDisabled}
      />
      {isFilterDisabled && (
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Locked to selected branch
        </span>
      )}
    </div>
  );
};

export default BranchFilter; 