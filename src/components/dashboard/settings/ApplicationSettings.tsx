'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Palette, Maximize2, Save, Target, List } from 'lucide-react';
import SettingsCard from './SettingsCard';
import SettingsSection from './SettingsSection';
import ToggleSwitch from './ToggleSwitch';
import ColorPicker, { themeOptions } from './ColorPicker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useSettings } from './hooks/useSettings';

interface ApplicationSettingsProps {
  className?: string;
}

export default function ApplicationSettings({ className = '' }: ApplicationSettingsProps) {
  const { settings, updateSection, saving, error } = useSettings();
  
  const [formData, setFormData] = useState({
    theme: 'auto' as 'light' | 'dark' | 'auto',
    compactMode: false,
    autoSave: true,
    defaultTool: 'swot-analysis',
    resultsPerPage: 20
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize form data from settings
  useEffect(() => {
    if (settings?.application) {
      setFormData({
        theme: settings.application.theme || 'auto',
        compactMode: settings.application.compactMode ?? false,
        autoSave: settings.application.autoSave ?? true,
        defaultTool: settings.application.defaultTool || 'swot-analysis',
        resultsPerPage: settings.application.resultsPerPage || 20
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

  const handleThemeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      theme: value as 'light' | 'dark' | 'auto'
    }));
    setIsDirty(true);
  };

  const handleDefaultToolChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      defaultTool: value
    }));
    setIsDirty(true);
  };

  const handleResultsPerPageChange = (value: number[]) => {
    setFormData(prev => ({
      ...prev,
      resultsPerPage: value[0]
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateSection('application', formData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to update application settings:', error);
    }
  };

  const handleReset = () => {
    if (settings?.application) {
      setFormData({
        theme: settings.application.theme || 'auto',
        compactMode: settings.application.compactMode ?? false,
        autoSave: settings.application.autoSave ?? true,
        defaultTool: settings.application.defaultTool || 'swot-analysis',
        resultsPerPage: settings.application.resultsPerPage || 20
      });
    }
    setIsDirty(false);
  };

  const toolOptions = [
    { value: 'swot-analysis', label: 'SWOT Analysis' },
    { value: 'quote-generator', label: 'Quote Generator' },
    { value: 'resume-reviewer', label: 'Resume Reviewer' },
    { value: 'age-calculator', label: 'Age Calculator' },
    { value: 'diet-planner', label: 'Diet Planner' },
    { value: 'qr-generator', label: 'QR Generator' },
    { value: 'url-shortener', label: 'URL Shortener' },
    { value: 'unit-converter', label: 'Unit Converter' },
    { value: 'password-generator', label: 'Password Generator' },
    { value: 'tip-calculator', label: 'Tip Calculator' },
    { value: 'word-counter', label: 'Word Counter' },
    { value: 'price-tracker', label: 'Price Tracker' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Application Settings
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400">
        Customize your application experience and preferences.
      </p>

      <SettingsCard
        title="Appearance"
        description="Customize the look and feel of the application"
        icon={<Palette className="w-5 h-5" />}
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
          <SettingsSection title="Theme" description="Choose your preferred color theme">
            <ColorPicker
              value={formData.theme}
              onValueChange={handleThemeChange}
              options={themeOptions}
              label="Application Theme"
              description="Select your preferred color scheme"
            />
          </SettingsSection>

          <SettingsSection title="Compact Mode" description="Reduce spacing for a more compact layout">
            <ToggleSwitch
              checked={formData.compactMode}
              onCheckedChange={(value) => handleToggleChange('compactMode', value)}
              label="Enable compact mode"
              description="Reduce spacing and padding for a more compact interface"
            />
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Behavior"
        description="Configure how the application behaves"
        icon={<Settings className="w-5 h-5" />}
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
          <SettingsSection title="Auto-Save" description="Automatically save your work">
            <ToggleSwitch
              checked={formData.autoSave}
              onCheckedChange={(value) => handleToggleChange('autoSave', value)}
              label="Enable auto-save"
              description="Automatically save your work as you type"
            />
          </SettingsSection>

          <SettingsSection title="Default Tool" description="Choose your default tool">
            <div className="space-y-2">
              <Label htmlFor="defaultTool">Default Tool</Label>
              <Select value={formData.defaultTool} onValueChange={handleDefaultToolChange}>
                <SelectTrigger id="defaultTool">
                  <SelectValue placeholder="Select default tool" />
                </SelectTrigger>
                <SelectContent>
                  {toolOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This tool will be selected by default when you visit the tools page
              </p>
            </div>
          </SettingsSection>

          <SettingsSection title="Results Per Page" description="Set the number of results to display per page">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Results Per Page: {formData.resultsPerPage}</Label>
                <Slider
                  value={[formData.resultsPerPage]}
                  onValueChange={handleResultsPerPageChange}
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                This setting affects how many items are shown in lists and search results
              </p>
            </div>
          </SettingsSection>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Performance"
        description="Optimize application performance"
        icon={<Maximize2 className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Performance Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Compact mode can improve performance on slower devices</li>
              <li>• Lower results per page can speed up loading times</li>
              <li>• Auto-save may use more resources but prevents data loss</li>
              <li>• Dark theme can reduce eye strain in low-light conditions</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Settings Impact</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>• Theme: {formData.theme === 'auto' ? 'Follows system preference' : formData.theme}</p>
              <p>• Compact Mode: {formData.compactMode ? 'Enabled (faster loading)' : 'Disabled (more spacious)'}</p>
              <p>• Auto-Save: {formData.autoSave ? 'Enabled (prevents data loss)' : 'Disabled (manual save required)'}</p>
              <p>• Results Per Page: {formData.resultsPerPage} items (affects loading speed)</p>
            </div>
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