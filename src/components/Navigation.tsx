'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings,
  Home,
  Tool,
  BarChart3,
  Shield
} from 'lucide-react';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for admin token
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      setIsAdmin(true);
      setIsLoggedIn(true);
    } else {
      // Check for regular user authentication
      const userToken = localStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userToken');
    setIsAdmin(false);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
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
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Tools
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Contact
            </Link>

            {/* Authentication buttons */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
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
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm">
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
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/ai-tools" 
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              Tools
            </Link>
            <Link 
              href="/about" 
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>

            {/* Mobile authentication */}
            {isLoggedIn ? (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link href="/overview">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/sign-in">
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" className="w-full">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 