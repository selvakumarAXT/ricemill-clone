// Calculation constants
export const KG_PER_BAG = 500;

// Paddy calculations
export const calculateWeightFromBags = (bags) => {
  return bags * KG_PER_BAG;
};

export const calculateBagsFromWeight = (weight) => {
  return Math.round(weight / KG_PER_BAG);
};

// Gunny calculations
export const calculateTotalGunny = (gunnyData) => {
  if (!gunnyData) return 0;
  return (
    (parseInt(gunnyData.nb) || 0) +
    (parseInt(gunnyData.onb) || 0) +
    (parseInt(gunnyData.ss) || 0) +
    (parseInt(gunnyData.swp) || 0)
  );
};

// Update bag count based on gunny total
export const updateBagsFromGunny = (gunnyData) => {
  return calculateTotalGunny(gunnyData);
};

// Format weight for display
export const formatWeight = (weight) => {
  return `${weight.toLocaleString()} kg`;
};

// Format bags for display
export const formatBags = (bags) => {
  return `${bags.toLocaleString()} bags`;
};

// Validate paddy data
export const validatePaddyData = (paddyData) => {
  const errors = [];
  
  if (paddyData.bags < 0) {
    errors.push('Bags cannot be negative');
  }
  
  if (paddyData.weight < 0) {
    errors.push('Weight cannot be negative');
  }
  
  // Check if the ratio is reasonable (allow some tolerance)
  if (paddyData.bags > 0 && paddyData.weight > 0) {
    const ratio = paddyData.weight / paddyData.bags;
    if (ratio < 400 || ratio > 600) {
      errors.push('Weight per bag should be around 500kg (400-600kg range)');
    }
  }
  
  return errors;
}; 