import React from 'react';
import FormInput from './FormInput';
import { calculateTotalGunny } from '../../utils/calculations';

const GunnyEntryDetails = ({ 
  gunnyData, 
  onChange, 
  disabled = false,
  showLegend = true,
  className = "",
  gridCols = "grid-cols-2 md:grid-cols-4",
  enableAutoCalculation = true,
  onGunnyTotalChange = null // Callback to update bag count
}) => {
  const handleGunnyChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.split('.')[1]; // Extract field name from "gunny.nb"
    const numericValue = parseInt(value) || 0;
    
    const newGunnyData = {
      ...gunnyData,
      [fieldName]: numericValue,
    };

    // Calculate total gunny count
    const totalGunny = calculateTotalGunny(newGunnyData);
    
    // If auto-calculation is enabled and callback is provided, update bag count
    if (enableAutoCalculation && onGunnyTotalChange) {
      onGunnyTotalChange(totalGunny);
    }
    
    onChange({
      target: {
        name: 'gunny',
        value: newGunnyData,
      },
    });
  };

  return (
    <fieldset className={`border border-gray-200 rounded p-4 ${className}`}>
      {showLegend && (
        <legend className="text-sm font-semibold text-gray-700 px-2">
          Gunny Details (4 Varieties)
          {enableAutoCalculation && onGunnyTotalChange && (
            <span className="text-xs text-blue-600 ml-2">→ Auto-updates bags</span>
          )}
        </legend>
      )}
      
      {/* Total Gunny Count Display */}
      {enableAutoCalculation && onGunnyTotalChange && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <span className="font-medium">Total Gunny:</span> 
            <span className="ml-2 text-lg font-bold">
              {calculateTotalGunny(gunnyData)}
            </span>
            <span className="text-xs ml-2">(will update bag count automatically)</span>
          </div>
        </div>
      )}
      
      <div className={`grid ${gridCols} gap-4`}>
        <FormInput
          label="NB"
          name="gunny.nb"
          type="number"
          value={gunnyData?.nb || 0}
          onChange={handleGunnyChange}
          icon="package"
          min="0"
          disabled={disabled}
          placeholder="0"
        />
        <FormInput
          label="ONB"
          name="gunny.onb"
          type="number"
          value={gunnyData?.onb || 0}
          onChange={handleGunnyChange}
          icon="package"
          min="0"
          disabled={disabled}
          placeholder="0"
        />
        <FormInput
          label="SS"
          name="gunny.ss"
          type="number"
          value={gunnyData?.ss || 0}
          onChange={handleGunnyChange}
          icon="package"
          min="0"
          disabled={disabled}
          placeholder="0"
        />
        <FormInput
          label="SWP"
          name="gunny.swp"
          type="number"
          value={gunnyData?.swp || 0}
          onChange={handleGunnyChange}
          icon="package"
          min="0"
          disabled={disabled}
          placeholder="0"
        />
      </div>
    </fieldset>
  );
};

export default GunnyEntryDetails; 