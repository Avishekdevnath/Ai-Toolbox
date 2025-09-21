'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SystemOverviewProps {
  // Add props as needed
}

export default function SystemOverview({}: SystemOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Badge variant="default" className="bg-green-500">Online</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Badge variant="default" className="bg-green-500">Connected</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MongoDB</div>
            <p className="text-xs text-muted-foreground">
              Atlas cluster active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
            <Badge variant="default" className="bg-green-500">Active</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Clerk</div>
            <p className="text-xs text-muted-foreground">
              OAuth providers ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Services</CardTitle>
            <Badge variant="default" className="bg-green-500">Available</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Gemini</div>
            <p className="text-xs text-muted-foreground">
              API quota: 85% used
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>
              Real-time system metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>CPU Usage</span>
                <span>45%</span>
              </div>
              <Progress value={45} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Memory Usage</span>
                <span>62%</span>
              </div>
              <Progress value={62} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Disk Usage</span>
                <span>28%</span>
              </div>
              <Progress value={28} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent System Events</CardTitle>
            <CardDescription>
              Latest system activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Database backup completed</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">API rate limit warning</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 