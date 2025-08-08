# Branch Filter Implementation Guide

## Overview

This guide provides a comprehensive overview of branch filtering implementation across all modules in the Rice Mill Management System. Branch filtering ensures that users can view and manage data specific to their assigned branches while maintaining proper access control.

## Current Implementation Status

### ✅ Modules with Branch Filtering Implemented

1. **Dashboard** - Uses `currentBranchId` for data filtering
2. **Production** - Has BranchFilter component with local state
3. **Paddy Management** - Has BranchFilter component
4. **Rice Management** - Has BranchFilter component
5. **Inventory** - Has BranchFilter component with local state
6. **Gunny Management** - Has BranchFilter component with local state
7. **Sales & Dispatch** - Has BranchFilter component
8. **QC Data Entry** - Has BranchFilter component
9. **Financial Ledger** - Has BranchFilter component
10. **EB Meter Calculation** - Has BranchFilter component
11. **Vendor Management** - Has BranchFilter component
12. **Document Uploads** - Has BranchFilter component
13. **User Management** - Has custom branch filtering logic
14. **Branch Management** - Has custom branch filtering logic
15. **Reports** - ✅ **Recently Added** - Now has BranchFilter component

### ❌ Modules Without Branch Filtering

1. **Settings** - User-specific module, no branch filtering needed

## Branch Filter Component

### Location
`frontend/src/components/common/BranchFilter.jsx`

### Key Features

1. **Role-Based Access Control**:
   - Superadmin users can see and filter all branches
   - Non-superadmin users only see their assigned branch
   - Filter is disabled when a specific branch is selected in sidebar

2. **Redux Integration**:
   - Uses `currentBranchId` from Redux store
   - Updates Redux store when branch selection changes
   - Integrates with sidebar branch selection

3. **Smart Filtering Logic**:
   - Shows all branches when "All Branches" is selected in sidebar
   - Shows only current branch when specific branch is selected
   - Disables filter when locked to specific branch

### Usage Example

```jsx
import BranchFilter from '../components/common/BranchFilter';

// In component
const [branchFilter, setBranchFilter] = useState('');

// In JSX
<BranchFilter
  value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
  onChange={(e) => setBranchFilter(e.target.value)}
/>
```

## Implementation Patterns

### Pattern 1: Standard Branch Filter (Most Common)

Used in: Production, Inventory, Gunny Management, Sales & Dispatch, etc.

```jsx
import BranchFilter from '../components/common/BranchFilter';
import ResponsiveFilters from '../components/common/ResponsiveFilters';

const [branchFilter, setBranchFilter] = useState('');

// In JSX
<ResponsiveFilters title="Filters & Search" className="mb-6">
  <TableFilters
    searchValue={searchFilter}
    onSearchChange={(e) => setSearchFilter(e.target.value)}
  />
  <BranchFilter
    value={currentBranchId && currentBranchId !== 'all' ? currentBranchId : branchFilter}
    onChange={(e) => setBranchFilter(e.target.value)}
  />
</ResponsiveFilters>

// In data filtering
const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' 
  ? currentBranchId 
  : branchFilter;

const filteredData = data.filter(item => 
  !effectiveBranchFilter || item.branch_id === effectiveBranchFilter
);
```

### Pattern 2: Custom Branch Filtering (User/Branch Management)

Used in: User Management, Branch Management

```jsx
// Custom state for branch filtering
const [userBranchFilter, setUserBranchFilter] = useState("");

// Effective branch filter logic
const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' 
  ? currentBranchId 
  : userBranchFilter;

// Filtering logic
const matchesBranch = effectiveBranchFilter
  ? item.branch_id && (item.branch_id._id === effectiveBranchFilter || item.branch_id.id === effectiveBranchFilter)
  : true;
```

### Pattern 3: Redux-Only Branch Filtering (Dashboard)

Used in: Dashboard, Reports

```jsx
// Uses only currentBranchId from Redux
const { currentBranchId } = useSelector((state) => state.branch);

// Data filtering
const filteredData = data.filter(item => 
  !currentBranchId || currentBranchId === 'all' || item.branch_id === currentBranchId
);
```

## Branch Filter Logic

### Effective Branch Filter Calculation

```javascript
// Standard pattern used across modules
const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' 
  ? currentBranchId 
  : branchFilter;
```

### Data Filtering Examples

```javascript
// For arrays of objects with branch_id
const filteredData = data.filter(item => 
  !effectiveBranchFilter || item.branch_id === effectiveBranchFilter
);

// For arrays of objects with nested branch information
const filteredData = data.filter(item => 
  !effectiveBranchFilter || 
  item.branch_id._id === effectiveBranchFilter || 
  item.branch_id.id === effectiveBranchFilter
);

// For objects with branch property
const filteredData = data.filter(item => 
  !effectiveBranchFilter || item.branch === effectiveBranchFilter
);
```

## Redux Integration

### Branch Slice
Location: `frontend/src/store/slices/branchSlice.js`

```javascript
import { createSlice } from '@reduxjs/toolkit';

const branchSlice = createSlice({
  name: 'branch',
  initialState: {
    currentBranchId: null,
    branches: []
  },
  reducers: {
    setCurrentBranchId: (state, action) => {
      state.currentBranchId = action.payload;
    },
    setBranches: (state, action) => {
      state.branches = action.payload;
    }
  }
});

export const { setCurrentBranchId, setBranches } = branchSlice.actions;
export default branchSlice.reducer;
```

### Usage in Components

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentBranchId } from '../store/slices/branchSlice';

const { currentBranchId } = useSelector((state) => state.branch);
const dispatch = useDispatch();

// Update branch selection
dispatch(setCurrentBranchId(branchId));
```

## Sidebar Integration

### Branch Selection in Sidebar
Location: `frontend/src/components/Layout/Sidebar.jsx`

```javascript
const handleBranchSelect = (branchId) => {
  dispatch(setCurrentBranchId(branchId));
};

// Branch options
<li key="all-branches">
  <button
    className={`w-full text-left px-2 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${!currentBranchId ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
    onClick={() => handleBranchSelect('')}
  >
    All Branches
  </button>
</li>
```

## API Integration

### Backend Branch Filtering

When making API calls, include branch filtering:

```javascript
// In service files
const getData = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // Add branch filter if specified
  if (params.branchId) {
    queryParams.append('branchId', params.branchId);
  }
  
  const url = queryParams.toString() ? `${BASE_URL}?${queryParams.toString()}` : BASE_URL;
  const response = await api.get(url);
  return response.data;
};
```

### Frontend API Calls

```javascript
// In components
const fetchData = async () => {
  const effectiveBranchFilter = currentBranchId && currentBranchId !== 'all' 
    ? currentBranchId 
    : branchFilter;
    
  const response = await dataService.getData({
    branchId: effectiveBranchFilter,
    // other params...
  });
  setData(response.data);
};
```

## Testing Branch Filtering

### Test Cases

1. **Superadmin User**:
   - Can see all branches in filter
   - Can switch between branches
   - Can select "All Branches"

2. **Non-Superadmin User**:
   - Only sees their assigned branch
   - Filter is disabled when specific branch is selected
   - Cannot switch to other branches

3. **Data Filtering**:
   - Data is filtered correctly based on selected branch
   - "All Branches" shows data from all branches
   - Specific branch shows only that branch's data

### Test Data

```javascript
// Mock data for testing
const mockData = [
  { id: 1, name: 'Item 1', branch_id: 'branch1' },
  { id: 2, name: 'Item 2', branch_id: 'branch2' },
  { id: 3, name: 'Item 3', branch_id: 'branch1' }
];

const mockBranches = [
  { _id: 'branch1', name: 'Branch 1', millCode: 'B001' },
  { _id: 'branch2', name: 'Branch 2', millCode: 'B002' }
];
```

## Common Issues and Solutions

### Issue 1: Branch Filter Not Working
**Solution**: Check if `effectiveBranchFilter` is calculated correctly and used in data filtering.

### Issue 2: Filter Disabled Unexpectedly
**Solution**: Verify that `currentBranchId` is set correctly and the filter logic matches the sidebar selection.

### Issue 3: Data Not Filtering Correctly
**Solution**: Ensure the data structure matches the filtering logic (branch_id vs branch vs branchId).

### Issue 4: Redux State Not Updating
**Solution**: Check if the branch slice is properly configured in the store and the component is connected.

## Best Practices

1. **Consistent Naming**: Use `branchFilter` for local state and `currentBranchId` for Redux state
2. **Effective Filter Logic**: Always use the `effectiveBranchFilter` pattern for consistency
3. **Error Handling**: Handle cases where branch data might be missing or undefined
4. **Performance**: Consider memoizing filtered data for large datasets
5. **Accessibility**: Ensure branch filter is accessible to screen readers

## Future Enhancements

1. **Multi-Branch Selection**: Allow selecting multiple branches for comparison
2. **Branch-Specific Settings**: Store user preferences per branch
3. **Branch Analytics**: Add branch-specific analytics and reporting
4. **Branch Templates**: Allow creating templates for new branches
5. **Branch Permissions**: Granular permissions per branch

---

**Note**: This guide ensures consistent branch filtering implementation across all modules while maintaining proper access control and user experience. 