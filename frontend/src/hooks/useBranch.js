import { useSelector, useDispatch } from 'react-redux';
import { setCurrentBranchId, clearCurrentBranchId } from '../store/slices/branchSlice';

export const useBranch = () => {
  const dispatch = useDispatch();
  const { currentBranchId, availableBranches, isLoading, error } = useSelector((state) => state.branch);

  const setBranch = (branchId) => {
    dispatch(setCurrentBranchId(branchId));
  };

  const clearBranch = () => {
    dispatch(clearCurrentBranchId());
  };

  return {
    currentBranchId,
    availableBranches,
    isLoading,
    error,
    setBranch,
    clearBranch,
  };
}; 