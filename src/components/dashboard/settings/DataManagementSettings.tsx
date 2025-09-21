'use client';

import React, { useState, useEffect } from 'react';
import { Database, Trash2, Download, Upload, Clock } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsSection from './SettingsSection';
import ToggleSwitch from './ToggleSwitch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useSettings } from './hooks/useSettings';

interface DataManagementSettingsProps {
  className?: string;
}

export default function DataManagementSettings({ className = '' }: DataManagementSettingsProps) {
  const { settings, updateSection, saving, error } = useSettings();
  
  const [formData, setFormData] = useState({
    autoDeleteOldAnalyses: false,
    retentionPeriod: 365,
    backupFrequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    exportData: false
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    if (settings?.dataManagement) {
      setFormData({
        autoDeleteOldAnalyses: settings.dataManagement.autoDeleteOldAnalyses ?? false,
        retentionPeriod: settings.dataManagement.retentionPeriod || 365,
        backupFrequency: settings.dataManagement.backupFrequency || 'weekly',
        exportData: settings.dataManagement.exportData ?? false
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

  const handleRetentionPeriodChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      retentionPeriod: value[0]
    }));
    setIsDirty(true);
  };

  const handleBackupFrequencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      backupFrequency: value as 'daily' | 'weekly' | 'monthly'
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSection('dataManagement', formData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to update data management settings:', error);
    }
  };

  const handleReset = () => {
    if (settings?.dataManagement) {
      setFormData({
        autoDeleteOldAnalyses: settings.dataManagement.autoDeleteOldAnalyses ?? false,
        retentionPeriod: settings.dataManagement.retentionPeriod || 365,
        backupFrequency: settings.dataManagement.backupFrequency || 'weekly',
        exportData: settings.dataManagement.exportData ?? false
      });
    }
    setIsDirty(false);
  };

  const handleExportData = () => {
    // In a real app, this would trigger data export
    alert('Data export would be implemented here');
  };

  const handleImportData = () => {
    // In a real app, this would trigger data import
    alert('Data import would be implemented here');
  };

  const formatRetentionPeriod = (days: number) => {
    if (days === 30) return '30 days (1 month)';
    if (days === 90) return '90 days (3 months)';
    if (days === 180) return '180 days (6 months)';
    if (days === 365) return '365 days (1 year)';
    if (days === 730) return '730 days (2 years)';
    return `${days} days`;
  };

  const backupFrequencyOptions = [
    { value: 'daily', label: 'Daily', description: 'Backup your data every day' },
    { value: 'weekly', label: 'Weekly', description: 'Backup your data every week' },
    { value: 'monthly', label: 'Monthly', description: 'Backup your data every month' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Data Management
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        Control your data retention, backups, and export settings.
      </p>

      <SettingsCard
        title="Data Retention"
        description="Control how long your data is kept"
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
          <SettingsSection title="Auto-Delete Old Analyses" description="Automatically delete old analysis data">
            <ToggleSwitch
              checked={formData.autoDeleteOldAnalyses}
              onCheckedChange={(value) => handleToggleChange('autoDeleteOldAnalyses', value)}
              label="Automatically delete old analyses"
              description="Delete analysis data older than the retention period"
            />
          </SettingsSection>

          <SettingsSection title="Retention Period" description="Set how long to keep your analysis data">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Retention Period: {formatRetentionPeriod(formData.retentionPeriod)}</Label>
                <Slider
                  value={[formData.retentionPeriod]}
                  onValueChange={handleRetentionPeriodChange}
                  max={2555}
                  min={30}
                  step={30}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>30 days</span>
                  <span>1 year</span>
                  <span>7 years</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Data older than this period will be automatically deleted if auto-delete is enabled
              </p>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Backup Settings"
        description="Configure automatic data backups"
        icon={<Upload className="w-5 h-5" />}
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
          <SettingsSection title="Backup Frequency" description="How often to create automatic backups">
            <div className="space-y-2">
              <Label htmlFor="backupFrequency">Backup Frequency</Label>
              <Select value={formData.backupFrequency} onValueChange={handleBackupFrequencyChange}>
                <SelectTrigger id="backupFrequency">
                  <SelectValue placeholder="Select backup frequency" />
                </SelectTrigger>
                <SelectContent>
                  {backupFrequencyOptions.map((option) => (
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
                Automatic backups help protect your data from loss
              </p>
            </div>
          </SettingsSection>

          <SettingsSection title="Manual Backup" description="Create a backup of your data now">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Create a manual backup of all your data including analyses, settings, and preferences.
              </p>
              <Button onClick={handleExportData} variant="outline" size="sm">
                Create Backup Now
              </Button>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Data Export & Import"
        description="Export your data or import from other sources"
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
          <SettingsSection title="Automatic Export" description="Automatically export your data">
            <ToggleSwitch
              checked={formData.exportData}
              onCheckedChange={(value) => handleToggleChange('exportData', value)}
              label="Enable automatic data export"
              description="Automatically export your data according to backup frequency"
            />
          </SettingsSection>

          <SettingsSection title="Export Options" description="Export your data in different formats">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Export All Data</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Download all your data including analyses, settings, and preferences.
                  </p>
                  <Button onClick={handleExportData} size="sm" className="w-full">
                    Export Data
                  </Button>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Import Data</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Import data from a previous export or backup file.
                  </p>
                  <Button onClick={handleImportData} variant="outline" size="sm" className="w-full">
                    Import Data
                  </Button>
                </div>
              </div>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Data Information"
        description="Learn more about your data and privacy"
        icon={<Database className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Your Data Rights</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You can export all your data at any time</li>
              <li>• You can request deletion of your data</li>
              <li>• You control how long your data is retained</li>
              <li>• Your data is encrypted and stored securely</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Data Status</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Auto-delete: {formData.autoDeleteOldAnalyses ? 'Enabled' : 'Disabled'}</p>
              <p>• Retention period: {formatRetentionPeriod(formData.retentionPeriod)}</p>
              <p>• Backup frequency: {formData.backupFrequency}</p>
              <p>• Auto-export: {formData.exportData ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Data Usage Report
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