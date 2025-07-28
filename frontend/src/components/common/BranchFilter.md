# BranchFilter Component

A reusable component for filtering data by branch across all tables in the Rice Mill application.

## Features

- **Role-Based Access Control**: Only shows for superadmin users
- **Automatic Branch Fetching**: Fetches branches based on user role
- **Consistent UI**: Uses the same TableFilters component for consistency
- **Reusable**: Can be used across all pages that need branch filtering

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | `''` | Current selected branch ID |
| `onChange` | function | required | Callback when branch selection changes |
| `placeholder` | string | `'All Branches'` | Placeholder text for the select dropdown |
| `className` | string | `''` | Additional CSS classes |
| `showLabel` | boolean | `true` | Whether to show the "Branch" label |
| `label` | string | `'Branch'` | Custom label text |

## Usage Examples

### Basic Usage
```jsx
import BranchFilter from '../components/common/BranchFilter';

const [branchFilter, setBranchFilter] = useState('');

<BranchFilter
  value={branchFilter}
  onChange={(e) => setBranchFilter(e.target.value)}
/>
```

### With Custom Placeholder
```jsx
<BranchFilter
  value={branchFilter}
  onChange={(e) => setBranchFilter(e.target.value)}
  placeholder="Select Branch"
/>
```

### Without Label
```jsx
<BranchFilter
  value={branchFilter}
  onChange={(e) => setBranchFilter(e.target.value)}
  showLabel={false}
/>
```

### With Custom Label
```jsx
<BranchFilter
  value={branchFilter}
  onChange={(e) => setBranchFilter(e.target.value)}
  label="Mill Location"
/>
```

## Behavior

### For Superadmin Users
- Shows all available branches
- Displays branch name and mill code
- Allows filtering by any branch

### For Non-Superadmin Users
- Component doesn't render (returns null)
- Users only see data from their assigned branch

### Branch Data Format
```javascript
{
  value: branch._id,
  label: `${branch.name} (${branch.millCode})`
}
```

## Integration with Filtering Logic

When using this component, update your filtering logic to include branch filtering:

```javascript
const filteredData = data.filter(item => {
  // Other filters...
  const matchesBranch = !branchFilter || item.branch_id === branchFilter;
  
  return matchesOtherFilters && matchesBranch;
});
```

## Dependencies

- `react-redux`: For accessing user state
- `branchService`: For fetching branch data
- `TableFilters`: For consistent UI

## Error Handling

- Gracefully handles API errors when fetching branches
- Falls back to empty array if branch fetching fails
- Logs errors to console for debugging 