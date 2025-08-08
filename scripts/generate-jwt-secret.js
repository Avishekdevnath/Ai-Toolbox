const crypto = require('crypto');

console.log('🔐 Generating JWT Secrets...\n');

// Generate multiple options
for (let i = 1; i <= 5; i++) {
  const secret = crypto.randomBytes(32).toString('base64');
  console.log(`Option ${i}: ${secret}`);
}

console.log('\n📝 Copy any of the above secrets to your .env.local file:');
console.log('JWT_SECRET=your_chosen_secret_here');
console.log('\n⚠️  Important:');
console.log('- Keep this secret secure and never commit it to version control');
console.log('- Use different secrets for development, staging, and production');
console.log('- The secret should be at least 32 bytes (256 bits) long'); 