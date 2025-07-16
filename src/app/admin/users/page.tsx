import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, User, Shield } from 'lucide-react';

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-blue-600" />Users</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all registered users, roles, and permissions.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* TODO: Replace with real user data and actions */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="py-2 px-4 text-gray-700 dark:text-gray-300 font-semibold">Email</th>
                  <th className="py-2 px-4 text-gray-700 dark:text-gray-300 font-semibold">Role</th>
                  <th className="py-2 px-4 text-gray-700 dark:text-gray-300 font-semibold">Status</th>
                  <th className="py-2 px-4 text-gray-700 dark:text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4">alex@example.com</td>
                  <td className="py-2 px-4 flex items-center gap-2"><Shield className="w-4 h-4 text-green-500" />Admin</td>
                  <td className="py-2 px-4">Active</td>
                  <td className="py-2 px-4">{/* TODO: Actions */}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">jane@example.com</td>
                  <td className="py-2 px-4 flex items-center gap-2"><User className="w-4 h-4 text-blue-500" />User</td>
                  <td className="py-2 px-4">Suspended</td>
                  <td className="py-2 px-4">{/* TODO: Actions */}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 