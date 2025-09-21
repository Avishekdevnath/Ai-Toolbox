import { Suspense } from 'react';
import { Shield, Lock, Key, Eye, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Security Center
            </h1>
            
            <div className="flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-amber-500 mr-2" />
              <span className="text-amber-600 font-medium text-lg">
                Coming Soon
              </span>
            </div>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building a comprehensive security center to help you protect your account and data. 
              Stay tuned for advanced security features!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Key className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Password Manager</h3>
              <p className="text-gray-600">Secure password storage, generation, and management for all your accounts.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Lock className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-gray-600">Add an extra layer of security with 2FA for your account.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Eye className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Login History</h3>
              <p className="text-gray-600">Monitor and track all account access and login attempts.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Shield className="w-8 h-8 text-red-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Alerts</h3>
              <p className="text-gray-600">Get notified about suspicious activity and security events.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Lock className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Session Management</h3>
              <p className="text-gray-600">View and manage active sessions across all your devices.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <AlertTriangle className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Audit</h3>
              <p className="text-gray-600">Regular security checks and recommendations for your account.</p>
            </div>
          </div>

          {/* Current Security Status */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Current Security Status
                </h3>
                <p className="text-green-700 mb-4">
                  Your account is currently protected with our basic authentication system. 
                  We're working on bringing you advanced security features soon.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Secure Login
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Password Protection
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Session Management
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Want to be notified when it's ready?
              </h2>
              <p className="text-gray-600 mb-6">
                We'll send you an email when our security center is launched with all the advanced features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
