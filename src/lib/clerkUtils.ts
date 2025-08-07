// Clerk utility functions to handle when Clerk is not available

export const isClerkAvailable = () => {
  return typeof window !== 'undefined' && 
         window.__CLERK_FRONTEND_API__ && 
         process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
};

export const getMockUser = () => ({
  id: 'mock-user-id',
  firstName: 'Demo',
  lastName: 'User',
  emailAddresses: [{ emailAddress: 'demo@example.com' }],
  username: 'demo-user',
  createdAt: new Date().toISOString(),
});

export const getMockAuth = () => ({
  isLoaded: true,
  isSignedIn: false,
  signOut: async () => {
    console.log('Mock sign out');
  },
  userId: null,
});

// Safe wrapper for Clerk hooks
export const createSafeClerkHook = <T>(hookFn: () => T, fallback: T) => {
  return () => {
    if (isClerkAvailable()) {
      try {
        return hookFn();
      } catch (error) {
        console.warn('Clerk hook failed, using fallback:', error);
        return fallback;
      }
    }
    return fallback;
  };
}; 