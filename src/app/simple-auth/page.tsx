'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SimpleAuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignIn) {
        // Simulate sign in
        setMessage('Sign in functionality will be implemented');
      } else {
        // Simulate sign up
        setMessage('Sign up functionality will be implemented');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignIn ? 'Sign In' : 'Sign Up'}
            </h1>
            <p className="text-gray-600">
              {isSignIn ? 'Welcome back to AI Toolbox' : 'Create your AI Toolbox account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {message && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isSignIn ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">Or continue with</p>
              <div className="space-y-3">
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Continue with Google
                </button>
                <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Continue with GitHub
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-600 hover:text-gray-700 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Clerk Authentication Status</h3>
            <p className="text-sm text-yellow-700">
              Clerk is currently experiencing loading issues. This is a temporary authentication interface.
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              Environment variables are set, but Clerk app may need configuration for localhost:3000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 