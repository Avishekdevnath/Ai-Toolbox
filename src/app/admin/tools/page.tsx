'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity,
  Clock,
  RefreshCw,
  Filter,
  Download,
  Eye,
  Share,
  Zap
} from 'lucide-react';

interface ToolUsageStats {
  toolSlug: string;
  toolName: string;
  totalUsage: number;
  uniqueUsers: number;
  usageByType: Array<{ type: string; count: number }>;
  lastUsed: string;
  firstUsed: string;
  avgUsagePerUser: number;
}

interface UsageByType {
  _id: string;
  count: number;
}

interface DailyUsage {
  _id: string;
  tools: Array<{ toolSlug: string; count: number }>;
  totalCount: number;
}

interface RecentActivity {
  _id: string;
  userId: {
    firstName: string;
    lastName: string;
    email: string;
  };
  toolSlug: string;
  toolName: string;
  usageType: string;
  createdAt: string;
}

interface OverallStats {
  totalUsage: number;
  totalUniqueUsers: number;
  totalTools: number;
  averageUsagePerTool: number;
  averageUsagePerUser: number;
}

interface ToolUsageData {
  overallStats: OverallStats;
  toolUsageStats: ToolUsageStats[];
  usageByType: UsageByType[];
  dailyUsage: DailyUsage[];
  topTools: ToolUsageStats[];
  recentActivity: RecentActivity[];
  timeRange: string;
  generatedAt: string;
}

export default function ToolUsageDashboard() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [data, setData] = useState<ToolUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedTool, setSelectedTool] = useState('all');

  const fetchToolUsageData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/tools/usage?timeRange=${timeRange}&toolSlug=${selectedTool}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          console.error('Failed to fetch tool usage data:', result.error);
        }
      } else {
        console.error('Failed to fetch tool usage data:', response.status);
      }
    } catch (error) {
      console.error('Error fetching tool usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchToolUsageData();
  };

  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
  };

  const handleToolFilterChange = (toolSlug: string) => {
    setSelectedTool(toolSlug);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchToolUsageData();
    }
  }, [isAuthenticated, timeRange, selectedTool]);

  const getUsageTypeIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4" />;
      case 'generate':
        return <Zap className="w-4 h-4" />;
      case 'download':
        return <Download className="w-4 h-4" />;
      case 'share':
        return <Share className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timeRangeOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Tool Usage Dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tool Usage Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze tool performance and usage patterns</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Tool Filter:</span>
          <select
            value={selectedTool}
            onChange={(e) => handleToolFilterChange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tools</option>
            {data?.toolUsageStats.map(tool => (
              <option key={tool.toolSlug} value={tool.toolSlug}>
                {tool.toolName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.overallStats.totalUsage.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total tool interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.overallStats.totalUniqueUsers.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.overallStats.totalTools || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tools with usage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Usage/User</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.overallStats.averageUsagePerUser.toFixed(1) || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Average interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Tools */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Top Performing Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.topTools.map((tool, index) => (
            <Card key={tool.toolSlug} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    #{index + 1} {tool.toolName}
                  </CardTitle>
                  <span className="text-xs text-gray-500">
                    {tool.toolSlug}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Total Usage:</span>
                  <span className="font-semibold">{tool.totalUsage.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Unique Users:</span>
                  <span className="font-semibold">{tool.uniqueUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Avg/User:</span>
                  <span className="font-semibold">{tool.avgUsagePerUser.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Last Used:</span>
                  <span className="text-xs">{formatDate(tool.lastUsed)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage by Type */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Usage by Type
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.usageByType.map((usage) => (
            <Card key={usage._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {usage._id}
                </CardTitle>
                {getUsageTypeIcon(usage._id)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usage.count.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((usage.count / (data?.overallStats.totalUsage || 1)) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Activity
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.recentActivity.map((activity) => (
                    <tr key={activity._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {activity.userId.firstName} {activity.userId.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.userId.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {activity.toolName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activity.toolSlug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getUsageTypeIcon(activity.usageType)}
                          <span className="text-sm text-gray-900 capitalize">
                            {activity.usageType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(activity.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Tool Usage Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Complete Tool Usage Report
        </h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tool
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unique Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg/User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      First Used
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Used
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.toolUsageStats.map((tool) => (
                    <tr key={tool.toolSlug} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {tool.toolName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tool.toolSlug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tool.totalUsage.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tool.uniqueUsers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tool.avgUsagePerUser.toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tool.firstUsed)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tool.lastUsed)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 