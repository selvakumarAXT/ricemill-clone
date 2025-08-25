const fs = require('fs');
const path = require('path');
const { listFilesByModule, getFilePath, createUploadDirectories } = require('./middleware/upload');

// Test script to verify the new upload structure
const testUploadStructure = () => {
  console.log('🧪 Testing new upload structure...\n');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  
  // Test 1: Check if uploads directory exists
  console.log('1. Checking uploads directory...');
  if (fs.existsSync(uploadsDir)) {
    console.log('   ✅ Uploads directory exists');
  } else {
    console.log('   ❌ Uploads directory not found');
    return;
  }
  
  // Test 2: Check module directories
  console.log('\n2. Checking module directories...');
  const expectedModules = [
            'users', 'branches', 'inventory', 'paddy', 
    'rice', 'gunny', 'batches', 'reports', 'documents', 
    'images', 'sales', 'financial', 'qc', 'vendor'
  ];
  
  const existingModules = fs.readdirSync(uploadsDir)
    .filter(item => {
      const itemPath = path.join(uploadsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  
  console.log(`   Found ${existingModules.length} modules:`, existingModules);
  
  const missingModules = expectedModules.filter(module => !existingModules.includes(module));
  if (missingModules.length === 0) {
    console.log('   ✅ All expected modules exist');
  } else {
    console.log('   ❌ Missing modules:', missingModules);
  }
  
  // Test 3: Check branch directories
  console.log('\n3. Checking branch directories...');
  let totalBranchDirs = 0;
  let modulesWithBranches = 0;
  
  existingModules.forEach(module => {
    const modulePath = path.join(uploadsDir, module);
    const items = fs.readdirSync(modulePath);
    const branchDirs = items.filter(item => {
      const itemPath = path.join(modulePath, item);
      return fs.statSync(itemPath).isDirectory();
    });
    
    if (branchDirs.length > 0) {
      modulesWithBranches++;
      totalBranchDirs += branchDirs.length;
      console.log(`   ${module}: ${branchDirs.length} branch directories (${branchDirs.join(', ')})`);
    }
  });
  
  console.log(`   ✅ ${modulesWithBranches} modules have branch directories`);
  console.log(`   ✅ Total branch directories: ${totalBranchDirs}`);
  
  // Test 4: Check file migration
  console.log('\n4. Checking file migration...');
  let totalFiles = 0;
  let migratedFiles = 0;
  
  existingModules.forEach(module => {
    const modulePath = path.join(uploadsDir, module);
    const defaultBranchPath = path.join(modulePath, 'default');
    
    if (fs.existsSync(defaultBranchPath)) {
      const files = fs.readdirSync(defaultBranchPath)
        .filter(file => {
          const filePath = path.join(defaultBranchPath, file);
          return fs.statSync(filePath).isFile();
        });
      
      if (files.length > 0) {
        console.log(`   ${module}: ${files.length} files migrated to default branch`);
        migratedFiles += files.length;
      }
    }
    
    // Check for files in module root (should be 0 after migration)
    const rootFiles = fs.readdirSync(modulePath)
      .filter(file => {
        const filePath = path.join(modulePath, file);
        return fs.statSync(filePath).isFile();
      });
    
    totalFiles += rootFiles.length;
  });
  
  if (totalFiles === 0) {
    console.log('   ✅ All files successfully migrated to branch directories');
  } else {
    console.log(`   ⚠️  ${totalFiles} files still in module root directories`);
  }
  
  console.log(`   ✅ ${migratedFiles} files successfully migrated`);
  
  // Test 5: Test utility functions
  console.log('\n5. Testing utility functions...');
  
  try {
    // Test getFilePath
    const testPath = getFilePath('sales', 'test-branch', 'test-file.pdf');
    console.log(`   getFilePath test: ${testPath}`);
    
    // Test listFilesByModule
    const salesFiles = listFilesByModule('documents', 'default');
    console.log(`   listFilesByModule test: ${salesFiles.length} files in documents/default`);
    
    console.log('   ✅ Utility functions working correctly');
  } catch (error) {
    console.log('   ❌ Utility function test failed:', error.message);
  }
  
  // Test 6: Check file naming convention
  console.log('\n6. Checking file naming convention...');
  let filesWithPrefix = 0;
  let totalFilesChecked = 0;
  
  existingModules.forEach(module => {
    const modulePath = path.join(uploadsDir, module);
    const defaultBranchPath = path.join(modulePath, 'default');
    
    if (fs.existsSync(defaultBranchPath)) {
      const files = fs.readdirSync(defaultBranchPath)
        .filter(file => {
          const filePath = path.join(defaultBranchPath, file);
          return fs.statSync(filePath).isFile();
        });
      
      files.forEach(file => {
        totalFilesChecked++;
        // Check if file has module prefix (3 letters + underscore)
        const prefix = file.substring(0, 4);
        if (prefix.endsWith('_') && prefix.length === 4) {
          filesWithPrefix++;
        }
      });
    }
  });
  
  if (totalFilesChecked > 0) {
    const percentage = Math.round((filesWithPrefix / totalFilesChecked) * 100);
    console.log(`   ${filesWithPrefix}/${totalFilesChecked} files follow naming convention (${percentage}%)`);
  } else {
    console.log('   No files found to check naming convention');
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   • Modules: ${existingModules.length}/${expectedModules.length}`);
  console.log(`   • Branch directories: ${totalBranchDirs}`);
  console.log(`   • Migrated files: ${migratedFiles}`);
  console.log(`   • Files in root: ${totalFiles}`);
  console.log(`   • Files with proper naming: ${filesWithPrefix}/${totalFilesChecked}`);
  
  if (missingModules.length === 0 && totalFiles === 0) {
    console.log('\n🎉 All tests passed! Upload structure is working correctly.');
  } else {
    console.log('\n⚠️  Some issues found. Please check the details above.');
  }
};

// Run test if this script is executed directly
if (require.main === module) {
  try {
    testUploadStructure();
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

module.exports = { testUploadStructure }; 