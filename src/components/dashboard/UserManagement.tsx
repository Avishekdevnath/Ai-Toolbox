'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
}

interface UserManagementProps {
  // Add props as needed
}

export default function UserManagement({}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for demonstration
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: 'user',
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: '2024-01-27'
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-10',
        lastLogin: '2024-01-26'
      },
      {
        id: '3',
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        role: 'user',
        status: 'inactive',
        createdAt: '2024-01-05',
        lastLogin: '2024-01-20'
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-blue-500">Admin</Badge>;
      case 'user':
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button>Add User</Button>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Created: {user.createdAt}</p>
                    <p className="text-xs text-gray-500">Last login: {user.lastLogin}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 