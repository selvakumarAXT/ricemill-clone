// Test calculation functions (simplified version)
const KG_PER_BAG = 500;

const calculateWeightFromBags = (bags) => {
  return bags * KG_PER_BAG;
};

const calculateBagsFromWeight = (weight) => {
  return Math.round(weight / KG_PER_BAG);
};

const validatePaddyData = (paddyData) => {
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

console.log('🧪 Testing Paddy Calculation Functions...\n');

// Test 1: Calculate weight from bags
console.log('1. Testing calculateWeightFromBags:');
console.log(`   2 bags = ${calculateWeightFromBags(2)} kg`);
console.log(`   5 bags = ${calculateWeightFromBags(5)} kg`);
console.log(`   10 bags = ${calculateWeightFromBags(10)} kg`);

// Test 2: Calculate bags from weight
console.log('\n2. Testing calculateBagsFromWeight:');
console.log(`   1000 kg = ${calculateBagsFromWeight(1000)} bags`);
console.log(`   2500 kg = ${calculateBagsFromWeight(2500)} bags`);
console.log(`   5000 kg = ${calculateBagsFromWeight(5000)} bags`);

// Test 3: Validation
console.log('\n3. Testing validatePaddyData:');
const testCases = [
  { bags: 2, weight: 1000, description: 'Valid data (2 bags, 1000kg)' },
  { bags: 2, weight: 2000, description: 'Invalid ratio (2 bags, 2000kg)' },
  { bags: -1, weight: 500, description: 'Negative bags' },
  { bags: 0, weight: 0, description: 'Zero values' }
];

testCases.forEach(testCase => {
  const errors = validatePaddyData(testCase);
  console.log(`   ${testCase.description}: ${errors.length > 0 ? '❌ ' + errors.join(', ') : '✅ Valid'}`);
});

console.log('\n🎉 All calculation tests completed!');
console.log('\n📝 Formula: 1 bag = 500kg');
console.log('📝 Auto-calculation is now active in PaddyEntryDetails component'); 