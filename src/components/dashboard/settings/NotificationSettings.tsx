'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Clock } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsSection from './SettingsSection';
import ToggleSwitch from './ToggleSwitch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useSettings } from './hooks/useSettings';

interface NotificationSettingsProps {
  className?: string;
}

export default function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const { settings, updateSection, saving, error } = useSettings();
  
  const [formData, setFormData] = useState({
    email: {
      analysisResults: true,
      weeklyReports: false,
      systemUpdates: true,
      marketing: false
    },
    push: {
      analysisComplete: true,
      newFeatures: true,
      reminders: false
    },
    frequency: 'immediate' as 'immediate' | 'daily' | 'weekly'
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    if (settings?.notifications) {
      setFormData({
        email: {
          analysisResults: settings.notifications.email.analysisResults ?? true,
          weeklyReports: settings.notifications.email.weeklyReports ?? false,
          systemUpdates: settings.notifications.email.systemUpdates ?? true,
          marketing: settings.notifications.email.marketing ?? false
        },
        push: {
          analysisComplete: settings.notifications.push.analysisComplete ?? true,
          newFeatures: settings.notifications.push.newFeatures ?? true,
          reminders: settings.notifications.push.reminders ?? false
        },
        frequency: settings.notifications.frequency || 'immediate'
      });
    }
  }, [settings]);

  const handleToggleChange = (category: 'email' | 'push', setting: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setIsDirty(true);
  };

  const handleFrequencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      frequency: value as 'immediate' | 'daily' | 'weekly'
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSection('notifications', formData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const handleReset = () => {
    if (settings?.notifications) {
      setFormData({
        email: {
          analysisResults: settings.notifications.email.analysisResults ?? true,
          weeklyReports: settings.notifications.email.weeklyReports ?? false,
          systemUpdates: settings.notifications.email.systemUpdates ?? true,
          marketing: settings.notifications.email.marketing ?? false
        },
        push: {
          analysisComplete: settings.notifications.push.analysisComplete ?? true,
          newFeatures: settings.notifications.push.newFeatures ?? true,
          reminders: settings.notifications.push.reminders ?? false
        },
        frequency: settings.notifications.frequency || 'immediate'
      });
    }
    setIsDirty(false);
  };

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate', description: 'Receive notifications as soon as they occur' },
    { value: 'daily', label: 'Daily Digest', description: 'Receive a summary once per day' },
    { value: 'weekly', label: 'Weekly Digest', description: 'Receive a summary once per week' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Bell className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Notification Settings
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        Control how and when you receive notifications.
      </p>

      <SettingsCard
        title="Email Notifications"
        description="Manage your email notification preferences"
        icon={<Mail className="w-5 h-5" />}
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
          <SettingsSection title="Analysis Results" description="Get notified when your AI analysis is complete">
            <ToggleSwitch
              checked={formData.email.analysisResults}
              onCheckedChange={(value) => handleToggleChange('email', 'analysisResults', value)}
              label="Email me when analysis results are ready"
              description="Receive an email notification when your AI analysis is complete"
            />
          </SettingsSection>

          <SettingsSection title="Weekly Reports" description="Receive weekly summaries of your activity">
            <ToggleSwitch
              checked={formData.email.weeklyReports}
              onCheckedChange={(value) => handleToggleChange('email', 'weeklyReports', value)}
              label="Send me weekly activity reports"
              description="Get a summary of your tool usage and insights every week"
            />
          </SettingsSection>

          <SettingsSection title="System Updates" description="Stay informed about platform updates">
            <ToggleSwitch
              checked={formData.email.systemUpdates}
              onCheckedChange={(value) => handleToggleChange('email', 'systemUpdates', value)}
              label="Notify me about system updates"
              description="Receive emails about new features, maintenance, and important updates"
            />
          </SettingsSection>

          <SettingsSection title="Marketing Communications" description="Receive promotional content and offers">
            <ToggleSwitch
              checked={formData.email.marketing}
              onCheckedChange={(value) => handleToggleChange('email', 'marketing', value)}
              label="Send me promotional emails"
              description="Receive emails about new tools, features, and special offers"
            />
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Push Notifications"
        description="Manage in-app and browser notifications"
        icon={<Smartphone className="w-5 h-5" />}
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
          <SettingsSection title="Analysis Complete" description="Get notified when analysis is ready">
            <ToggleSwitch
              checked={formData.push.analysisComplete}
              onCheckedChange={(value) => handleToggleChange('push', 'analysisComplete', value)}
              label="Notify me when analysis is complete"
              description="Show a notification when your AI analysis is ready"
            />
          </SettingsSection>

          <SettingsSection title="New Features" description="Stay updated on new tools and features">
            <ToggleSwitch
              checked={formData.push.newFeatures}
              onCheckedChange={(value) => handleToggleChange('push', 'newFeatures', value)}
              label="Notify me about new features"
              description="Get notified when new tools and features are available"
            />
          </SettingsSection>

          <SettingsSection title="Reminders" description="Receive helpful reminders">
            <ToggleSwitch
              checked={formData.push.reminders}
              onCheckedChange={(value) => handleToggleChange('push', 'reminders', value)}
              label="Send me reminders"
              description="Receive reminders about incomplete analyses or unused tools"
            />
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Notification Frequency"
        description="Control how often you receive notifications"
        icon={<Clock className="w-5 h-5" />}
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
          <SettingsSection title="Email Frequency" description="Choose how often you receive email notifications">
            <div className="space-y-2">
              <Label htmlFor="frequency">Email Frequency</Label>
              <Select value={formData.frequency} onValueChange={handleFrequencyChange}>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
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
                This setting applies to all email notifications except immediate analysis results
              </p>
            </div>
          </SettingsSection>
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