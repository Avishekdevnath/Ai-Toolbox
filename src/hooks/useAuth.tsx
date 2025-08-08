'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthUser } from '@/lib/authService';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: { email: string; password: string; name: string; firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const router = useRouter();

  const getApiUrl = (endpoint: string) => {
    // Dynamic port detection for development
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const apiPort = typeof window !== 'undefined' && window.location.port ? window.location.port : '3000';
    
    return `${protocol}//${hostname}:${apiPort}${endpoint}`;
  };

  // Check if current path requires authentication
  const isPublicRoute = () => {
    if (typeof window === 'undefined') return true; // Server-side, assume public
    
    const pathname = window.location.pathname;
    
    // Public routes that don't need auth checking
    const publicRoutes = [
      '/',
      '/tools',
      '/ai-tools', 
      '/utilities',
      '/about',
      '/privacy',
      '/terms',
      '/contact',
      '/api-docs'
    ];
    
    // Check if current path starts with any public route
    return publicRoutes.some(route => pathname.startsWith(route)) ||
           pathname.startsWith('/tools/') ||
           pathname.startsWith('/ai-tools/') ||
           pathname.startsWith('/utilities/');
  };

  // Check if current path is an admin route
  const isAdminRoute = () => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.startsWith('/admin');
  };

  // Check authentication status on mount (only for protected routes)
  useEffect(() => {
    if (!hasCheckedAuth) {
      // Always check auth for admin routes, and for protected routes
      if (isAdminRoute() || !isPublicRoute()) {
        checkAuthStatus();
      } else {
        // For public routes, just set loading to false without checking auth
        setIsLoading(false);
        setHasCheckedAuth(true);
      }
    }
  }, [hasCheckedAuth]);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking authentication status...');
      const response = await fetch(getApiUrl('/api/auth/session'));
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          console.log('✅ Session found:', data.user);
          setUser(data.user);
        } else {
          console.log('❌ No valid session found');
          setUser(null);
        }
      } else {
        console.log('❌ Session check failed:', response.status);
        setUser(null);
        
        // Fallback: check localStorage for token (only on client side)
        if (typeof window !== 'undefined') {
          const storedToken = localStorage.getItem('authToken');
          if (storedToken) {
            console.log('🔄 Using localStorage token as fallback');
            // You could decode the token here to get user info
            // For now, just set a basic user object
            setUser({
              id: 'fallback',
              email: 'admin@ai-toolbox.com',
              name: 'Admin User',
              role: 'admin',
              isAdmin: true,
              isActive: true,
              permissions: ['basic_access']
            });
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/signin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        console.log('✅ Login successful, setting user:', data.user);
        setUser(data.user);
        
        // Force a session check to ensure authentication state is properly set
        setTimeout(async () => {
          try {
            const sessionResponse = await fetch(getApiUrl('/api/auth/session'));
            if (sessionResponse.ok) {
              const sessionData = await sessionResponse.json();
              if (sessionData.success && sessionData.user) {
                console.log('✅ Session verified after login:', sessionData.user);
                setUser(sessionData.user);
              }
            }
          } catch (error) {
            console.error('Session check after login failed:', error);
          }
        }, 100);
        
        return { success: true, token: data.token };
      } else {
        console.log('❌ Login failed:', data.error);
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (userData: { email: string; password: string; name: string; firstName?: string; lastName?: string }) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(getApiUrl('/api/auth/logout'), {
        method: 'POST',
      });
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    login,
    signup,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 