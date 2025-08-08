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
  Loader2,
  MessageSquare,
  Phone,
  MapPin,
  MessageCircle,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react';
import Link from 'next/link';
import { DashboardStats } from '@/schemas/dashboardSchema';

interface ContactStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  urgent: number;
  high: number;
}

interface RecentContact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [contactStats, setContactStats] = useState<ContactStats | null>(null);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
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

  const fetchContactStats = async () => {
    try {
      const response = await fetch('/api/contact/stats');
      const result = await response.json();
      
      if (response.ok) {
        setContactStats(result.overall);
      }
    } catch (error) {
      console.error('Error fetching contact stats:', error);
    }
  };

  const fetchRecentContacts = async () => {
    try {
      const response = await fetch('/api/contact?limit=5');
      const result = await response.json();
      
      if (response.ok) {
        setRecentContacts(result.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchDashboardStats(),
        fetchContactStats(),
        fetchRecentContacts()
      ]);
      setLoading(false);
    };
    
    fetchAllData();
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchContactStats(),
      fetchRecentContacts()
    ]);
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
      case 'degraded':
      case 'slow':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getContactStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getContactPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <Button onClick={refreshData} disabled={refreshing}>
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Try Again
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
        <p className="text-gray-600 dark:text-gray-400">Dashboard data is not available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Overview</h2>
          <p className="text-gray-600 dark:text-gray-400">Real-time system metrics and performance</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing} variant="outline">
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold">{stats.systemOverview.totalUsers}</p>
                <p className="text-xs text-gray-400">Registered users</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold">{stats.systemOverview.activeUsers}</p>
                <p className="text-xs text-gray-400">Last 30 days</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Tools</p>
                <p className="text-2xl font-bold">{stats.systemOverview.totalTools}</p>
                <p className="text-xs text-gray-400">Available tools</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Usage</p>
                <p className="text-2xl font-bold">{stats.systemOverview.totalUsage.toLocaleString()}</p>
                <p className="text-xs text-gray-400">All-time tool interactions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Overview */}
      {contactStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Contact Management
              </span>
              <Link href="/admin/contacts">
                <Button variant="outline" size="sm">
                  View All Contacts
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Contacts</p>
                  <p className="text-2xl font-bold">{contactStats.total}</p>
                  <p className="text-xs text-gray-400">All submissions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{contactStats.pending}</p>
                  <p className="text-xs text-gray-400">Awaiting response</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgent</p>
                  <p className="text-2xl font-bold">{contactStats.urgent}</p>
                  <p className="text-xs text-gray-400">High priority</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Resolved</p>
                  <p className="text-2xl font-bold">{contactStats.resolved}</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
            </div>

            {/* Recent Contacts */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Contacts</h4>
              <div className="space-y-2">
                {recentContacts.length > 0 ? (
                  recentContacts.map((contact) => (
                    <div key={contact._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{contact.name}</p>
                          <Badge className={getContactStatusColor(contact.status)}>
                            {contact.status}
                          </Badge>
                          <Badge className={getContactPriorityColor(contact.priority)}>
                            {contact.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{contact.subject}</p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(contact.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent contacts</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Settings Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Contact Information
            </span>
            <Link href="/admin/contact-settings">
              <Button variant="outline" size="sm">
                Edit Settings
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email Support</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">contact@aitoolbox.com</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Phone Support</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+1 (555) 123-4567</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                  <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Office Location</p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">GitHub</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">github.com/aitoolbox</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Linkedin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">LinkedIn</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">linkedin.com/company/aitoolbox</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Twitter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">X (Twitter)</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">@aitoolbox</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Website</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">aitoolbox.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Response Time</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">We typically respond within 2 hours during business hours</p>
              </div>
              <Link href="/admin/contact-settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="h-5 w-5 mr-2" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">API Status</span>
              </div>
              <Badge 
                variant={stats.systemHealth.apiStatus === 'Online' ? 'default' : 'destructive'}
                className={getStatusColor(stats.systemHealth.apiStatus)}
              >
                {stats.systemHealth.apiStatus}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge 
                variant={stats.systemHealth.database === 'Connected' ? 'default' : 'destructive'}
                className={getStatusColor(stats.systemHealth.database)}
              >
                {stats.systemHealth.database}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Uptime</span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {stats.systemHealth.uptime}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Response Time</span>
              </div>
              <span className="text-sm font-bold text-blue-600">
                {stats.systemHealth.responseTime}ms
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Error Rate</span>
              </div>
              <span className="text-sm font-bold text-red-600">
                {stats.systemHealth.errorRate}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Last Downtime</span>
              </div>
              <span className="text-xs text-gray-500">
                {stats.systemHealth.lastDowntime}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </span>
            <Link href="/admin/activity">
              <Button variant="outline" size="sm">
                View All Activity
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.userEmail}</p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Users</span>
              </Button>
            </Link>
            
            <Link href="/admin/contacts">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <MessageSquare className="h-6 w-6 mb-2" />
                <span>Manage Contacts</span>
              </Button>
            </Link>
            
            <Link href="/admin/tools">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <Settings className="h-6 w-6 mb-2" />
                <span>Manage Tools</span>
              </Button>
            </Link>
            
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center">
                <BarChart2 className="h-6 w-6 mb-2" />
                <span>View Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 