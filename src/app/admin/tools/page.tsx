'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Mock API fetch function (replace with real API calls)
async function fetchToolsData() {
  // TODO: Replace with real API call, e.g., fetch('/api/admin/tools')
  return {
    totalTools: 26,
    activeTools: 24,
    toolUsage: [
      { name: 'SWOT Analysis', count: 210, status: 'active' },
      { name: 'Finance Tools', count: 180, status: 'active' },
      { name: 'Diet Planner', count: 150, status: 'active' },
      { name: 'Product Price Tracker', count: 120, status: 'active' },
      { name: 'Resume Reviewer', count: 90, status: 'active' },
      { name: 'Mock Interviewer', count: 80, status: 'active' },
      { name: 'QR Generator', count: 75, status: 'active' },
      { name: 'Password Generator', count: 60, status: 'active' },
    ],
    recentUpdates: [
      { tool: 'SWOT Analysis', update: 'Enhanced AI analysis', time: '2 days ago' },
      { tool: 'Finance Tools', update: 'Added retirement planning', time: '1 week ago' },
      { tool: 'Diet Planner', update: 'Improved nutrition database', time: '2 weeks ago' },
    ]
  };
}

export default function AdminToolsPage() {
  const { isSignedIn, user } = useAuth();
  const [toolsData, setToolsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetchToolsData().then(data => {
        setToolsData(data);
        setLoading(false);
      });
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700 dark:text-gray-200">Please sign in to access admin tools.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin inline-block text-blue-600">
            <Wrench className="w-12 h-12" />
          </div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-200">Loading tools data...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Link href="/" className="inline-block px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors">
          Go to Home
        </Link>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tools</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{toolsData.totalTools}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tools</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{toolsData.activeTools}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {toolsData.toolUsage.reduce((sum: number, tool: any) => sum + tool.count, 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Usage */}
      <div className="mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Wrench className="w-6 h-6 text-blue-600" />
            <CardTitle>Tool Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {toolsData.toolUsage.map((tool: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900 dark:text-white">{tool.name}</span>
                    <Badge variant={tool.status === 'active' ? 'default' : 'secondary'}>
                      {tool.status}
                    </Badge>
                  </div>
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">{tool.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Updates */}
      <div className="mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {toolsData.recentUpdates.map((update: any, idx: number) => (
                <li key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{update.tool}</span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{update.update}</p>
                  </div>
                  <span className="text-xs text-gray-400">{update.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 