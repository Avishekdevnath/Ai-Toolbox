'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  Database, 
  Zap, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Activity,
  Users,
  Shield
} from 'lucide-react';

interface DashboardStats {
  // Database Health
  dbConnection: boolean;
  dbResponseTime: number;
  totalCollections: number;
  
  // API Performance
  apiResponseTime: number;
  apiSuccessRate: number;
  activeEndpoints: number;
  
  // Project Quality
  totalUsers: number;
  totalAdmins: number;
  systemUptime: number;
  lastBackup: string;
  
  // Growth Metrics
  newUsersToday: number;
  totalAnalyses: number;
  activeUsers: number;
}

export default function SuperAdminDashboard() {
  const { isAuthenticated, admin, isLoading } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const getStatusColor = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? 'text-green-600' : 'text-red-600';
    }
    switch (status) {
      case 'healthy':
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: boolean | string) => {
    if (typeof status === 'boolean') {
      return status ? <CheckCircle className="h-4 w-4 text-green-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    switch (status) {
      case 'healthy':
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">System overview and performance metrics</p>
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

      {/* Database Health Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Database Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
              {getStatusIcon(stats?.dbConnection || false)}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(stats?.dbConnection || false)}`}>
                {stats?.dbConnection ? 'Connected' : 'Disconnected'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                MongoDB connection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.dbResponseTime || 0}ms
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Average query time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
              <Database className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalCollections || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Active collections
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Performance Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          API Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.apiResponseTime || 0}ms
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Average API response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.apiSuccessRate || 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                API success rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeEndpoints || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available APIs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Quality Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Project Quality
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalUsers || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Shield className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalAdmins || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                System administrators
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.systemUptime || 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                System availability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Database className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {stats?.lastBackup || 'Never'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Database backup
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Growth Metrics Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Growth Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{stats?.newUsersToday || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Today's registrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <Activity className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalAnalyses || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tool usage count
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.activeUsers || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently online
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 