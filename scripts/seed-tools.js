// scripts/seed-tools.js
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-toolbox';
const DB_NAME = process.env.DB_NAME || 'ai-toolbox';

const tools = [
  { name: 'SWOT Analysis', usage: 0, status: 'online', description: 'Generate comprehensive SWOT analysis based on your input.', icon: '📊', category: 'Business' },
  { name: 'Finance Tools', usage: 0, status: 'offline', description: 'Comprehensive financial planning and analysis.', icon: '💰', category: 'Finance' },
  { name: 'Diet Planner', usage: 0, status: 'online', description: 'AI-driven meal planning and nutrition recommendations.', icon: '🥗', category: 'Health' },
  { name: 'Product Price Tracker', usage: 0, status: 'online', description: 'Track product prices and history with AI.', icon: '🛍️', category: 'Shopping' },
  { name: 'Resume Reviewer', usage: 0, status: 'online', description: 'AI-powered resume analysis and optimization.', icon: '📄', category: 'Career' },
  { name: 'Mock Interviewer', usage: 0, status: 'offline', description: 'AI-powered interview practice with real-time evaluation.', icon: '🎤', category: 'Career' },
  { name: 'QR Generator', usage: 0, status: 'online', description: 'Generate QR codes for any text or URL.', icon: '📱', category: 'Utility' },
  { name: 'Password Generator', usage: 0, status: 'online', description: 'Generate secure random passwords.', icon: '🔐', category: 'Security' },
  { name: 'Age Calculator', usage: 0, status: 'online', description: 'Comprehensive age analysis with life milestones.', icon: '📅', category: 'Health' },
  { name: 'URL Shortener', usage: 0, status: 'online', description: 'Shorten URLs with custom aliases and analytics.', icon: '🔗', category: 'Utility' },
  { name: 'Tip Calculator', usage: 0, status: 'online', description: 'Calculate tips and split bills with AI suggestions.', icon: '🧮', category: 'Finance' },
  { name: 'Word Counter', usage: 0, status: 'online', description: 'Count words with detailed analysis.', icon: '📊', category: 'Writing' },
  { name: 'Unit Converter', usage: 0, status: 'online', description: 'Convert between different units with live currency.', icon: '⚖️', category: 'Utility' },
  { name: 'Quote Generator', usage: 0, status: 'online', description: 'Generate AI-powered quotes and inspiration.', icon: '💭', category: 'Entertainment' },
  { name: 'Job-Specific Interviewer', usage: 0, status: 'online', description: 'Targeted interviews based on job postings and requirements.', icon: '💼', category: 'Career' }
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('tools');
    // Remove existing tools
    await collection.deleteMany({});
    // Insert new tools
    const result = await collection.insertMany(tools);
    console.log(`Seeded ${result.insertedCount} tools.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed(); 