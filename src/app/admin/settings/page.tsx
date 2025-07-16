import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="w-6 h-6 text-gray-700 dark:text-gray-200" />Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Configure admin dashboard settings and preferences.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Integrate real settings here */}
          <div className="text-gray-500 dark:text-gray-400">
            Coming soon: Admin settings and configuration.
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 