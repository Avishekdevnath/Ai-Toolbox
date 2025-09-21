'use client';

import { useState, useEffect } from 'react';

interface UserPreferences {
  defaultExpirationDays?: number;
  autoGenerateAlias: boolean;
  enableAnalytics: boolean;
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultTags?: string[];
  maxUrlsPerDay?: number;
  customDomain?: string;
}

interface UserPreferencesProps {
  onClose: () => void;
}

export default function UserPreferences({ onClose }: UserPreferencesProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    autoGenerateAlias: true,
    enableAnalytics: true,
    emailNotifications: false,
    theme: 'system',
    maxUrlsPerDay: 100
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/url-shortener/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
      setError('Failed to load preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/url-shortener/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSuccess('Preferences saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setPreferences(prev => ({
      ...prev,
      defaultTags: tags
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              ⚙️ URL Shortener Preferences
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Customize your URL shortening experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error and Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 text-sm">{success}</p>
            </div>
          )}

          {/* General Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Expiration (days)
              </label>
              <input
                type="number"
                min="1"
                max="3650"
                value={preferences.defaultExpirationDays || ''}
                onChange={(e) => handleInputChange('defaultExpirationDays', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Leave empty for no expiration"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Set a default expiration time for new URLs (1-3650 days)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max URLs per day
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={preferences.maxUrlsPerDay || 100}
                onChange={(e) => handleInputChange('maxUrlsPerDay', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum number of URLs you can create per day
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Domain (Optional)
              </label>
              <input
                type="text"
                value={preferences.customDomain || ''}
                onChange={(e) => handleInputChange('customDomain', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="example.com"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Use your own domain for shortened URLs (requires setup)
              </p>
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Behavior Settings</h3>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.autoGenerateAlias}
                  onChange={(e) => handleInputChange('autoGenerateAlias', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Auto-generate aliases when not specified
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.enableAnalytics}
                  onChange={(e) => handleInputChange('enableAnalytics', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Enable detailed analytics tracking
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Email notifications for URL activity
                </span>
              </label>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={preferences.theme}
                onChange={(e) => handleInputChange('theme', e.target.value as 'light' | 'dark' | 'system')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {/* Default Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Default Tags</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Tags (comma-separated)
              </label>
              <input
                type="text"
                value={preferences.defaultTags?.join(', ') || ''}
                onChange={(e) => handleTagsChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="work, personal, project"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tags will be automatically added to new URLs
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
