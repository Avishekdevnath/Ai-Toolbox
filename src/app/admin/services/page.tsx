'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { 
  Wrench, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Power,
  PowerOff,
  RefreshCw,
  Eye,
  Edit
} from 'lucide-react';

interface Tool {
  _id: string;
  slug: string;
  name: string;
  description: string;
  status: 'active' | 'maintenance' | 'disabled' | 'deprecated';
  usage: number;
  successRate: number;
  avgResponseTime: number;
  lastUpdated: string;
  config: {
    rateLimit?: number;
    maxRequests?: number;
    timeout?: number;
  };
}

export default function ServiceManagementPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchTools();
      fetchMaintenanceStatus();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchTools = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/services/tools');
      const data = await response.json();

      if (data.success) {
        setTools(data.tools);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/admin/services/maintenance/status');
      const data = await response.json();
      if (data.success) {
        setMaintenanceMode(data.maintenanceMode);
      }
    } catch (error) {
      console.error('Error fetching maintenance status:', error);
    }
  };

  const handleToolToggle = async (toolId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/services/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          status
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchTools();
      }
    } catch (error) {
      console.error('Error toggling tool:', error);
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      const response = await fetch('/api/admin/services/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: !maintenanceMode
        })
      });

      const data = await response.json();
      if (data.success) {
        setMaintenanceMode(!maintenanceMode);
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'disabled':
        return <PowerOff className="w-4 h-4 text-red-500" />;
      case 'deprecated':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Power className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'disabled':
        return 'bg-red-100 text-red-800';
      case 'deprecated':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading Service Management..." />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Control tool availability and system settings
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Maintenance Mode</span>
            <Switch
              checked={maintenanceMode}
              onCheckedChange={handleMaintenanceToggle}
            />
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tools.length}</div>
            <p className="text-xs text-muted-foreground">
              Available services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tools.filter(t => t.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {tools.filter(t => t.status === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Under maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <PowerOff className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tools.filter(t => t.status === 'disabled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Temporarily offline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tools List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wrench className="w-5 h-5" />
            <span>Tool Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="lg" text="Loading tools..." />
            </div>
          ) : tools.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tools found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tools.map((tool) => (
                <div key={tool._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(tool.status)}
                      <div>
                        <h4 className="font-medium">{tool.name}</h4>
                        <p className="text-sm text-gray-500">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{tool.usage}</p>
                      <p className="text-xs text-gray-500">uses today</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium">{(tool.successRate * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">success rate</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium">{tool.avgResponseTime}ms</p>
                      <p className="text-xs text-gray-500">avg response</p>
                    </div>
                    
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tool.status)}`}>
                      {tool.status}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTool(tool)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTool(tool)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <select
                        value={tool.status}
                        onChange={(e) => handleToolToggle(tool._id, e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="disabled">Disabled</option>
                        <option value="deprecated">Deprecated</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5" />
              <span>Performance Analytics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              View detailed performance metrics for all tools
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>System Configuration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Configure system-wide settings and defaults
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Error Monitoring</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor errors and system alerts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 