export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'MONGODB_URI',
    'GEMINI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export function validateProductionEnvironment() {
  if (process.env.NODE_ENV === 'production') {
    const productionRequired = [
      'NEXT_PUBLIC_GA_ID',
      'SENTRY_DSN',
      'NEXTAUTH_SECRET'
    ];

    const missing = productionRequired.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`Warning: Missing production environment variables: ${missing.join(', ')}`);
    }
  }
}
