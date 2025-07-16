import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Server, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSystemPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Server className="w-6 h-6 text-gray-700 dark:text-gray-200" />System</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor system health and status.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Replace with real system health data */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold">API Status:</span>
              <span>Online</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Uptime:</span>
              <span>99.98%</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-semibold">Error Rate:</span>
              <span>0.2%</span>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Last Downtime:</span>
              <span>2024-07-01 10:15</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 