import React, { useState } from 'react';
import FormInput from './FormInput';
import { 
  KG_PER_BAG, 
  calculateWeightFromBags, 
  calculateBagsFromWeight,
  validatePaddyData 
} from '../../utils/calculations';

const PaddyEntryDetails = ({ 
  paddyData, 
  onChange, 
  disabled = false,
  showLegend = true,
  className = "",
  gridCols = "grid-cols-1 md:grid-cols-2",
  enableAutoCalculation = true
}) => {
  const [isAutoCalculationEnabled, setIsAutoCalculationEnabled] = useState(enableAutoCalculation);
  const [validationErrors, setValidationErrors] = useState([]);

  const handlePaddyChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name.split('.')[1]; // Extract field name from "paddy.bags"
    const numericValue = parseFloat(value) || 0;
    
    let newPaddyData = {
      ...paddyData,
      [fieldName]: numericValue
    };

    // Auto-calculation logic
    if (isAutoCalculationEnabled) {
      if (fieldName === 'bags') {
        // When bags change, calculate weight
        newPaddyData.weight = calculateWeightFromBags(numericValue);
      } else if (fieldName === 'weight') {
        // When weight changes, calculate bags
        newPaddyData.bags = calculateBagsFromWeight(numericValue);
      }
    }
    
    // Validate the data
    const errors = validatePaddyData(newPaddyData);
    setValidationErrors(errors);
    
    onChange({
      target: {
        name: 'paddy',
        value: newPaddyData
      }
    });
  };

  const toggleAutoCalculation = () => {
    setIsAutoCalculationEnabled(!isAutoCalculationEnabled);
  };

  return (
    <fieldset className={`border border-gray-200 rounded p-4 ${className}`}>
      {showLegend && (
        <legend className="text-sm font-semibold text-gray-700 px-2">
          Paddy Details 
          {isAutoCalculationEnabled && <span className="text-xs text-gray-500">(1 bag = 500kg)</span>}
          {!enableAutoCalculation && <span className="text-xs text-blue-600">(auto-calculated from gunny)</span>}
        </legend>
      )}
      
      {/* Auto-calculation toggle */}
      {enableAutoCalculation && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoCalculation"
              checked={isAutoCalculationEnabled}
              onChange={toggleAutoCalculation}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="autoCalculation" className="text-sm text-gray-700">
              Enable auto-calculation
            </label>
          </div>
          {isAutoCalculationEnabled && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              ✓ Active
            </span>
          )}
        </div>
      )}
      
      <div className={`grid ${gridCols} gap-4`}>
        <FormInput
          label="Bags"
          name="paddy.bags"
          type="number"
          value={paddyData?.bags || 0}
          onChange={handlePaddyChange}
          icon="package"
          min="0"
          disabled={disabled || !enableAutoCalculation} // Disable when controlled by gunny
          placeholder="0"
        />
        <FormInput
          label="Weight (kg)"
          name="paddy.weight"
          type="number"
          value={paddyData?.weight || 0}
          onChange={handlePaddyChange}
          icon="scale"
          min="0"
          step="0.01"
          disabled={disabled}
          placeholder="0.00"
        />
      </div>
      
      {/* Calculation info */}
      {isAutoCalculationEnabled && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-800">
            <div className="font-medium mb-1">💡 Auto-calculation is active:</div>
            <ul className="space-y-1">
              <li>• Enter <strong>bags</strong> → Weight will be calculated (bags × 500kg)</li>
              <li>• Enter <strong>weight</strong> → Bags will be calculated (weight ÷ 500kg)</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Manual calculation info */}
      {!isAutoCalculationEnabled && enableAutoCalculation && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-600">
            <div className="font-medium mb-1">📝 Manual mode:</div>
            <div>You can enter bags and weight independently. Standard: 1 bag = 500kg</div>
          </div>
        </div>
      )}
      
      {/* Gunny-controlled info */}
      {!enableAutoCalculation && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-xs text-blue-800">
            <div className="font-medium mb-1">🎯 Auto-calculated from Gunny:</div>
            <div>Both bags and weight are automatically calculated from gunny count. Bags = Total Gunny, Weight = Bags × 500kg</div>
          </div>
        </div>
      )}
      
      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-xs text-red-800">
            <div className="font-medium mb-1">⚠️ Validation warnings:</div>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </fieldset>
  );
};

export default PaddyEntryDetails; 