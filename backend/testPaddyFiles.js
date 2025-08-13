const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const Paddy = require('./models/Paddy');
const Branch = require('./models/Branch');
const User = require('./models/User');

async function testPaddyFiles() {
  try {
    console.log('=== Testing Paddy Files ===');
    
    // Get all Paddy records
    const paddies = await Paddy.find({}).populate('branch_id', 'name').populate('createdBy', 'name');
    
    console.log(`Found ${paddies.length} Paddy records`);
    
    // Check each Paddy record for documents
    paddies.forEach((paddy, index) => {
      console.log(`\n--- Paddy ${index + 1} ---`);
      console.log(`ID: ${paddy._id}`);
      console.log(`Memo: ${paddy.issueMemo}`);
      console.log(`Branch: ${paddy.branch_id?.name || 'Unknown'}`);
      console.log(`Created By: ${paddy.createdBy?.name || 'Unknown'}`);
      console.log(`Documents count: ${paddy.documents ? paddy.documents.length : 0}`);
      
      if (paddy.documents && paddy.documents.length > 0) {
        console.log('Documents:');
        paddy.documents.forEach((doc, docIndex) => {
          console.log(`  ${docIndex + 1}. ${doc.originalName} (${doc.filename})`);
          console.log(`     Size: ${doc.size} bytes`);
          console.log(`     Type: ${doc.mimetype}`);
          console.log(`     URL: ${doc.url}`);
        });
      } else {
        console.log('No documents found');
      }
    });
    
    // Check if any Paddy records have documents
    const paddiesWithFiles = await Paddy.find({ 'documents.0': { $exists: true } });
    console.log(`\n=== Summary ===`);
    console.log(`Total Paddy records: ${paddies.length}`);
    console.log(`Paddy records with files: ${paddiesWithFiles.length}`);
    
    if (paddiesWithFiles.length > 0) {
      console.log('\nPaddy records with files:');
      paddiesWithFiles.forEach(paddy => {
        console.log(`- ${paddy.issueMemo} (${paddy.documents.length} files)`);
      });
    }
    
  } catch (error) {
    console.error('Error testing Paddy files:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the test
testPaddyFiles();
