import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import branchSlice from './slices/branchSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    branch: branchSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store; 