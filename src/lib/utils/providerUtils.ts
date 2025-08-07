import { User } from '@clerk/nextjs/server';

export type AuthProvider = 'email' | 'google' | 'facebook' | 'github' | 'anonymous';

/**
 * Determine the authentication provider from Clerk user data
 * Fixed version that handles multiple OAuth accounts properly
 */
export function determineProvider(user: User | null): AuthProvider {
  if (!user) {
    return 'anonymous';
  }

  try {
    // Check external accounts (OAuth providers)
    if (user.externalAccounts && user.externalAccounts.length > 0) {
      // Get the most recently used OAuth account
      const sortedAccounts = user.externalAccounts.sort((a, b) => {
        const aTime = a.approvedAt ? new Date(a.approvedAt).getTime() : 0;
        const bTime = b.approvedAt ? new Date(b.approvedAt).getTime() : 0;
        return bTime - aTime; // Most recent first
      });

      const primaryAccount = sortedAccounts[0];
      const provider = primaryAccount.provider;
      
      switch (provider) {
        case 'oauth_google':
          return 'google';
        case 'oauth_facebook':
          return 'facebook';
        case 'oauth_github':
          return 'github';
        default:
          return 'email';
      }
    }
    
    // Check if user has verified email (email/password auth)
    if (user.emailAddresses && user.emailAddresses.length > 0) {
      const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
      if (primaryEmail && primaryEmail.verification?.status === 'verified') {
        return 'email';
      }
    }
    
    // Default to email for unverified users
    return 'email';
  } catch (error) {
    console.error('❌ Error determining provider:', error);
    return 'email';
  }
}

/**
 * Get all authentication providers for a user
 */
export function getAllProviders(user: User | null): AuthProvider[] {
  if (!user) {
    return ['anonymous'];
  }

  const providers: AuthProvider[] = [];

  try {
    // Add OAuth providers
    if (user.externalAccounts && user.externalAccounts.length > 0) {
      user.externalAccounts.forEach(account => {
        switch (account.provider) {
          case 'oauth_google':
            providers.push('google');
            break;
          case 'oauth_facebook':
            providers.push('facebook');
            break;
          case 'oauth_github':
            providers.push('github');
            break;
        }
      });
    }

    // Add email provider if verified
    if (user.emailAddresses && user.emailAddresses.length > 0) {
      const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
      if (primaryEmail && primaryEmail.verification?.status === 'verified') {
        providers.push('email');
      }
    }

    // Remove duplicates and return
    return [...new Set(providers)];
  } catch (error) {
    console.error('❌ Error getting all providers:', error);
    return ['email'];
  }
}

/**
 * Validate provider string
 */
export function isValidProvider(provider: string): provider is AuthProvider {
  return ['email', 'google', 'facebook', 'github', 'anonymous'].includes(provider);
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: AuthProvider): string {
  switch (provider) {
    case 'email':
      return 'Email';
    case 'google':
      return 'Google';
    case 'facebook':
      return 'Facebook';
    case 'github':
      return 'GitHub';
    case 'anonymous':
      return 'Anonymous';
    default:
      return 'Unknown';
  }
} 