import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import CreatableSelect from './CreatableSelect';
import { 
  getBagWeightOptions, 
  createBagWeightOption, 
  formatBagWeightOptions,
  getDefaultBagWeightOption 
} from '../../services/bagWeightOptionService';

const BagWeightSelector = ({
  value,
  onChange,
  label = "Bag Weight (kg)",
  required = false,
  disabled = false,
  className = "",
  onWeightChange = null, // Callback when weight changes
}) => {
  const { currentBranchId } = useSelector((state) => state.branch);
  const [bagWeightOptions, setBagWeightOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load bag weight options from API
  useEffect(() => {
    const fetchBagWeightOptions = async () => {
      if (!currentBranchId) {
        console.log('⚠️ No currentBranchId, skipping fetch');
        return;
      }
      
      console.log('🔄 Fetching bag weight options for branch:', currentBranchId);
      console.log('🔑 Auth token exists:', !!localStorage.getItem('token'));
      setLoading(true);
      try {
        const response = await getBagWeightOptions(currentBranchId);
        console.log('📦 Bag weight options response:', response);
        if (response.success) {
          const formattedOptions = formatBagWeightOptions(response.data);
          console.log('✅ Formatted options:', formattedOptions);
          setBagWeightOptions(formattedOptions);
        }
      } catch (error) {
        console.error('❌ Error fetching bag weight options:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error response:', error.response);
        console.error('❌ Error status:', error.response?.status);
        console.error('❌ Error data:', error.response?.data);
        // Fallback to default options
        setBagWeightOptions([
          { value: '40', label: '40 kg' },
          { value: '45', label: '45 kg' },
          { value: '50', label: '50 kg' },
          { value: '55', label: '55 kg' },
          { value: '60', label: '60 kg' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchBagWeightOptions();
  }, [currentBranchId]);

  // Handle new option creation
  const handleOptionCreate = async (newOption) => {
    // Validate the new weight value
    const weightValue = parseFloat(newOption.value);
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 100) {
      alert('Please enter a valid weight between 1 and 100 kg');
      return;
    }

    try {
      // Create new bag weight option via API
      const response = await createBagWeightOption({
        weight: weightValue,
        label: `${weightValue} kg`
      });

      if (response.success) {
        // Refresh the options list
        const updatedResponse = await getBagWeightOptions(currentBranchId);
        if (updatedResponse.success) {
          const formattedOptions = formatBagWeightOptions(updatedResponse.data);
          setBagWeightOptions(formattedOptions);
        }

        // Call callback if provided
        if (onWeightChange) {
          onWeightChange(weightValue);
        }
      }
    } catch (error) {
      console.error('Error creating bag weight option:', error);
      alert(error.message || 'Failed to create bag weight option');
    }
  };

  // Handle weight selection
  const handleWeightChange = (e) => {
    onChange(e);
    
    // Call callback if provided
    if (onWeightChange) {
      onWeightChange(parseFloat(e.target.value));
    }
  };

  return (
    <CreatableSelect
      label={label}
      name="bagWeight"
      value={value}
      onChange={handleWeightChange}
      options={bagWeightOptions}
      placeholder={loading ? "Loading..." : "Select or enter bag weight..."}
      required={required}
      disabled={disabled || loading}
      className={className}
      allowCreate={true}
      maxLength={10}
      onOptionCreate={handleOptionCreate}
    />
  );
};

export default BagWeightSelector; 