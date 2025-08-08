const fs = require('fs');
const path = require('path');

// Migration script to reorganize uploads into branch-based structure
const migrateUploads = () => {
  console.log('🚀 Starting uploads migration to branch-based structure...');
  
  const uploadsDir = path.join(__dirname, 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ Uploads directory not found. Creating new structure...');
    createNewStructure();
    return;
  }
  
  // Get all existing module directories
  const modules = fs.readdirSync(uploadsDir)
    .filter(item => {
      const itemPath = path.join(uploadsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
  
  console.log(`📁 Found ${modules.length} existing modules:`, modules);
  
  // For each module, create a default branch directory and move files
  modules.forEach(module => {
    const modulePath = path.join(uploadsDir, module);
    const defaultBranchPath = path.join(modulePath, 'default');
    
    // Create default branch directory
    if (!fs.existsSync(defaultBranchPath)) {
      fs.mkdirSync(defaultBranchPath, { recursive: true });
      console.log(`✅ Created default branch directory for ${module}`);
    }
    
    // Move files from module root to default branch
    const files = fs.readdirSync(modulePath)
      .filter(item => {
        const itemPath = path.join(modulePath, item);
        return fs.statSync(itemPath).isFile();
      });
    
    if (files.length > 0) {
      console.log(`📦 Moving ${files.length} files from ${module} to default branch...`);
      
      files.forEach(file => {
        const sourcePath = path.join(modulePath, file);
        const destPath = path.join(defaultBranchPath, file);
        
        try {
          fs.renameSync(sourcePath, destPath);
          console.log(`  ✅ Moved: ${file}`);
        } catch (error) {
          console.error(`  ❌ Failed to move ${file}:`, error.message);
        }
      });
    }
  });
  
  // Create new module directories if they don't exist
  const newModules = [
    'sales',
    'financial', 
    'qc',
    'vendor'
  ];
  
  newModules.forEach(module => {
    const modulePath = path.join(uploadsDir, module);
    if (!fs.existsSync(modulePath)) {
      fs.mkdirSync(modulePath, { recursive: true });
      console.log(`✅ Created new module directory: ${module}`);
    }
  });
  
  console.log('🎉 Migration completed successfully!');
  console.log('\n📋 New structure:');
  console.log('uploads/');
  modules.concat(newModules).forEach(module => {
    console.log(`  ├── ${module}/`);
    console.log(`  │   └── default/ (or specific branch IDs)`);
  });
};

const createNewStructure = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const modules = [
    'users',
    'branches', 
    'production',
    'inventory',
    'paddy',
    'rice',
    'gunny',
    'batches',
    'reports',
    'documents',
    'images',
    'sales',
    'financial',
    'qc',
    'vendor'
  ];
  
  // Create base uploads directory
  fs.mkdirSync(uploadsDir, { recursive: true });
  
  // Create module directories with default branch
  modules.forEach(module => {
    const modulePath = path.join(uploadsDir, module);
    const defaultBranchPath = path.join(modulePath, 'default');
    
    fs.mkdirSync(defaultBranchPath, { recursive: true });
    console.log(`✅ Created: ${module}/default/`);
  });
  
  console.log('🎉 New uploads structure created successfully!');
};

// Run migration if this script is executed directly
if (require.main === module) {
  try {
    migrateUploads();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

module.exports = { migrateUploads, createNewStructure }; 