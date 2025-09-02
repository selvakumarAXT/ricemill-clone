import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentBranchId: localStorage.getItem("currentBranchId") || null,
  availableBranches: [],
  isLoading: false,
  error: null,
  refreshTrigger: 0, // Used to trigger refresh in components
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
      setCurrentBranchId: (state, action) => {
    state.currentBranchId = action.payload;
    localStorage.setItem("currentBranchId", action.payload);
  },
  clearCurrentBranchId: (state) => {
    state.currentBranchId = null;
    localStorage.removeItem("currentBranchId");
    },
    setAvailableBranches: (state, action) => {
      state.availableBranches = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    triggerRefresh: (state) => {
      state.refreshTrigger = state.refreshTrigger + 1;
    },
  },
});

export const {
  setCurrentBranchId,
  clearCurrentBranchId,
  setAvailableBranches,
  setLoading,
  setError,
  triggerRefresh,
} = branchSlice.actions;

export default branchSlice.reducer; 