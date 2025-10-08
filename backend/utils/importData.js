require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Entity = require('../models/Entity');
const ActivityLog = require('../models/ActivityLog');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

async function importData() {
  try {
    await connectDB();
    
    const datasetPath = path.join(__dirname, '../../dataset/json');
    
    // Import entities
    const entitiesPath = path.join(datasetPath, 'entities.json');
    if (fs.existsSync(entitiesPath)) {
      const entitiesData = JSON.parse(fs.readFileSync(entitiesPath, 'utf-8'));
      
      console.log(`Importing ${entitiesData.length} entities...`);
      await Entity.deleteMany({}); // Clear existing
      await Entity.insertMany(entitiesData);
      console.log('✓ Entities imported');
    }
    
    // Import activity logs
    const logsPath = path.join(datasetPath, 'activity_logs.json');
    if (fs.existsSync(logsPath)) {
      const logsData = JSON.parse(fs.readFileSync(logsPath, 'utf-8'));
      
      console.log(`Importing ${logsData.length} activity logs...`);
      await ActivityLog.deleteMany({}); // Clear existing
      
      // Insert in batches to avoid memory issues
      const batchSize = 1000;
      for (let i = 0; i < logsData.length; i += batchSize) {
        const batch = logsData.slice(i, i + batchSize);
        await ActivityLog.insertMany(batch);
        console.log(`  Imported ${Math.min(i + batchSize, logsData.length)}/${logsData.length}`);
      }
      console.log('✓ Activity logs imported');
    }
    
    console.log('\n✅ Data import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Import error:', error);
    process.exit(1);
  }
}

// Run import
importData();
