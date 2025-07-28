# Backend Batch Management Implementation

This document explains the backend implementation of the batch management system for the Rice Mill application.

## Overview

The backend now supports batch-based data filtering across all relevant APIs. Each record (Paddy, Gunny, Production) is associated with a batchId, allowing for organized data management by production batches.

## Database Schema Changes

### 1. New Models

#### Batch Model (`models/Batch.js`)
```javascript
{
  batchId: String (required, unique),
  name: String (required),
  description: String,
  startDate: Date (required),
  endDate: Date,
  isActive: Boolean (default: true),
  branch_id: ObjectId (required),
  createdBy: ObjectId (required),
  timestamps: true
}
```

### 2. Updated Models

#### Paddy Model
- Added `batchId: String (required)`
- Added indexes for `batchId` and `branch_id + batchId`

#### Gunny Model
- Added `batchId: String (required)`

#### Production Model
- Added `batchId: String (required)`

## API Endpoints

### Batch Management APIs

#### GET `/api/batches`
- Get all batches for current branch
- Query params: `isActive` (boolean)
- Response: Array of batch objects

#### GET `/api/batches/active`
- Get only active batches for current branch
- Response: Array of active batch objects

#### GET `/api/batches/:id`
- Get specific batch by ID
- Response: Single batch object

#### POST `/api/batches`
- Create new batch
- Required fields: `batchId`, `name`, `startDate`
- Response: Created batch object

#### PUT `/api/batches/:id`
- Update existing batch
- Response: Updated batch object

#### DELETE `/api/batches/:id`
- Delete batch
- Response: Success message

### Updated APIs with Batch Filtering

#### Paddy APIs
- `GET /api/paddy` - Now accepts `batchId` query parameter
- `POST /api/paddy` - Now requires `batchId` in request body
- `GET /api/paddy/stats` - Now accepts `batchId` query parameter

#### Gunny APIs
- `GET /api/gunny` - Now accepts `batchId` query parameter
- `POST /api/gunny` - Now requires `batchId` in request body
- `GET /api/gunny/stats` - Now accepts `batchId` query parameter

#### Production APIs
- `GET /api/production` - Now accepts `batchId` query parameter

## Controller Changes

### Paddy Controller
```javascript
// GET /api/paddy
const getAllPaddy = asyncHandler(async (req, res) => {
  const { batchId } = req.query;
  const query = { branch_id };
  
  if (batchId) {
    query.batchId = batchId;
  }
  // ... rest of the function
});

// POST /api/paddy
const createPaddy = asyncHandler(async (req, res) => {
  const { batchId } = req.body;
  
  if (!batchId) {
    res.status(400);
    throw new Error('batchId is required');
  }
  // ... rest of the function
});
```

### Gunny Controller
```javascript
// GET /api/gunny
const getAllGunny = async (req, res) => {
  const { batchId } = req.query;
  const query = { branch_id };
  
  if (batchId) {
    query.batchId = batchId;
  }
  // ... rest of the function
};
```

### Production Controller
```javascript
// GET /api/production
exports.getAllProduction = async (req, res) => {
  // ... existing branch filtering logic
  
  if (req.query.batchId) {
    branchFilter.batchId = req.query.batchId;
  }
  // ... rest of the function
};
```

## Database Indexes

### Paddy Collection
- `{ branch_id: 1, issueDate: -1 }`
- `{ createdBy: 1 }`
- `{ paddyVariety: 1 }`
- `{ batchId: 1 }` (NEW)
- `{ branch_id: 1, batchId: 1 }` (NEW)

### Batch Collection
- `{ batchId: 1 }`
- `{ branch_id: 1 }`
- `{ isActive: 1 }`
- `{ branch_id: 1, isActive: 1 }`

## Validation Rules

### Batch Creation/Update
1. `batchId` must be unique within a branch
2. `name` and `startDate` are required
3. `endDate` is optional
4. `isActive` defaults to true

### Data Records (Paddy, Gunny, Production)
1. `batchId` is required for all new records
2. `batchId` must exist in the Batch collection for the same branch

## Error Handling

### Common Error Responses
```javascript
// Missing batchId
{
  "success": false,
  "message": "batchId is required"
}

// Invalid batchId
{
  "success": false,
  "message": "Batch not found"
}

// Duplicate batchId
{
  "success": false,
  "message": "Batch ID already exists for this branch"
}
```

## Seeding Data

### Run Batch Seed Script
```bash
cd backend
node seedBatchData.js
```

This will create sample batches:
- BATCH-2024-001: January 2024 - Winter Season
- BATCH-2024-002: February 2024 - Late Winter
- BATCH-2024-003: March 2024 - Spring Season
- BATCH-2024-004: April 2024 - Summer Prep (inactive)

## Security Considerations

1. **Branch Isolation**: Users can only access batches from their assigned branch
2. **Authentication Required**: All batch endpoints require authentication
3. **Validation**: Server-side validation for all batch operations
4. **Authorization**: Only authorized users can create/update/delete batches

## Performance Considerations

1. **Indexes**: Proper indexes on `batchId` and `branch_id + batchId`
2. **Query Optimization**: Efficient queries using compound indexes
3. **Pagination**: Support for pagination in batch listing APIs

## Migration Notes

### For Existing Data
If you have existing data without batchId:

1. Create batches first using the batch APIs
2. Update existing records to include batchId
3. Consider creating a migration script for bulk updates

### Example Migration Script
```javascript
// Update existing paddy records with default batch
const defaultBatch = await Batch.findOne({ branch_id, isActive: true });
if (defaultBatch) {
  await Paddy.updateMany(
    { batchId: { $exists: false } },
    { batchId: defaultBatch.batchId }
  );
}
```

## Testing

### API Testing Examples
```bash
# Get all batches
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/batches

# Get paddy records for specific batch
curl -H "Authorization: Bearer <token>" "http://localhost:3001/api/paddy?batchId=BATCH-2024-001"

# Create new batch
curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"batchId":"BATCH-2024-005","name":"May 2024","startDate":"2024-05-01"}' \
  http://localhost:3001/api/batches
```

## Future Enhancements

1. **Batch Templates**: Predefined batch configurations
2. **Batch Analytics**: Statistics and reporting by batch
3. **Batch Transitions**: Automatic batch switching based on dates
4. **Batch Archiving**: Archive old batches for performance
5. **Batch Permissions**: Fine-grained permissions per batch 