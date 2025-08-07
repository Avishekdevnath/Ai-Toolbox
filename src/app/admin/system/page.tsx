'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Database, 
  Cpu, 
  HardDrive, 
  Network,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock
} from 'lucide-react';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  uptimePercentage: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  databaseStatus: 'connected' | 'disconnected' | 'error';
  apiResponseTime: number;
  activeConnections: number;
  errorRate: number;
  lastIncident: string;
}

export default function AdminSystemPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptime: '15 days, 8 hours, 32 minutes',
    uptimePercentage: 99.98,
    cpuUsage: 23,
    memoryUsage: 67,
    diskUsage: 45,
    networkLatency: 45,
    databaseStatus: 'connected',
    apiResponseTime: 120,
    activeConnections: 156,
    errorRate: 0.2,
    lastIncident: '2024-07-01 10:15'
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh system data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Server className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          System Health
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitor system performance, health, and infrastructure status.
        </p>
      </div>

      <div className="space-y-6">
        {/* System Status Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>System Status</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshData}
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                {getStatusIcon(systemHealth.status)}
                <div>
                  <p className="font-semibold">Overall Status</p>
                  <p className={`text-sm ${getStatusColor(systemHealth.status)}`}>
                    {systemHealth.status.charAt(0).toUpperCase() + systemHealth.status.slice(1)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Clock className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-semibold">Uptime</p>
                  <p className="text-sm text-gray-600">{systemHealth.uptime}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-semibold">Uptime %</p>
                  <p className="text-sm text-gray-600">{systemHealth.uptimePercentage}%</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Network className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-semibold">Active Connections</p>
                  <p className="text-sm text-gray-600">{systemHealth.activeConnections}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Resource Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">CPU Usage</span>
                  <span className="text-sm text-gray-600">{systemHealth.cpuUsage}%</span>
                </div>
                <Progress value={systemHealth.cpuUsage} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-gray-600">{systemHealth.memoryUsage}%</span>
                </div>
                <Progress value={systemHealth.memoryUsage} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Disk Usage</span>
                  <span className="text-sm text-gray-600">{systemHealth.diskUsage}%</span>
                </div>
                <Progress value={systemHealth.diskUsage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Response Time</span>
                <Badge variant={systemHealth.apiResponseTime < 200 ? 'default' : 'destructive'}>
                  {systemHealth.apiResponseTime}ms
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Network Latency</span>
                <Badge variant={systemHealth.networkLatency < 100 ? 'default' : 'destructive'}>
                  {systemHealth.networkLatency}ms
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <Badge variant={systemHealth.errorRate < 1 ? 'default' : 'destructive'}>
                  {systemHealth.errorRate}%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Status</span>
                <Badge variant={systemHealth.databaseStatus === 'connected' ? 'default' : 'destructive'}>
                  {systemHealth.databaseStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-medium">Minor API latency spike</p>
                  <p className="text-sm text-gray-600">
                    {systemHealth.lastIncident} - Response times increased to 500ms for 15 minutes
                  </p>
                </div>
                <Badge variant="outline">Resolved</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">System maintenance completed</p>
                  <p className="text-sm text-gray-600">
                    2024-06-28 02:00 - Database optimization and security updates applied
                  </p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 