'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  BarChart2, 
  Activity, 
  Server,
  Shield,
  Database,
  Globe,
  Cpu,
  Clock,
  Eye,
  Settings,
  RefreshCw,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalTools: number;
  totalUsage: number;
  systemHealth: {
    apiStatus: string;
    databaseStatus: string;
    errorRate: number;
    uptime: string;
    responseTime: string;
    lastDowntime: string;
  };
  toolUsage: Array<{
    name: string;
    count: number;
    growth: number;
  }>;
  recentActivity: Array<{
    user: string;
    action: string;
    time: string;
    type: string;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    time: string;
  }>;
  unreadNotifications: number;
  lastUpdated: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      const response = await fetch('/api/admin/dashboard/stats');
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Network error. Please try again.');
    }
  };

  useEffect(() => {
    fetchDashboardStats().finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'online':
      case 'connected':
        return 'text-green-600';
      case 'offline':
      case 'disconnected':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-yellow-600" />
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">System Overview</h2>
          <p className="text-sm text-gray-500">
            Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              ✅ Live Data: Real-time statistics from database
            </span>
            {stats.unreadNotifications > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                🔔 {stats.unreadNotifications} unread notifications
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={refreshData}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTools}</div>
            <p className="text-xs text-muted-foreground">
              Available tools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All-time tool interactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${stats.systemHealth.apiStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${getStatusColor(stats.systemHealth.apiStatus)}`}>
                    {stats.systemHealth.apiStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${stats.systemHealth.databaseStatus === 'Connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-medium ${getStatusColor(stats.systemHealth.databaseStatus)}`}>
                    {stats.systemHealth.databaseStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-green-600">{stats.systemHealth.uptime}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-blue-600">{stats.systemHealth.responseTime}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-sm font-medium text-red-600">{stats.systemHealth.errorRate}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Downtime</span>
                <span className="text-sm text-gray-500">{stats.systemHealth.lastDowntime}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Link href="/admin/system">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Recent Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <Link href="/admin/alerts">
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Alerts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Usage Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart2 className="h-5 w-5" />
            <span>Tool Usage Analytics (Last 24 Hours)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.toolUsage.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.toolUsage.map((tool) => (
                  <div key={tool.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{tool.name}</h4>
                      <Badge variant="secondary">{tool.count}</Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>+{tool.growth}% from last week</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t mt-4">
                <Link href="/admin/tools/analytics">
                  <Button variant="outline" size="sm">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    View Detailed Analytics
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <BarChart2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No tool usage data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'admin_action' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t mt-4">
            <Link href="/admin/activity">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                View All Activity
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-16 flex flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
            </Link>
            
            <Link href="/admin/tools">
              <Button variant="outline" className="w-full h-16 flex flex-col space-y-2">
                <Settings className="h-6 w-6" />
                <span>Manage Tools</span>
              </Button>
            </Link>
            
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full h-16 flex flex-col space-y-2">
                <BarChart2 className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 