# Reusable Components Documentation

## GunnyEntryDetails Component

A reusable component for entering gunny details with 4 varieties (NB, ONB, SS, SWP) with optional auto-calculation.

### Usage

```jsx
import GunnyEntryDetails from '../components/common/GunnyEntryDetails';

// In your component
const [gunnyData, setGunnyData] = useState({
  nb: 0,
  onb: 0,
  ss: 0,
  swp: 0
});

const handleFormChange = (e) => {
  if (e.target.name === 'gunny') {
    setGunnyData(e.target.value);
  }
  // Handle other form fields...
};

// Handle gunny total change to update bag count
const handleGunnyTotalChange = (totalGunny) => {
  setPaddyForm(prev => ({
    ...prev,
    paddy: {
      ...prev.paddy,
      bags: totalGunny // Set bag count equal to total gunny count
    }
  }));
};

// In your JSX
<GunnyEntryDetails
  gunnyData={gunnyData}
  onChange={handleFormChange}
  enableAutoCalculation={true}
  onGunnyTotalChange={handleGunnyTotalChange}
  disabled={false}
  showLegend={true}
  className=""
  gridCols="grid-cols-2 md:grid-cols-4"
/>
```

### Auto-Calculation Features

- **Total Gunny Count**: Automatically calculates total of all 4 varieties
- **Bag Count Update**: Can automatically update bag count based on total gunny
- **Visual Feedback**: Shows total gunny count and auto-update status
- **Flexible**: Can be used with or without auto-calculation

### Props

- `gunnyData` (object): The gunny data object with nb, onb, ss, swp properties
- `onChange` (function): Callback function when any gunny field changes
- `disabled` (boolean, optional): Whether the fields are disabled (default: false)
- `showLegend` (boolean, optional): Whether to show the fieldset legend (default: true)
- `className` (string, optional): Additional CSS classes
- `gridCols` (string, optional): CSS grid classes for layout (default: "grid-cols-2 md:grid-cols-4")
- `enableAutoCalculation` (boolean, optional): Whether to enable auto-calculation features (default: true)
- `onGunnyTotalChange` (function, optional): Callback when total gunny count changes (for updating bag count)

## PaddyEntryDetails Component

A reusable component for entering paddy details (bags and weight) with automatic calculation.

### Usage

```jsx
import PaddyEntryDetails from '../components/common/PaddyEntryDetails';

// In your component
const [paddyData, setPaddyData] = useState({
  bags: 0,
  weight: 0
});

const handleFormChange = (e) => {
  if (e.target.name === 'paddy') {
    setPaddyData(e.target.value);
  }
  // Handle other form fields...
};

// In your JSX
<PaddyEntryDetails
  paddyData={paddyData}
  onChange={handleFormChange}
  disabled={false}
  showLegend={true}
  className=""
  gridCols="grid-cols-1 md:grid-cols-2"
  enableAutoCalculation={true}
/>
```

### Auto-Calculation Features

- **Formula**: 1 bag = 500kg
- **Bags → Weight**: Enter bags, weight is automatically calculated
- **Weight → Bags**: Enter weight, bags are automatically calculated
- **Toggle**: Users can enable/disable auto-calculation
- **Validation**: Warns if weight per bag is outside reasonable range (400-600kg)

### Props

- `paddyData` (object): The paddy data object with bags and weight properties
- `onChange` (function): Callback function when any paddy field changes
- `disabled` (boolean, optional): Whether the fields are disabled (default: false)
- `showLegend` (boolean, optional): Whether to show the fieldset legend (default: true)
- `className` (string, optional): Additional CSS classes
- `gridCols` (string, optional): CSS grid classes for layout (default: "grid-cols-1 md:grid-cols-2")
- `enableAutoCalculation` (boolean, optional): Whether to enable auto-calculation features (default: true)

## Complete Example

```jsx
import React, { useState } from 'react';
import GunnyEntryDetails from '../components/common/GunnyEntryDetails';
import PaddyEntryDetails from '../components/common/PaddyEntryDetails';

const MyForm = () => {
  const [formData, setFormData] = useState({
    issueDate: '',
    issueMemo: '',
    lorryNumber: '',
    paddyFrom: '',
    paddyVariety: '',
    gunny: {
      nb: 0,
      onb: 0,
      ss: 0,
      swp: 0
    },
    paddy: {
      bags: 0,
      weight: 0
    }
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle gunny total change to update bag count
  const handleGunnyTotalChange = (totalGunny) => {
    setFormData(prev => ({
      ...prev,
      paddy: {
        ...prev.paddy,
        bags: totalGunny // Set bag count equal to total gunny count
      }
    }));
  };

  return (
    <form>
      {/* Other form fields */}
      
      <GunnyEntryDetails
        gunnyData={formData.gunny}
        onChange={handleFormChange}
        enableAutoCalculation={true}
        onGunnyTotalChange={handleGunnyTotalChange}
      />
      
      <PaddyEntryDetails
        paddyData={formData.paddy}
        onChange={handleFormChange}
        enableAutoCalculation={false} // Disable since bags are controlled by gunny
      />
      
      {/* Submit button */}
    </form>
  );
};
```

## Benefits

1. **Reusability**: Use the same components across different pages
2. **Consistency**: Maintain consistent UI/UX across the application
3. **Maintainability**: Update logic in one place
4. **Flexibility**: Customizable through props
5. **Type Safety**: Clear prop interfaces 