import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentBranchId: localStorage.getItem("currentBranchId") || null,
  availableBranches: [],
  isLoading: false,
  error: null,
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
  },
});

export const {
  setCurrentBranchId,
  clearCurrentBranchId,
  setAvailableBranches,
  setLoading,
  setError,
} = branchSlice.actions;

export default branchSlice.reducer; 