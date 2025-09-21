export function determineProviderFromClaims(claims: any): string {
	if (!claims) return 'anonymous';
	// We don't store provider in JWT; default to 'credentials'
	return 'credentials';
}

/**
 * Get all authentication providers for a user
 */
export function getAllProviders(user: any | null): string[] {
  if (!user) {
    return ['anonymous'];
  }

  const providers: string[] = [];

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
export function isValidProvider(provider: string): boolean {
  return ['email', 'google', 'facebook', 'github', 'anonymous'].includes(provider);
}

/**
 * Get provider display name
 */
export function getProviderDisplayName(provider: string): string {
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