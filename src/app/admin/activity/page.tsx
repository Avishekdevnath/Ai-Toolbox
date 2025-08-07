'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  Activity, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Clock,
  User,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface ActivityLog {
  _id: string;
  adminId?: string;
  adminEmail?: string;
  adminRole?: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  details?: any;
  status: 'success' | 'failed' | 'pending';
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  type: 'admin' | 'user' | 'system';
}

export default function ActivityLogsPage() {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAdminAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchActivities();
    }
  }, [isAuthenticated, isSuperAdmin, currentPage, searchTerm, filterType, filterStatus, dateRange]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        type: filterType,
        status: filterStatus,
        range: dateRange
      });

      const response = await fetch(`/api/admin/activity?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setActivities(data.activities);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === 'type') {
      setFilterType(value);
    } else if (filter === 'status') {
      setFilterStatus(value);
    } else if (filter === 'range') {
      setDateRange(value);
    }
    setCurrentPage(1);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'user':
        return <User className="w-4 h-4 text-green-500" />;
      case 'system':
        return <Activity className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Activity Logs..." />
      </div>
    );
  }

  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor admin actions, user activities, and system events
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="admin">Admin Actions</option>
                <option value="user">User Activities</option>
                <option value="system">System Events</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={dateRange}
                onChange={(e) => handleFilterChange('range', e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Activity Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" text="Loading activities..." />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No activities found</p>
              <p className="text-sm">Try adjusting your filters or date range</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-start space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getTypeIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.action} {activity.resource}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      {activity.adminEmail && (
                        <p>Admin: {activity.adminEmail} ({activity.adminRole})</p>
                      )}
                      {activity.userEmail && (
                        <p>User: {activity.userEmail}</p>
                      )}
                      {activity.ipAddress && (
                        <p>IP: {activity.ipAddress}</p>
                      )}
                      <p>Time: {formatTimestamp(activity.createdAt)}</p>
                      {activity.details && (
                        <p className="text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          Details: {JSON.stringify(activity.details)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusIcon(activity.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.length}
            </div>
            <p className="text-xs text-muted-foreground">
              In current view
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activities.length > 0 
                ? Math.round((activities.filter(a => a.status === 'success').length / activities.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Successful actions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activities.filter(a => {
                const activityTime = new Date(a.createdAt);
                const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
                return activityTime > oneHourAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Last hour
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 