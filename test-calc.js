// Test calculation functions
const KG_PER_BAG = 500;

const calculateWeightFromBags = (bags) => {
  return bags * KG_PER_BAG;
};

const calculateBagsFromWeight = (weight) => {
  return Math.round(weight / KG_PER_BAG);
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

console.log('\n🎉 All calculation tests completed!');
console.log('\n📝 Formula: 1 bag = 500kg');
console.log('📝 Auto-calculation is now active in PaddyEntryDetails component'); 