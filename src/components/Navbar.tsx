'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserProfile } from './auth/UserProfile';
import { useRouter } from 'next/navigation';

const toolCategories = [
  { name: 'AI Tools', href: '/#ai-tools' },
  { name: 'Utilities', href: '/#utilities' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user, isLoaded } = useAuth();
  const { signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const router = useRouter();

  // Improved dark mode toggle: sync with system and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        setDarkMode(saved === 'dark');
        document.documentElement.classList.toggle('dark', saved === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
      }
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
      }
      return next;
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!dropdownOpen && !userDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.navbar-dropdown') && !target.closest('.user-dropdown')) {
        setDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [dropdownOpen, userDropdownOpen]);

  const handleSignIn = () => {
    router.push('/auth');
  };

  const handleSignUp = () => {
    router.push('/auth?tab=signup');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserDropdownOpen(false);
      setNotification({ type: 'success', message: 'Successfully signed out!' });
      
      // Use proper timeout handling
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to sign out' });
      
      // Use proper timeout handling
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Show notification when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      setNotification({ 
        type: 'success', 
        message: `Welcome back, ${user.firstName || 'User'}!` 
      });
      
      // Use a proper timeout function
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      
      // Cleanup timeout on unmount or dependency change
      return () => clearTimeout(timer);
    }
  }, [isSignedIn, user]);

  const getUserInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Project Name */}
            <Link href="/" className="flex items-center space-x-3 group focus:outline-none" aria-label="Home">
              <motion.div initial={{ rotate: -10, scale: 0.9 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                <Image src="/file.svg" alt="Logo" width={36} height={36} className="rounded shadow-sm" />
              </motion.div>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors bg-gradient-to-r from-blue-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">AI Toolbox</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className={`text-sm font-semibold transition-colors px-2 py-1 rounded ${pathname === '/' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>Home</Link>
              <Link href="/ai-tools" className="text-sm font-semibold transition-colors px-2 py-1 rounded text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30">AI Tools</Link>
              <Link href="/utilities" className="text-sm font-semibold transition-colors px-2 py-1 rounded text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30">Utilities</Link>
              <Link href="/about" className={`text-sm font-semibold transition-colors px-2 py-1 rounded ${pathname === '/about' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`}>About</Link>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none"
                aria-label="Open menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <AnimatePresence>
                {mobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg z-40"
                  >
                    <div className="flex flex-col py-4 px-6 space-y-2">
                      <Link href="/" className={`text-base font-semibold transition-colors px-2 py-2 rounded ${pathname === '/' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                      <Link href="/ai-tools" className="text-base font-semibold px-2 py-2 rounded text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30" onClick={() => setMobileMenuOpen(false)}>AI Tools</Link>
                      <Link href="/utilities" className="text-base font-semibold px-2 py-2 rounded text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30" onClick={() => setMobileMenuOpen(false)}>Utilities</Link>
                      <Link href="/about" className={`text-base font-semibold transition-colors px-2 py-2 rounded ${pathname === '/about' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'}`} onClick={() => setMobileMenuOpen(false)}>About</Link>
                      {/* Mobile auth section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        {isSignedIn ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 px-2 py-2">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 via-fuchsia-100 to-pink-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-300">
                                {getUserInitials(user?.firstName)}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">{user?.firstName}</span>
                            </div>
                            <button
                              onClick={() => {
                                setShowUserProfile(true);
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left text-base font-semibold px-2 py-2 rounded text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              Profile
                            </button>
                            <button
                              onClick={handleSignOut}
                              className="w-full text-left text-base font-semibold px-2 py-2 rounded text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            >
                              Sign Out
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                handleSignIn();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left text-base font-semibold px-2 py-2 rounded text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            >
                              Sign In
                            </button>
                            <button
                              onClick={() => {
                                handleSignUp();
                                setMobileMenuOpen(false);
                              }}
                              className="w-full text-left text-base font-semibold px-2 py-2 rounded text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                            >
                              Sign Up
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Section */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none"
                title="Toggle dark mode"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* User Section */}
              {!isLoaded ? (
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : isSignedIn ? (
                <div className="flex items-center space-x-3">
                  {/* User Status Badge */}
                  <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Signed In</span>
                  </div>
                  
                  {/* User Avatar & Dropdown */}
                  <div className="relative user-dropdown">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none"
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 via-fuchsia-100 to-pink-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-300">
                        {getUserInitials(user?.firstName)}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.firstName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.emailAddresses[0]?.emailAddress}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <AnimatePresence>
                      {userDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                        >
                          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 via-fuchsia-100 to-pink-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-900 flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-300">
                                {getUserInitials(user?.firstName)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {user?.emailAddresses[0]?.emailAddress}
                                </p>
                                {user?.username && (
                                  <p className="text-xs text-blue-600 dark:text-blue-400">
                                    @{user.username}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setShowUserProfile(true);
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            👤 Profile
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            🚪 Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {/* Not Signed In Badge */}
                  <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>Not Signed In</span>
                  </div>
                  
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUp}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </>
  );
} 