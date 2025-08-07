require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Import all models to ensure they're registered
require('../src/models/UserFavoritesModel');
require('../src/models/ToolRatingModel');
require('../src/models/ToolUsageModel');
require('../src/models/UserAnalysisHistoryModel');
require('../src/models/UserSettingsModel');
require('../src/models/AdminUserModel');
require('../src/models/UserModel');
require('../src/models/UrlShortenerModel');

async function initCollections() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all registered models
    const models = mongoose.modelNames();
    console.log('📋 Found models:', models);

    // Create collections for each model
    for (const modelName of models) {
      try {
        const model = mongoose.model(modelName);
        await model.createCollection();
        console.log(`✅ Created collection: ${modelName}`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          console.log(`ℹ️  Collection already exists: ${modelName}`);
        } else {
          console.log(`⚠️  Error creating collection ${modelName}:`, error.message);
        }
      }
    }

    // Create indexes
    console.log('🔍 Creating indexes...');
    
    // UserFavorites indexes
    try {
      await mongoose.model('UserFavorite').createIndexes();
      console.log('✅ UserFavorite indexes created');
    } catch (error) {
      console.log('⚠️  UserFavorite index error:', error.message);
    }

    // ToolRating indexes
    try {
      await mongoose.model('ToolRating').createIndexes();
      console.log('✅ ToolRating indexes created');
    } catch (error) {
      console.log('⚠️  ToolRating index error:', error.message);
    }

    // ToolUsage indexes
    try {
      await mongoose.model('ToolUsage').createIndexes();
      console.log('✅ ToolUsage indexes created');
    } catch (error) {
      console.log('⚠️  ToolUsage index error:', error.message);
    }

    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

initCollections(); 