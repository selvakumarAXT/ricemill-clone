import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentBranchId } from '../../store/slices/branchSlice';
import TableFilters from './TableFilters';
import Icon from './Icon';
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
  const dispatch = useDispatch();
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

  // Only allow branch selection when sidebar has "All Branches" selected
  // For superadmin users: only enable when currentBranchId is 'all' or null
  // For non-superadmin users: always disabled (they only see their assigned branch)
  const isFilterDisabled = !user?.isSuperAdmin || (currentBranchId && currentBranchId !== 'all');
  
  // Show all branches when filter is enabled (sidebar has "All Branches" selected)
  // Show only current branch when filter is disabled (specific branch selected in sidebar)
  const displayBranches = isFilterDisabled 
    ? branches.filter(branch => branch._id === currentBranchId)
    : branches;
  const branchOptions = displayBranches.map(branch => ({
    value: branch._id,
    label: `${branch.name} (${branch.millCode})`
  }));

  // Handle branch selection change
  const handleBranchChange = (e) => {
    const selectedBranchId = e.target.value;
    
    // Only allow changes when filter is enabled (sidebar has "All Branches" selected)
    if (isFilterDisabled) {
      return;
    }
    
    // Call the parent's onChange if provided
    if (onChange) {
      onChange(e);
    }
    
    // For superadmin users, also update the Redux store
    if (user?.isSuperAdmin) {
      dispatch(setCurrentBranchId(selectedBranchId));
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TableFilters
        searchValue=""
        selectValue={isFilterDisabled ? currentBranchId : value}
        selectOptions={branchOptions}
        onSelectChange={handleBranchChange}
        selectPlaceholder={placeholder}
        showSearch={false}
        showSelect={true}
        selectLabel={showLabel ? label : ''}
        disabled={isFilterDisabled}
      />
      {isFilterDisabled && (
        <Icon 
          name="lock" 
          className="w-4 h-4 text-gray-500" 
          title="Locked to selected branch"
        />
      )}
    </div>
  );
};

export default BranchFilter; 