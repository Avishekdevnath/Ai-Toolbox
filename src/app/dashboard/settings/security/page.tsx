import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import { Lock, Shield, Key, Eye, AlertTriangle, Clock } from 'lucide-react';

export default async function SecuritySettingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  
  if (!claims) redirect('/sign-in');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account security and privacy settings
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Security Settings
          </h2>
          
          <div className="flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-amber-500 mr-2" />
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              Coming Soon
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            We're working hard to bring you comprehensive security features. 
            Stay tuned for password management, two-factor authentication, and more!
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <Key className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Password Manager</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Secure password storage and generation</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <Lock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">2FA Setup</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Two-factor authentication for extra security</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <Eye className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Login History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track and monitor account access</p>
            </div>
          </div>

          {/* Notification */}
          <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-left">
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  Security Notice
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Your account is currently secure with our basic authentication system. 
                  Advanced security features will be available soon.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
