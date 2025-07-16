'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, CheckCircle, AlertCircle, BarChart2, Activity, Server } from 'lucide-react';
import Link from 'next/link';

// Mock API fetch function (replace with real API calls)
async function fetchAdminStats() {
  // TODO: Replace with real API call, e.g., fetch('/api/admin/stats')
  return {
    totalUsers: 1243,
    activeUsers: 312,
    toolUsage: [
      { name: 'SWOT Analysis', count: 210 },
      { name: 'Finance Tools', count: 180 },
      { name: 'Diet Planner', count: 150 },
      { name: 'Product Price Tracker', count: 120 },
      { name: 'Resume Reviewer', count: 90 },
      { name: 'Mock Interviewer', count: 80 },
      { name: 'QR Generator', count: 75 },
      { name: 'Password Generator', count: 60 },
    ],
    systemHealth: {
      apiStatus: 'Online',
      errorRate: 0.2,
      lastDowntime: '2024-07-01 10:15',
      uptime: '99.98%'
    },
    recentActivity: [
      { user: 'alex@example.com', action: 'Used SWOT Analysis', time: '2 min ago' },
      { user: 'priya@example.com', action: 'Generated Resume', time: '5 min ago' },
      { user: 'sam@example.com', action: 'Shortened URL', time: '10 min ago' },
      { user: 'jane@example.com', action: 'Tracked Product Price', time: '15 min ago' },
    ]
  };
}

export default function AdminDashboard() {
  // TODO: Add authentication/authorization for admin access
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin inline-block text-blue-600">
            <Server className="w-12 h-12" />
          </div>
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-200">Loading admin dashboard...</p>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-gray-500">All registered users</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <CardTitle>Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeUsers}</div>
            <div className="text-sm text-gray-500">Active in last 24h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <CardTitle>API Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${stats.systemHealth.apiStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="font-semibold">{stats.systemHealth.apiStatus}</span>
            </div>
            <div className="text-sm text-gray-500">Uptime: {stats.systemHealth.uptime}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <CardTitle>Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.systemHealth.errorRate}%</div>
            <div className="text-sm text-gray-500">Last downtime: {stats.systemHealth.lastDowntime}</div>
          </CardContent>
        </Card>
      </div>
      {/* Tool Usage Section */}
      <div className="mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <BarChart2 className="w-6 h-6 text-indigo-600" />
            <CardTitle>Tool Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {stats.toolUsage.map((tool: any) => (
                <div key={tool.name} className="flex items-center gap-2">
                  <Badge>{tool.name}</Badge>
                  <span className="font-semibold">{tool.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Activity Section */}
      <div className="mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Activity className="w-6 h-6 text-orange-600" />
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.recentActivity.map((item: any, idx: number) => (
                <li key={idx} className="py-2 flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{item.user}</span>
                  <span className="text-gray-600 dark:text-gray-400">{item.action}</span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      {/* Analytics/Charts Placeholder */}
      <div className="mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <BarChart2 className="w-6 h-6 text-blue-500" />
            <CardTitle>Analytics & Charts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-500 dark:text-gray-400">
              {/* TODO: Integrate real analytics/charts here (e.g., with recharts, nivo, chart.js) */}
              <span>Coming soon: Visual analytics for user growth, tool trends, and more.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 