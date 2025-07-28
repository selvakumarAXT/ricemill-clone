# Batch Management System

This document explains how the batch management system works in the Rice Mill application.

## Overview

The batch management system allows you to automatically include a `batchId` in all API requests. This is useful for organizing data by production batches or time periods.

## How It Works

### 1. Redux Store
- The batch state is managed in Redux (`store/slices/batchSlice.js`)
- Current batchId is persisted in localStorage
- Available batches are stored in the Redux state

### 2. API Integration
- All API requests automatically include the current `batchId`
- GET requests: `batchId` is added as a query parameter
- POST/PUT requests: `batchId` is added to the request body
- The `createAxiosInstance()` function handles this automatically

### 3. Components

#### BatchSelector
- Located in the navbar
- Allows users to select the current batch
- Automatically sets the batch in Redux store

#### BatchInfo
- Displays current batch information
- Shows warning if no batch is selected
- Can be used in any component to show batch status

## Usage

### In Components

```jsx
import { useBatch } from '../hooks/useBatch';

const MyComponent = () => {
  const { currentBatchId, setBatch, clearBatch } = useBatch();
  
  return (
    <div>
      <p>Current Batch: {currentBatchId}</p>
      <button onClick={() => setBatch('batch-001')}>
        Set Batch
      </button>
    </div>
  );
};
```

### In API Services

All API services now automatically include the batchId:

```jsx
// This will automatically include batchId in the request
const response = await createAxiosInstance().get('/paddy');
```

### Manual Override

If you need to make a request without batchId:

```jsx
import { createAxiosInstanceWithoutBatch } from '../utils/apiUtils';

// This request won't include batchId
const response = await createAxiosInstanceWithoutBatch().get('/paddy');
```

## Configuration

### Setting Default Batch

You can set a default batch in the BatchSelector component:

```jsx
// In BatchSelector.jsx
useEffect(() => {
  if (!currentBatchId && mockBatches.length > 0) {
    dispatch(setCurrentBatchId(mockBatches[0].id));
  }
}, [dispatch, currentBatchId]);
```

### Custom Batch Logic

You can implement custom batch logic by modifying the `getCurrentBatchId()` function in `utils/batchUtils.js`.

## Backend Integration

Make sure your backend API endpoints can handle the `batchId` parameter:

- GET requests: Check for `batchId` in query parameters
- POST/PUT requests: Check for `batchId` in request body
- Filter data based on the provided `batchId`

## Example Backend Handler

```javascript
// Express.js example
app.get('/api/paddy', (req, res) => {
  const { batchId } = req.query;
  
  let query = {};
  if (batchId) {
    query.batchId = batchId;
  }
  
  Paddy.find(query)
    .then(data => res.json(data))
    .catch(err => res.status(500).json(err));
});
```

## Benefits

1. **Automatic**: No need to manually add batchId to each request
2. **Consistent**: All requests use the same batchId
3. **Flexible**: Easy to change batch for different operations
4. **Persistent**: Batch selection survives page refreshes
5. **Centralized**: Single source of truth for current batch

## Future Enhancements

- Batch creation/management interface
- Batch-specific permissions
- Batch reporting and analytics
- Batch export functionality 