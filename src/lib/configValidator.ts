// Environment variable validation
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'GOOGLE_AI_API_KEY'
];

const optionalEnvVars = [
  'NODE_ENV',
  'PORT',
  'NEXT_PUBLIC_BASE_URL'
];

export const validateEnvironmentVariables = () => {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(`${varName} is not set (optional)`);
    }
  });

  return { missing, warnings };
};

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
