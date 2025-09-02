import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import branchService from '../services/branchService';
import { setAvailableBranches, setLoading, setError } from '../store/slices/branchSlice';

/**
 * Custom hook for managing branch data refresh
 * Provides functionality to refresh branch data across the application
 */
export const useBranchRefresh = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { availableBranches, isLoading } = useSelector((state) => state.branch);

  /**
   * Refreshes branch data based on user role
   * - Superadmin: Fetches all branches
   * - Regular users: Uses their assigned branch
   */
  const refreshBranches = useCallback(async () => {
    if (!user) return;

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      let branchesData = [];

      if (user.role === "superadmin") {
        // Superadmin can see all branches
        const response = await branchService.getAllBranches();
        branchesData = response.data || [];
      } else if (user.branch) {
        // Non-superadmin users only see their assigned branch
        branchesData = [user.branch];
      }

      dispatch(setAvailableBranches(branchesData));
      return branchesData;
    } catch (error) {
      console.error('Error refreshing branches:', error);
      dispatch(setError(error.message || 'Failed to refresh branches'));
      dispatch(setAvailableBranches([]));
      return [];
    } finally {
      dispatch(setLoading(false));
    }
  }, [user, dispatch]);

  return {
    refreshBranches,
    availableBranches,
    isLoading,
  };
};

export default useBranchRefresh;
