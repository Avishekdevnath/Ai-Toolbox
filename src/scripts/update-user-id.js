const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define UserRole schema for the script
const UserRoleSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'user'],
    default: 'user',
    required: true,
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_tools', 
      'view_analytics',
      'manage_system',
      'manage_content',
      'view_audit_logs',
      'manage_admins',
      'view_dashboard',
      'manage_settings'
    ],
    default: ['view_dashboard']
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserRole = mongoose.model('UserRole', UserRoleSchema);

async function updateUserId() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all users from database
    const users = await UserRole.find({});
    
    console.log('\n📋 Current Users in Database:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Current userId: ${user.userId}`);
      console.log(`   Is Active: ${user.isActive}`);
      console.log('---');
    });

    console.log('\n🔧 To update userId:');
    console.log('1. Sign up with one of the emails above');
    console.log('2. Get your Clerk user ID from the browser console or Clerk dashboard');
    console.log('3. Run this command:');
    console.log('   node src/scripts/update-user-id.js <email> <clerk-user-id>');
    console.log('\nExample:');
    console.log('   node src/scripts/update-user-id.js admin@ai-toolbox.com user_2abc123def456');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Check if arguments are provided
const args = process.argv.slice(2);
if (args.length === 2) {
  const [email, clerkUserId] = args;
  
  mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB');
      
      // Update the user
      const result = await UserRole.findOneAndUpdate(
        { email: email },
        { 
          userId: clerkUserId,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      if (result) {
        console.log('✅ User updated successfully!');
        console.log(`Email: ${result.email}`);
        console.log(`Role: ${result.role}`);
        console.log(`New userId: ${result.userId}`);
      } else {
        console.log('❌ User not found with that email');
      }
      
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    })
    .catch(error => {
      console.error('❌ Error updating user:', error);
    });
} else {
  // Show current users
  updateUserId();
} 