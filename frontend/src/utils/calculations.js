// Calculation constants
export const KG_PER_BAG = 50;

// Paddy calculations
export const calculateWeightFromBags = (bags, kgPerBag = KG_PER_BAG) => {
  return bags * kgPerBag;
};

export const calculateBagsFromWeight = (weight, kgPerBag = KG_PER_BAG) => {
  return Math.round(weight / kgPerBag);
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

// Convert weight from kg to tons
export const convertKgToTons = (weightInKg) => {
  if (!weightInKg || weightInKg === 0) return 0;
  return (weightInKg / 1000).toFixed(2);
};

// Format weight display with proper unit
export const formatWeight = (weightInKg, unit = 'tons') => {
  if (!weightInKg || weightInKg === 0) return '0 tons';
  
  if (unit === 'tons') {
    const tons = convertKgToTons(weightInKg);
    return `${tons} tons`;
  }
  
  return `${weightInKg} kg`;
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

// Date formatting utilities
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN');
};

// Currency formatting utilities
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  return new Intl.NumberFormat('en-IN').format(number);
}; 