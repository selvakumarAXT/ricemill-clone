import React, { useState } from 'react';
import FormInput from './FormInput';
import BagWeightSelector from './BagWeightSelector';
import { 
  KG_PER_BAG, 
  calculateWeightFromBags, 
  calculateBagsFromWeight,
  validatePaddyData,
  formatWeight
} from '../../utils/calculations';

const PaddyEntryDetails = ({ 
  paddyData, 
  onChange, 
  disabled = false,
  showLegend = true,
  className = "",
  gridCols = "grid-cols-1 md:grid-cols-2",
  enableAutoCalculation = true,
  onBagWeightChange = null
}) => {
  const [isAutoCalculationEnabled, setIsAutoCalculationEnabled] = useState(enableAutoCalculation);
  const [validationErrors, setValidationErrors] = useState([]);
  const [currentBagWeight, setCurrentBagWeight] = useState(KG_PER_BAG);

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
        newPaddyData.weight = calculateWeightFromBags(numericValue, currentBagWeight);
      } else if (fieldName === 'weight') {
        // When weight changes, calculate bags
        newPaddyData.bags = calculateBagsFromWeight(numericValue, currentBagWeight);
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
    <fieldset className={`border border-border rounded p-4 ${className}`}>
      {showLegend && (
        <legend className="text-sm font-semibold text-foreground px-2">
          Paddy Details 
          {isAutoCalculationEnabled && <span className="text-xs text-muted-foreground">(1 bag = {currentBagWeight}kg = {(currentBagWeight/1000).toFixed(2)} tons)</span>}
          {!enableAutoCalculation && <span className="text-xs text-primary">(auto-calculated from gunny)</span>}
        </legend>
      )}
      
      {/* Auto-calculation toggle and bag weight selector */}
      {enableAutoCalculation && (
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoCalculation"
                checked={isAutoCalculationEnabled}
                onChange={toggleAutoCalculation}
                className="rounded border-input text-primary focus:ring-ring"
              />
              <label htmlFor="autoCalculation" className="text-sm text-foreground">
                Enable auto-calculation
              </label>
            </div>
            {isAutoCalculationEnabled && (
              <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                ✓ Active
              </span>
            )}
          </div>
          
          {/* Bag Weight Selector */}
          <BagWeightSelector
            value={currentBagWeight.toString()}
            onChange={(e) => setCurrentBagWeight(parseFloat(e.target.value))}
            label="Bag Weight"
            disabled={disabled}
            onWeightChange={(weight) => {
              setCurrentBagWeight(weight);
              // Call parent callback if provided
              if (onBagWeightChange) {
                onBagWeightChange(weight);
              }
              // Recalculate if auto-calculation is enabled
              if (isAutoCalculationEnabled && paddyData?.bags) {
                const newWeight = calculateWeightFromBags(paddyData.bags, weight);
                onChange({
                  target: {
                    name: 'paddy',
                    value: {
                      ...paddyData,
                      weight: newWeight
                    }
                  }
                });
              }
            }}
          />
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
          label="Weight (tons)"
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
        <div className="mt-3 p-3 bg-primary/10 rounded-lg">
          <div className="text-xs text-primary">
            <div className="font-medium mb-1">💡 Auto-calculation is active:</div>
            <ul className="space-y-1">
              <li>• Enter <strong>bags</strong> → Weight will be calculated (bags × {currentBagWeight}kg = {(currentBagWeight/1000).toFixed(2)} tons)</li>
              <li>• Enter <strong>weight</strong> → Bags will be calculated (weight ÷ {currentBagWeight}kg)</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Manual calculation info */}
      {!isAutoCalculationEnabled && enableAutoCalculation && (
        <div className="mt-3 p-3 bg-muted rounded-lg">
          <div className="text-xs text-muted-foreground">
            <div className="font-medium mb-1">📝 Manual mode:</div>
            <div>You can enter bags and weight independently. Current standard: 1 bag = {currentBagWeight}kg = {(currentBagWeight/1000).toFixed(2)} tons</div>
          </div>
        </div>
      )}
      
      {/* Gunny-controlled info */}
      {!enableAutoCalculation && (
        <div className="mt-3 p-3 bg-primary/10 rounded-lg">
          <div className="text-xs text-primary">
            <div className="font-medium mb-1">🎯 Auto-calculated from Gunny:</div>
            <div>Both bags and weight are automatically calculated from gunny count. Bags = Total Gunny, Weight = Bags × {currentBagWeight}kg = {(currentBagWeight/1000).toFixed(2)} tons</div>
          </div>
        </div>
      )}
      
      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-lg">
          <div className="text-xs text-destructive">
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