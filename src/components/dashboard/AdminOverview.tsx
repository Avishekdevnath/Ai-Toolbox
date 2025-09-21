'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BarChart3, 
  TrendingUp, 
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Zap
} from 'lucide-react';

interface AdminOverviewProps {
  userId: string;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalUsage: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    responseTime: number;
    errorRate: number;
  };
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  popularTools: Array<{
    name: string;
    usage: number;
    growth: number;
  }>;
}

export default function AdminOverview({ userId }: AdminOverviewProps) {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [userId]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const mockData: SystemStats = {
        totalUsers: 1247,
        activeUsers: 89,
        totalUsage: 15678,
        systemHealth: {
          status: 'healthy',
          uptime: '99.98%',
          responseTime: 245,
          errorRate: 0.02
        },
        recentActivity: [
          {
            id: '1',
            user: 'john.doe@example.com',
            action: 'Created new SWOT analysis',
            timestamp: '2024-01-15 14:30',
            severity: 'low'
          },
          {
            id: '2',
            user: 'jane.smith@example.com',
            action: 'Accessed Finance Advisor',
            timestamp: '2024-01-15 14:25',
            severity: 'low'
          },
          {
            id: '3',
            user: 'admin@system.com',
            action: 'System maintenance completed',
            timestamp: '2024-01-15 14:20',
            severity: 'medium'
          }
        ],
        popularTools: [
          { name: 'SWOT Analysis', usage: 456, growth: 12 },
          { name: 'Finance Advisor', usage: 389, growth: 8 },
          { name: 'Diet Planner', usage: 234, growth: -3 },
          { name: 'URL Shortener', usage: 198, growth: 15 },
          { name: 'QR Generator', usage: 167, growth: 5 }
        ]
      };

      setStats(mockData);
    } catch (err: any) {
      console.error('Admin data fetch error:', err);
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAdminData} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getHealthStatusColor(stats.systemHealth.status)}`}>
                {stats.systemHealth.status === 'healthy' ? (
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                ) : stats.systemHealth.status === 'warning' ? (
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                ) : (
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                )}
              </div>
              <div className="text-sm font-medium">Status</div>
              <div className="text-xs text-gray-500 capitalize">{stats.systemHealth.status}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.systemHealth.uptime}</div>
              <div className="text-sm font-medium">Uptime</div>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.systemHealth.responseTime}ms</div>
              <div className="text-sm font-medium">Response Time</div>
              <div className="text-xs text-gray-500">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.systemHealth.errorRate}%</div>
              <div className="text-sm font-medium">Error Rate</div>
              <div className="text-xs text-gray-500">Last 24h</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active in last 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsage.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Tool interactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground">
              From last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Popular Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(activity.severity)}>
                      {activity.severity}
                    </Badge>
                    <span className="text-xs text-gray-400">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Popular Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularTools.map((tool, index) => (
                <div key={tool.name} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-gray-500">{tool.usage} uses</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className={`w-4 h-4 ${tool.growth > 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-medium ${tool.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tool.growth > 0 ? '+' : ''}{tool.growth}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button variant="outline" className="w-full">
              <Database className="w-4 h-4 mr-2" />
              System Settings
            </Button>
            <Button variant="outline" className="w-full">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 