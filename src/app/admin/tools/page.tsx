'use client';

import React, { useEffect, useState } from 'react';
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
  const [toolsData, setToolsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToolsData().then(data => {
      setToolsData(data);
      setLoading(false);
    });
  }, []);

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
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Usage Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="w-5 h-5" />
            <span>Tool Usage Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Tool Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Usage Count</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {toolsData.toolUsage.map((tool: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{tool.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{tool.count}</td>
                    <td className="py-3 px-4">
                      <Badge variant={tool.status === 'active' ? 'default' : 'secondary'}>
                        {tool.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {toolsData.recentUpdates.map((update: any, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{update.tool}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{update.update}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{update.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 