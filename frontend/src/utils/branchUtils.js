import { store } from '../store';

// Get current branchId from Redux store
export const getCurrentBranchId = () => {
  const state = store.getState();
  return state.branch.currentBranchId;
};

// Get current branchId from localStorage (fallback)
export const getBranchIdFromStorage = () => {
  return localStorage.getItem('currentBranchId');
};

// Set current branchId
export const setCurrentBranchId = (branchId) => {
  localStorage.setItem('currentBranchId', branchId);
}; 