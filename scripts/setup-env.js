const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Setting up environment variables...\n');

// Generate JWT secret
const jwtSecret = crypto.randomBytes(32).toString('base64');

// Environment variables template
const envContent = `# Database Configuration
MONGODB_URI=mongodb+srv://your_username:your_password@phitron.tn7bb.mongodb.net/ai-toolbox?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=${jwtSecret}

# NextAuth Configuration (if using)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${crypto.randomBytes(32).toString('base64')}

# Email Configuration (optional)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password

# Other Configuration
NODE_ENV=development
`;

const envPath = path.join(__dirname, '..', '.env.local');

// Check if .env.local exists
if (fs.existsSync(envPath)) {
  console.log('📁 .env.local file already exists');
  console.log('📝 Current content:');
  console.log(fs.readFileSync(envPath, 'utf8'));
  console.log('\n⚠️  Please manually add these lines to your .env.local file:');
  console.log(`JWT_SECRET=${jwtSecret}`);
  console.log(`NEXTAUTH_SECRET=${crypto.randomBytes(32).toString('base64')}`);
} else {
  // Create new .env.local file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file with the following content:');
  console.log(envContent);
}

console.log('\n🔐 Generated JWT Secret:', jwtSecret);
console.log('\n📋 Next Steps:');
console.log('1. Update MONGODB_URI with your actual MongoDB credentials');
console.log('2. Update email configuration if needed');
console.log('3. Restart your development server');
console.log('4. Test authentication with the created admin users'); 