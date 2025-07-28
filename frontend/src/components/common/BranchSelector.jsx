import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentBranchId } from '../../store/slices/branchSlice';
import FormSelect from './FormSelect';
import branchService from '../../services/branchService';

const BranchSelector = ({ selectedBranchId, onBranchChange }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const currentBranchId = useSelector((state) => state.branch.currentBranchId);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch branches from API
  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true);
      try {
        // Try to get all branches first (for superadmin)
        let response;
        try {
          response = await branchService.getAllBranches();
        } catch (error) {
          // If getAllBranches fails (not superadmin), try to get user's branch
          response = await branchService.getMyBranch();
          if (response.data) {
            // Convert single branch to array format
            response.data = [response.data];
          } else {
            response.data = [];
          }
        }
        
        const branchesData = response.data.map(branch => ({
          id: branch._id,
          name: branch.name
        }));
        setBranches(branchesData);
        
        // Set default branch if none is selected
        if (!currentBranchId && branchesData.length > 0) {
          dispatch(setCurrentBranchId(branchesData[0].id));
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        // Don't set any default if API fails - let user handle it
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [dispatch, currentBranchId]);

  // Sync with selectedBranchId from parent component
  useEffect(() => {
    if (selectedBranchId && selectedBranchId !== currentBranchId) {
      dispatch(setCurrentBranchId(selectedBranchId));
    }
  }, [selectedBranchId, currentBranchId, dispatch]);

  // Sync with user's branch if no selection
  useEffect(() => {
    if (user?.branch?._id && !selectedBranchId && !currentBranchId) {
      dispatch(setCurrentBranchId(user.branch._id));
    }
  }, [user, selectedBranchId, currentBranchId, dispatch]);

  const handleBranchChange = (branchId) => {
    dispatch(setCurrentBranchId(branchId));
    // Also notify parent component if callback is provided
    if (onBranchChange) {
      onBranchChange(branchId);
    }
    
    // Refresh the page after a short delay to ensure state is updated
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading branches...</div>;
  }

  if (branches.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Current Branch:</label>
        <div className="text-sm text-gray-500">No branches available or access denied</div>
      </div>
    );
  }

  // Determine the effective branch ID to display
  const effectiveBranchId = selectedBranchId || currentBranchId || user?.branch?._id;
  
  // Find the current branch name
  const currentBranch = branches.find(branch => branch.id === effectiveBranchId);
  const currentBranchName = currentBranch?.name || 'Select Branch';

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700">
        {branches.length === 1 ? 'Branch:' : 'Current Branch:'}
      </label>
      <FormSelect
        value={effectiveBranchId || ''}
        onChange={(e) => handleBranchChange(e.target.value)}
        className="min-w-[200px]"
        disabled={branches.length === 1}
      >
        {branches.length === 0 && (
          <option value="">No branches available</option>
        )}
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </FormSelect>
    </div>
  );
};

export default BranchSelector; 