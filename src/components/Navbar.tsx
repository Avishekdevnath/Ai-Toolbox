'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  User, 
  Shield,
  LogOut,
  Settings,
  Heart,
  LayoutDashboard,
  UserCheck,
  Lock,
  Bell
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  // Check admin status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('userToken');
      
      if (adminToken) {
        setIsAdmin(true);
        setIsLoggedIn(true);
      } else if (userToken) {
        setIsLoggedIn(true);
        setIsAdmin(false);
      }
    };

    checkAuthStatus();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    setIsAdmin(false);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  const isActiveLink = (href: string) => {
    return pathname === href || pathname.startsWith(href);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                AI Toolbox
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/ai-tools" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/ai-tools') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              AI Tools
            </Link>
            <Link 
              href="/utilities" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/utilities') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Utilities
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/about') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium transition-colors ${
                isActiveLink('/contact') 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          {/* Authentication buttons */}
          {isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-4">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              )}
              <Link href="/overview">
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          ) : null}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
              <Link 
                href="/ai-tools" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveLink('/ai-tools') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                AI Tools
              </Link>
              <Link 
                href="/utilities" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveLink('/utilities') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Utilities
              </Link>
              <Link 
                href="/about" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveLink('/about') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActiveLink('/contact') 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Auth Buttons */}
              {isLoggedIn && (
                <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <Link href="/overview">
                       <Button variant="outline" size="sm" className="w-full flex items-center justify-center space-x-2">
                         <User className="w-4 h-4" />
                         <span>Overview</span>
                       </Button>
                     </Link>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 