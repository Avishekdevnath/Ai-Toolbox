'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Download, 
  Share2,
  Globe,
  Smartphone,
  Mail,
  Phone,
  Wifi,
  MapPin,
  User,
  Calendar as CalendarIcon,
  PieChart,
  Activity
} from 'lucide-react';
import { QRCodeStats } from '@/schemas/qrCodeSchema';

interface QrCodeAnalyticsProps {
  userId: string;
  onBack: () => void;
}

export default function QrCodeAnalytics({ userId, onBack }: QrCodeAnalyticsProps) {
  const [stats, setStats] = useState<QRCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/qr-codes/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'url': return <Globe className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'location': return <MapPin className="w-4 h-4" />;
      case 'vcard': return <User className="w-4 h-4" />;
      case 'event': return <CalendarIcon className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'url': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400';
      case 'email': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'phone': return 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-400';
      case 'sms': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-400';
      case 'wifi': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-400';
      case 'location': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      case 'vcard': return 'text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-400';
      case 'event': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No analytics data available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create some QR codes to see analytics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              QR Code Analytics
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Insights and performance metrics for your QR codes
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total QR Codes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalQRCodes}</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {stats.activeQRCodes} active
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Scans</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalScans}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.averageScansPerCode.toFixed(1)} avg per code
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Downloads</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.totalQRCodes > 0 ? (stats.totalDownloads / stats.totalQRCodes).toFixed(1) : 0} avg per code
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shares</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalShares}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats.totalQRCodes > 0 ? (stats.totalShares / stats.totalQRCodes).toFixed(1) : 0} avg per code
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Share2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing QR Codes */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Performing QR Codes
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.topPerformingQRCodes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No QR codes with activity yet
              </p>
            ) : (
              stats.topPerformingQRCodes.map((qr, index) => (
                <div key={qr.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {qr.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {qr.content.length > 30 ? `${qr.content.substring(0, 30)}...` : qr.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {qr.scans}
                    </span>
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {qr.downloads}
                    </span>
                    <span className="flex items-center">
                      <Share2 className="w-3 h-3 mr-1" />
                      {qr.shares}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* QR Code Type Distribution */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              QR Code Types
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {Object.entries(stats.typeDistribution).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No QR codes created yet
              </p>
            ) : (
              Object.entries(stats.typeDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(type)}`}>
                        {getTypeIcon(type)}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / stats.totalQRCodes) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card className="p-6 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {stats.recentActivity.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No recent activity
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {activity.scans} scans
                    </span>
                    <span className="flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      {activity.downloads} downloads
                    </span>
                    <span className="flex items-center">
                      <Share2 className="w-3 h-3 mr-1" />
                      {activity.shares} shares
                    </span>
                    <span className="text-gray-400">
                      {activity.newQRCodes} new codes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Scan Trends Chart */}
      {stats.scanTrends.length > 0 && (
        <Card className="p-6 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Scan Trends (Last 30 Days)
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-end space-x-1 h-32">
              {stats.scanTrends.slice(-14).map((trend, index) => {
                const maxScans = Math.max(...stats.scanTrends.map(t => t.scans));
                const height = maxScans > 0 ? (trend.scans / maxScans) * 100 : 0;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-600 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(trend.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>14 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
