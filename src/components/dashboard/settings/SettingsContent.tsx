'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Bell, 
  Shield, 
  Settings, 
  Database, 
  Zap,
  Save,
  Loader2
} from 'lucide-react';

// Import all settings components
import ProfileSettings from './ProfileSettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import ApplicationSettings from './ApplicationSettings';
import SecuritySettings from './SecuritySettings';
import DataManagementSettings from './DataManagementSettings';
import IntegrationSettings from './IntegrationSettings';

interface SettingsContentProps {
  activeSection: string;
  onSave?: () => void;
  isSaving?: boolean;
}

export default function SettingsContent({ 
  activeSection, 
  onSave, 
  isSaving = false 
}: SettingsContentProps) {
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;

      case 'notifications':
        return <NotificationSettings />;

      case 'privacy':
        return <PrivacySettings />;

      case 'application':
        return <ApplicationSettings />;

      case 'security':
        return <SecuritySettings />;

      case 'data-management':
        return <DataManagementSettings />;

      case 'integrations':
        return <IntegrationSettings />;

      default:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Settings
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Select a settings section from the navigation to get started.
            </p>
            <Card className="p-6">
              <div className="text-center text-gray-500 py-8">
                Please select a settings section...
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderSectionContent()}
      
      {/* Save Button - Only show for sections that have save functionality */}
      {activeSection !== 'default' && activeSection !== 'integrations' && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            onClick={onSave} 
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
} 