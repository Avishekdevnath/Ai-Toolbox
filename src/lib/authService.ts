// Client-side authentication service (for use in client components)
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  provider?: string;
}

export interface AuthSession {
  user: AuthUser;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Client-side authentication service class
export class ClientAuthService {
  private static instance: ClientAuthService;
  private currentSession: AuthSession | null = null;

  private constructor() {}

  public static getInstance(): ClientAuthService {
    if (!ClientAuthService.instance) {
      ClientAuthService.instance = new ClientAuthService();
    }
    return ClientAuthService.instance;
  }

  // Get current authentication session (client-side only)
  public getCurrentSession(): AuthSession | null {
    try {
      // Check admin session first
      const adminSession = localStorage.getItem('admin-session');
      if (adminSession) {
        const session = JSON.parse(adminSession);
        this.currentSession = {
          user: session.user,
          isAuthenticated: true,
          isAdmin: true
        };
        return this.currentSession;
      }

      // Check user session
      const userSession = localStorage.getItem('user-session');
      if (userSession) {
        const session = JSON.parse(userSession);
        this.currentSession = {
          user: session.user,
          isAuthenticated: true,
          isAdmin: false
        };
        return this.currentSession;
      }

      // No session found
      this.currentSession = null;
      return null;
    } catch (error) {
      console.error('Error getting client session:', error);
      return null;
    }
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    const session = this.getCurrentSession();
    return session?.isAuthenticated || false;
  }

  // Check if user is admin
  public isAdmin(): boolean {
    const session = this.getCurrentSession();
    return session?.isAdmin || false;
  }

  // Get current user
  public getCurrentUser(): AuthUser | null {
    const session = this.getCurrentSession();
    return session?.user || null;
  }

  // Sign out
  public signOut(): void {
    try {
      // Clear sessions
      localStorage.removeItem('admin-session');
      localStorage.removeItem('user-session');
      
      // Clear current session
      this.currentSession = null;
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }

  // Create admin session (for admin login)
  public createAdminSession(adminData: any): void {
    const authUser: AuthUser = {
      id: adminData.id,
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      isAdmin: true
    };

    const session: AuthSession = {
      user: authUser,
      isAuthenticated: true,
      isAdmin: true
    };

    localStorage.setItem('admin-session', JSON.stringify({
      user: authUser,
      token: adminData.token,
      isAdmin: true
    }));

    this.currentSession = session;
  }

  // Create user session (for regular users)
  public createUserSession(userData: any): void {
    const authUser: AuthUser = {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isAdmin: false,
      provider: userData.provider
    };

    const session: AuthSession = {
      user: authUser,
      isAuthenticated: true,
      isAdmin: false
    };

    localStorage.setItem('user-session', JSON.stringify({
      user: authUser,
      isAdmin: false,
      provider: userData.provider
    }));

    this.currentSession = session;
  }
}

// Export singleton instance for client-side use
export const clientAuthService = ClientAuthService.getInstance();

// Helper functions for client-side authentication
export function getClientSession(): AuthSession | null {
  return clientAuthService.getCurrentSession();
}

export function isClientAuthenticated(): boolean {
  return clientAuthService.isAuthenticated();
}

export function isClientAdmin(): boolean {
  return clientAuthService.isAdmin();
}

export function getClientUser(): AuthUser | null {
  return clientAuthService.getCurrentUser();
}

export function createClientAdminSession(adminData: any): void {
  clientAuthService.createAdminSession(adminData);
}

export function createClientUserSession(userData: any): void {
  clientAuthService.createUserSession(userData);
}

export function signOutClient(): void {
  clientAuthService.signOut();
} 