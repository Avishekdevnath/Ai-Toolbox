'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Eye, BarChart3, Database } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsSection from './SettingsSection';
import ToggleSwitch from './ToggleSwitch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSettings } from './hooks/useSettings';
import { Button } from '@/components/ui/button';

interface PrivacySettingsProps {
  className?: string;
}

export default function PrivacySettings({ className = '' }: PrivacySettingsProps) {
  const { settings, updateSection, saving, error } = useSettings();
  
  const [formData, setFormData] = useState({
    profileVisibility: 'private' as 'public' | 'private' | 'friends',
    shareAnalytics: false,
    allowDataCollection: true,
    showUsageStats: true
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    if (settings?.privacy) {
      setFormData({
        profileVisibility: settings.privacy.profileVisibility || 'private',
        shareAnalytics: settings.privacy.shareAnalytics ?? false,
        allowDataCollection: settings.privacy.allowDataCollection ?? true,
        showUsageStats: settings.privacy.showUsageStats ?? true
      });
    }
  }, [settings]);

  const handleToggleChange = (setting: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [setting]: value
    }));
    setIsDirty(true);
  };

  const handleVisibilityChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      profileVisibility: value as 'public' | 'private' | 'friends'
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSection('privacy', formData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
    }
  };

  const handleReset = () => {
    if (settings?.privacy) {
      setFormData({
        profileVisibility: settings.privacy.profileVisibility || 'private',
        shareAnalytics: settings.privacy.shareAnalytics ?? false,
        allowDataCollection: settings.privacy.allowDataCollection ?? true,
        showUsageStats: settings.privacy.showUsageStats ?? true
      });
    }
    setIsDirty(false);
  };

  const visibilityOptions = [
    {
      value: 'public',
      label: 'Public',
      description: 'Your profile and activity are visible to everyone'
    },
    {
      value: 'friends',
      label: 'Friends Only',
      description: 'Your profile is visible only to your connections'
    },
    {
      value: 'private',
      label: 'Private',
      description: 'Your profile is hidden from everyone'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Privacy Settings
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        Manage your privacy preferences and data sharing settings.
      </p>

      <SettingsCard
        title="Profile Visibility"
        description="Control who can see your profile and activity"
        icon={<Eye className="w-5 h-5" />}
        actions={
          isDirty && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-6">
          <SettingsSection title="Profile Visibility" description="Choose who can see your profile">
            <div className="space-y-2">
              <Label htmlFor="profileVisibility">Profile Visibility</Label>
              <Select value={formData.profileVisibility} onValueChange={handleVisibilityChange}>
                <SelectTrigger id="profileVisibility">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This setting controls who can see your profile information and activity
              </p>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Data Sharing"
        description="Control how your data is shared and used"
        icon={<Database className="w-5 h-5" />}
        actions={
          isDirty && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )
        }
      >
        <div className="space-y-6">
          <SettingsSection title="Analytics Sharing" description="Help improve the platform by sharing usage data">
            <ToggleSwitch
              checked={formData.shareAnalytics}
              onCheckedChange={(value) => handleToggleChange('shareAnalytics', value)}
              label="Share analytics data"
              description="Allow us to use your usage data to improve our services (anonymized)"
            />
          </SettingsSection>

          <SettingsSection title="Data Collection" description="Control data collection for personalization">
            <ToggleSwitch
              checked={formData.allowDataCollection}
              onCheckedChange={(value) => handleToggleChange('allowDataCollection', value)}
              label="Allow data collection for personalization"
              description="We collect data to provide personalized recommendations and improve your experience"
            />
          </SettingsSection>

          <SettingsSection title="Usage Statistics" description="Show your usage statistics in the dashboard">
            <ToggleSwitch
              checked={formData.showUsageStats}
              onCheckedChange={(value) => handleToggleChange('showUsageStats', value)}
              label="Show usage statistics"
              description="Display your tool usage statistics and analytics in your dashboard"
            />
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Privacy Information"
        description="Learn more about how we protect your privacy"
        icon={<Shield className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Your Privacy Rights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You can request a copy of your data at any time</li>
              <li>• You can delete your account and all associated data</li>
              <li>• We never sell your personal information to third parties</li>
              <li>• All data is encrypted and stored securely</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Data Protection</h4>
            <p className="text-sm text-gray-700">
              We follow industry best practices to protect your data. All information is encrypted in transit and at rest, 
              and we regularly audit our security measures to ensure your privacy is protected.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Download My Data
            </Button>
            <Button variant="outline" size="sm">
              Privacy Policy
            </Button>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </div>
      </SettingsCard>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 