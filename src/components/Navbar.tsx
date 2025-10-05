'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  Shield,
  LogOut,
  Settings,
  LayoutDashboard,
  UserCheck,
  Lock,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();
  const pathname = usePathname();

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Navbar Debug:', {
        loading,
        isAuthenticated,
        user: user ? `${user.username} (${user.email})` : 'No user',
        pathname
      });
    }
  }, [loading, isAuthenticated, user, pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

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

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.username || 'User';
  };

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  // Always render navbar shell immediately; only gate user menu details

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                AI Toolbox
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 ml-6 lg:ml-8 xl:ml-10">
              <Link 
                href="/ai-tools" prefetch={false}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveLink('/ai-tools')
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                AI Tools
              </Link>
              <Link 
                href="/utilities" prefetch={false}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveLink('/utilities')
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Utilities
              </Link>
              {isAuthenticated && (
                <Link 
                  href={user?.role === 'admin' ? "/admin" : "/dashboard"} 
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveLink('/dashboard') || (user?.role === 'admin' && isActiveLink('/admin'))
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              <Link 
                href="/about" prefetch={false}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveLink('/about')
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                About
              </Link>
              <Link 
                href="/contact" prefetch={false}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActiveLink('/contact')
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Tablet Navigation - Show on medium screens */}
            <div className="hidden md:flex lg:hidden items-center space-x-4 ml-4">
              <Link 
                href="/ai-tools" 
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActiveLink('/ai-tools')
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                AI Tools
              </Link>
              <Link 
                href="/utilities" 
                className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                  isActiveLink('/utilities')
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                Utilities
              </Link>
            {isAuthenticated && (
                <Link 
                  href={user?.role === 'admin' ? "/admin" : "/dashboard"} 
                  className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                    isActiveLink('/dashboard') || (user?.role === 'admin' && isActiveLink('/admin'))
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* User menu and authentication */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Tablet/Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
           
                  {/* User Menu Dropdown */}
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-semibold">
                        {getUserInitials()}
                      </span>
                      <span className="hidden lg:block">{getUserDisplayName()}</span>
                    </Button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform -translate-x-4">
                      <div className="py-1">
                        <Link
                          href={user?.role === 'admin' ? "/admin" : "/dashboard"}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/security"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Security</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                        <button
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" disabled>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="text-gray-700 dark:text-gray-300 p-2 min-w-[44px] min-h-[44px]"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link 
              href="/ai-tools" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActiveLink('/ai-tools')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              AI Tools
            </Link>
            <Link 
              href="/utilities" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActiveLink('/utilities')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Utilities
            </Link>
            {isAuthenticated && (
              <Link 
                href={user?.role === 'admin' ? "/admin" : "/dashboard"} 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActiveLink('/dashboard') || (user?.role === 'admin' && isActiveLink('/admin'))
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link 
              href="/about" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActiveLink('/about')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActiveLink('/contact')
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Mobile Authentication */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              {isAuthenticated ? (
                <div className="space-y-2">
                  {/* User Menu Links */}
                  <Link
                    href={user?.role === 'admin' ? "/admin" : "/dashboard"}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/security"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Lock className="w-4 h-4" />
                    <span>Security</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                  
                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSigningOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                  </button>
                </div>
              ) : loading ? (
                <div className="flex flex-col space-y-2 px-3 py-2">
                  <Button variant="ghost" size="sm" className="w-full justify-start" disabled>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-3 py-2">
                  <Link href="/sign-in">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm" className="w-full justify-start">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 