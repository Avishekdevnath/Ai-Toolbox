'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Download, Webhook, Key } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsSection from './SettingsSection';
import ToggleSwitch from './ToggleSwitch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSettings } from './hooks/useSettings';

interface IntegrationSettingsProps {
  className?: string;
}

export default function IntegrationSettings({ className = '' }: IntegrationSettingsProps) {
  const { settings, updateSection, saving, error } = useSettings();
  
  const [formData, setFormData] = useState({
    exportFormat: 'json' as 'json' | 'csv' | 'pdf',
    autoExport: false,
    webhookUrl: '',
    apiKey: ''
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    if (settings?.integrations) {
      setFormData({
        exportFormat: settings.integrations.exportFormat || 'json',
        autoExport: settings.integrations.autoExport ?? false,
        webhookUrl: settings.integrations.webhookUrl || '',
        apiKey: settings.integrations.apiKey || ''
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  };

  const handleExportFormatChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      exportFormat: value as 'json' | 'csv' | 'pdf'
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSection('integrations', formData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to update integration settings:', error);
    }
  };

  const handleReset = () => {
    if (settings?.integrations) {
      setFormData({
        exportFormat: settings.integrations.exportFormat || 'json',
        autoExport: settings.integrations.autoExport ?? false,
        webhookUrl: settings.integrations.webhookUrl || '',
        apiKey: settings.integrations.apiKey || ''
      });
    }
    setIsDirty(false);
  };

  const handleGenerateApiKey = () => {
    // In a real app, this would generate a new API key
    const newApiKey = 'sk_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setFormData(prev => ({
      ...prev,
      apiKey: newApiKey
    }));
    setIsDirty(true);
  };

  const handleTestWebhook = () => {
    // In a real app, this would test the webhook
    alert('Webhook test would be implemented here');
  };

  const exportFormatOptions = [
    { value: 'json', label: 'JSON', description: 'Structured data format, best for developers' },
    { value: 'csv', label: 'CSV', description: 'Spreadsheet format, good for data analysis' },
    { value: 'pdf', label: 'PDF', description: 'Document format, good for reports and sharing' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Zap className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Integration Settings
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        Manage API keys, webhooks, and third-party integrations.
      </p>

      <SettingsCard
        title="Export Configuration"
        description="Configure how your data is exported"
        icon={<Download className="w-5 h-5" />}
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
          <SettingsSection title="Export Format" description="Choose the format for exported data">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select value={formData.exportFormat} onValueChange={handleExportFormatChange}>
                <SelectTrigger id="exportFormat">
                  <SelectValue placeholder="Select export format" />
                </SelectTrigger>
                <SelectContent>
                  {exportFormatOptions.map((option) => (
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
                This format will be used for all data exports
              </p>
            </div>
          </SettingsSection>

          <SettingsSection title="Automatic Export" description="Automatically export data on schedule">
            <ToggleSwitch
              checked={formData.autoExport}
              onCheckedChange={(value) => handleToggleChange('autoExport', value)}
              label="Enable automatic data export"
              description="Automatically export your data according to your backup schedule"
            />
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Webhook Configuration"
        description="Set up webhooks for real-time data integration"
        icon={<Webhook className="w-5 h-5" />}
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
          <SettingsSection title="Webhook URL" description="Configure webhook endpoint for real-time notifications">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL</Label>
              <Input
                id="webhookUrl"
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
                placeholder="https://your-domain.com/webhook"
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                We'll send POST requests to this URL when events occur
              </p>
              {formData.webhookUrl && (
                <Button onClick={handleTestWebhook} variant="outline" size="sm">
                  Test Webhook
                </Button>
              )}
            </div>
          </SettingsSection>

          <SettingsSection title="Webhook Events" description="Configure which events trigger webhooks">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Analysis Complete</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send webhook when analysis is finished
                  </p>
                </div>
                <ToggleSwitch
                  checked={true}
                  onCheckedChange={() => {}}
                  label=""
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Account Updates</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send webhook when account settings change
                  </p>
                </div>
                <ToggleSwitch
                  checked={true}
                  onCheckedChange={() => {}}
                  label=""
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Error Events</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Send webhook when errors occur
                  </p>
                </div>
                <ToggleSwitch
                  checked={false}
                  onCheckedChange={() => {}}
                  label=""
                />
              </div>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="API Configuration"
        description="Manage your API keys and access"
        icon={<Key className="w-5 h-5" />}
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
          <SettingsSection title="API Key" description="Your API key for programmatic access">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Keep your API key secure and never share it publicly
              </p>
              <div className="flex gap-2">
                <Button onClick={handleGenerateApiKey} variant="outline" size="sm">
                  Generate New Key
                </Button>
                <Button variant="outline" size="sm">
                  Copy Key
                </Button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="API Permissions" description="Configure what your API key can access">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Read Access</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow reading data and analyses
                  </p>
                </div>
                <ToggleSwitch
                  checked={true}
                  onCheckedChange={() => {}}
                  label=""
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Write Access</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow creating and updating data
                  </p>
                </div>
                <ToggleSwitch
                  checked={true}
                  onCheckedChange={() => {}}
                  label=""
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Admin Access</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow administrative operations
                  </p>
                </div>
                <ToggleSwitch
                  checked={false}
                  onCheckedChange={() => {}}
                  label=""
                />
              </div>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Integration Information"
        description="Learn more about integrations and API usage"
        icon={<Zap className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">API Documentation</h4>
            <p className="text-sm text-blue-800 mb-3">
              Learn how to integrate with our API and use webhooks for real-time data synchronization.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                API Documentation
              </Button>
              <Button variant="outline" size="sm">
                Webhook Guide
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Integration Status</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Export format: {formData.exportFormat.toUpperCase()}</p>
              <p>• Auto-export: {formData.autoExport ? 'Enabled' : 'Disabled'}</p>
              <p>• Webhook: {formData.webhookUrl ? 'Configured' : 'Not configured'}</p>
              <p>• API key: {formData.apiKey ? 'Set' : 'Not set'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Integration Logs
            </Button>
            <Button variant="outline" size="sm">
              Rate Limits
            </Button>
            <Button variant="outline" size="sm">
              Support
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