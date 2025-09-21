import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAccessToken } from '@/lib/auth/jwt';

// Types for authentication
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

// Server-side authentication service class
export class ServerAuthService {
  private static instance: ServerAuthService;

  private constructor() {}

  public static getInstance(): ServerAuthService {
    if (!ServerAuthService.instance) {
      ServerAuthService.instance = new ServerAuthService();
    }
    return ServerAuthService.instance;
  }

  // Get current authentication session (server-side)
  public async getCurrentSession(): Promise<AuthSession | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('user_session')?.value;
      const claims = token ? verifyAccessToken(token) : null;
      if (!claims) return null;
      const authUser: AuthUser = {
        id: claims.id,
        email: claims.email,
        firstName: '',
        lastName: '',
        isAdmin: claims.role === 'admin',
        provider: 'email'
      };
      return {
        user: authUser,
        isAuthenticated: true,
        isAdmin: authUser.isAdmin
      };
    } catch (error) {
      console.error('Error getting server session:', error);
      return null;
    }
  }

  // Require authentication (redirects if not authenticated)
  public async requireAuth(redirectTo: string = '/sign-in'): Promise<AuthSession> {
    const session = await this.getCurrentSession();
    
    if (!session || !session.isAuthenticated) {
      redirect(redirectTo);
    }

    return session;
  }

  // Require admin authentication
  public async requireAdmin(redirectTo: string = '/sign-in'): Promise<AuthSession> {
    const session = await this.requireAuth(redirectTo);
    
    if (!session.isAdmin) {
      redirect('/dashboard'); // Redirect non-admins to user dashboard
    }

    return session;
  }

  // Check if user is authenticated
  public async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session?.isAuthenticated || false;
  }

  // Check if user is admin
  public async isAdmin(): Promise<boolean> {
    const session = await this.getCurrentSession();
    return session?.isAdmin || false;
  }

  // Get current user
  public async getCurrentUser(): Promise<AuthUser | null> {
    const session = await this.getCurrentSession();
    return session?.user || null;
  }

}

// Export singleton instance for server-side use
export const serverAuthService = ServerAuthService.getInstance();

// Helper functions for server-side authentication
export async function getServerSession(): Promise<AuthSession | null> {
  return await serverAuthService.getCurrentSession();
}

export async function requireServerAuth(redirectTo: string = '/sign-in'): Promise<AuthSession> {
  return await serverAuthService.requireAuth(redirectTo);
}

export async function requireServerAdmin(redirectTo: string = '/sign-in'): Promise<AuthSession> {
  return await serverAuthService.requireAdmin(redirectTo);
}

export async function isServerAuthenticated(): Promise<boolean> {
  return await serverAuthService.isAuthenticated();
}

export async function isServerAdmin(): Promise<boolean> {
  return await serverAuthService.isAdmin();
}

export async function getServerUser(): Promise<AuthUser | null> {
  return await serverAuthService.getCurrentUser();
} 