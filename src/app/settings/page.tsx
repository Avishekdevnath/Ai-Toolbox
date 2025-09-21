import { Suspense } from 'react';
import { Settings, User, Shield, Bell, Palette, Globe, Database, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import NewFooter from '@/components/NewFooter';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mx-auto flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Settings className="w-10 h-10 text-gray-600" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Settings Center
            </h1>
            
            <div className="flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-amber-500 mr-2" />
              <span className="text-amber-600 font-medium text-lg">
                Coming Soon
              </span>
            </div>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're building a comprehensive settings center to give you complete control over your account, 
              preferences, and privacy. Stay tuned for powerful customization options!
            </p>
          </div>

          {/* Settings Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Account Settings */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <User className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h3>
              <p className="text-gray-600 mb-4">Manage your profile, personal information, and account preferences.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Profile information</li>
                <li>• Username & email</li>
                <li>• Account verification</li>
                <li>• Account deletion</li>
              </ul>
            </div>
            
            {/* Security Settings */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Shield className="w-8 h-8 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h3>
              <p className="text-gray-600 mb-4">Protect your account with advanced security features.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Password management</li>
                <li>• Two-factor authentication</li>
                <li>• Login history</li>
                <li>• Security alerts</li>
              </ul>
            </div>
            
            {/* Privacy Settings */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Globe className="w-8 h-8 text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Privacy Settings</h3>
              <p className="text-gray-600 mb-4">Control your data privacy and sharing preferences.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Data collection preferences</li>
                <li>• Analytics sharing</li>
                <li>• Profile visibility</li>
                <li>• Data export/delete</li>
              </ul>
            </div>
            
            {/* Notification Settings */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Bell className="w-8 h-8 text-orange-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Notifications</h3>
              <p className="text-gray-600 mb-4">Customize how and when you receive notifications.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Email notifications</li>
                <li>• Push notifications</li>
                <li>• Security alerts</li>
                <li>• Marketing preferences</li>
              </ul>
            </div>
            
            {/* Appearance Settings */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Palette className="w-8 h-8 text-pink-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Appearance</h3>
              <p className="text-gray-600 mb-4">Personalize the look and feel of your experience.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Theme selection</li>
                <li>• Color preferences</li>
                <li>• Layout options</li>
                <li>• Font settings</li>
              </ul>
            </div>
            
            {/* Data Management */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <Database className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Management</h3>
              <p className="text-gray-600 mb-4">Manage your data, exports, and storage preferences.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Data export</li>
                <li>• Storage management</li>
                <li>• Backup settings</li>
                <li>• Data retention</li>
              </ul>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Settings className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Current Settings Status
                </h3>
                <p className="text-blue-700 mb-4">
                  You currently have access to basic account settings through the dashboard. 
                  We're working on bringing you a comprehensive settings center with advanced customization options.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✓ Basic Profile
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✓ Account Info
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    ⏳ Advanced Settings
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Want to access current settings?
              </h2>
              <p className="text-gray-600 mb-6">
                You can access basic account settings through your dashboard while we build the advanced settings center.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/dashboard/settings" 
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard Settings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NewFooter />
    </div>
  );
}
