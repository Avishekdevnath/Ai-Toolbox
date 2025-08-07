'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

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
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await signOut();
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

  if (!isLoaded) {
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
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>AI Toolbox</span>
                </Link>
              )}
              
              {showBreadcrumbs && pathname !== '/' && (
                <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                  <span>/</span>
                  {getBreadcrumbs().map((breadcrumb, index) => (
                    <div key={breadcrumb.path} className="flex items-center space-x-2">
                      {index > 0 && <span>/</span>}
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
                    className={`text-sm font-medium transition-colors ${
                      pathname === '/dashboard'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`text-sm font-medium transition-colors ${
                      pathname === '/profile'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/security"
                    className={`text-sm font-medium transition-colors ${
                      pathname === '/security'
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Security
                  </Link>
                  <Link
                    href="/user"
                    className={`text-sm font-medium transition-colors ${
                      pathname.startsWith('/user')
                        ? 'text-blue-600'
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
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.firstName?.charAt(0) || user.emailAddresses[0]?.emailAddress?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="hidden md:block text-sm font-medium text-gray-700">
                        {user.firstName || 'User'}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                      {isSigningOut ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Signing out...</span>
                        </div>
                      ) : (
                        'Sign Out'
                      )}
                    </button>
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