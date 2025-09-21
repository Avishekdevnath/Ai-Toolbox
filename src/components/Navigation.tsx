'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  LayoutDashboard, 
  User, 
  Settings, 
  Shield, 
  LogOut,
  ChevronRight
} from 'lucide-react';

interface NavigationProps {
  showHome?: boolean;
  showBack?: boolean;
  backUrl?: string;
  backText?: string;
  showUserMenu?: boolean;
  showBreadcrumbs?: boolean;
}

export default function Navigation({
  showHome = true,
  showBack = false,
  backUrl = '/dashboard',
  backText = 'Back to Dashboard',
  showUserMenu = true,
  showBreadcrumbs = true,
}: NavigationProps) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`;
      const segment = segments[i];
      
      // Map route names to display names
      let displayName = segment;
      switch (segment) {
        case 'sign-in':
          displayName = 'Sign In';
          break;
        case 'sign-up':
          displayName = 'Sign Up';
          break;
        case 'forgot-password':
          displayName = 'Forgot Password';
          break;
        case 'verify-email':
          displayName = 'Verify Email';
          break;
        case 'oauth-callback':
          displayName = 'Authentication';
          break;
        case 'dashboard':
          displayName = 'Dashboard';
          break;
        case 'profile':
          displayName = 'Profile';
          break;
        case 'security':
          displayName = 'Security';
          break;
        case 'user':
          displayName = 'Account Settings';
          break;
        case 'admin':
          displayName = 'Admin';
          break;
        case 'ai-tools':
          displayName = 'AI Tools';
          break;
        case 'utilities':
          displayName = 'Utilities';
          break;
        case 'tools':
          displayName = 'Tools';
          break;
        case 'analytics':
          displayName = 'Analytics';
          break;
        case 'settings':
          displayName = 'Settings';
          break;
        default:
          displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      breadcrumbs.push({
        name: displayName,
        path: currentPath,
        isLast: i === segments.length - 1,
      });
    }
    
    return breadcrumbs;
  };

  const getPageTitle = () => {
    const breadcrumbs = getBreadcrumbs();
    return breadcrumbs[breadcrumbs.length - 1]?.name || 'AI Toolbox';
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded-full"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and breadcrumbs */}
            <div className="flex items-center space-x-4">
              {showHome && (
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-white" />
                  </div>
                  <span>AI Toolbox</span>
                </Link>
              )}
              
              {showBreadcrumbs && pathname !== '/' && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <ChevronRight className="w-4 h-4" />
                  {getBreadcrumbs().map((breadcrumb, index) => (
                    <div key={breadcrumb.path} className="flex items-center space-x-2">
                      {index > 0 && <ChevronRight className="w-4 h-4" />}
                      {breadcrumb.isLast ? (
                        <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
                      ) : (
                        <Link
                          href={breadcrumb.path}
                          className="text-gray-500 hover:text-blue-600 transition-colors"
                        >
                          {breadcrumb.name}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - Navigation links and user menu */}
            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                      pathname === '/dashboard'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                      pathname === '/profile'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/security"
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                      pathname === '/security'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Security
                  </Link>
                  <Link
                    href="/user"
                    className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                      pathname.startsWith('/user')
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Settings
                  </Link>
                </>
              )}

              {/* Back Button */}
              {showBack && (
                <Link
                  href={backUrl}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  ← {backText}
                </Link>
              )}

              {/* User Menu */}
              {showUserMenu && user && (
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-700">
                        {user.firstName || 'User'}
                      </span>
                    </div>
                    <Button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningOut ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          <span>Signing out...</span>
                        </div>
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Page Title for mobile */}
      {showBreadcrumbs && pathname !== '/' && (
        <div className="md:hidden bg-gray-50 border-b px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
        </div>
      )}
    </>
  );
} 