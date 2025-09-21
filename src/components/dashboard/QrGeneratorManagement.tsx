'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  QrCode, 
  Plus, 
  BarChart3, 
  History, 
  Download, 
  Share2, 
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  Tag,
  Globe,
  Smartphone,
  Mail,
  Phone,
  Wifi,
  MapPin,
  User,
  Calendar as CalendarIcon
} from 'lucide-react';
import { QRCode as QRCodeType, QRCodeStats } from '@/schemas/qrCodeSchema';
import QrCodeGenerator from './qr/QrCodeGenerator';
import QrCodeHistory from './qr/QrCodeHistory';
import QrCodeAnalytics from './qr/QrCodeAnalytics';
import QrCodeCard from './qr/QrCodeCard';

interface QrGeneratorManagementProps {
  userId: string;
}

type ViewMode = 'overview' | 'create' | 'history' | 'analytics';

export default function QrGeneratorManagement({ userId }: QrGeneratorManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [qrCodes, setQrCodes] = useState<QRCodeType[]>([]);
  const [stats, setStats] = useState<QRCodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch QR codes and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [qrCodesRes, statsRes] = await Promise.all([
        fetch('/api/qr-codes'),
        fetch('/api/qr-codes/stats')
      ]);

      if (qrCodesRes.ok) {
        const qrCodesData = await qrCodesRes.json();
        setQrCodes(qrCodesData.data || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQrCodeCreated = () => {
    fetchData();
    setViewMode('overview');
  };

  const handleQrCodeDeleted = () => {
    fetchData();
  };

  const handleQrCodeUpdated = () => {
    fetchData();
  };

  const filteredQrCodes = qrCodes.filter(qr => {
    const matchesSearch = !searchQuery || 
      qr.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      qr.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || qr.type === filterType;
    const matchesStatus = filterStatus === 'all' || qr.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

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
      default: return <QrCode className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'url': return 'text-blue-600 bg-blue-100';
      case 'email': return 'text-green-600 bg-green-100';
      case 'phone': return 'text-purple-600 bg-purple-100';
      case 'sms': return 'text-orange-600 bg-orange-100';
      case 'wifi': return 'text-indigo-600 bg-indigo-100';
      case 'location': return 'text-red-600 bg-red-100';
      case 'vcard': return 'text-pink-600 bg-pink-100';
      case 'event': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading QR generator management..." />
      </div>
    );
  }

  if (viewMode === 'create') {
    return (
      <QrCodeGenerator 
        onQrCodeCreated={handleQrCodeCreated}
        onCancel={() => setViewMode('overview')}
      />
    );
  }

  if (viewMode === 'history') {
    return (
      <QrCodeHistory 
        userId={userId}
        onBack={() => setViewMode('overview')}
      />
    );
  }

  if (viewMode === 'analytics') {
    return (
      <QrCodeAnalytics 
        userId={userId}
        onBack={() => setViewMode('overview')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            QR Generator Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create, manage, and track your QR codes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode('create')}
            className="bg-black text-white hover:bg-gray-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create QR Code
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total QR Codes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalQRCodes}</p>
              </div>
              <QrCode className="w-8 h-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Scans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalScans}</p>
              </div>
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</p>
              </div>
              <Download className="w-8 h-8 text-gray-400" />
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Shares</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalShares}</p>
              </div>
              <Share2 className="w-8 h-8 text-gray-400" />
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => setViewMode('create')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Create QR Code</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Generate a new QR code</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => setViewMode('history')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <History className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">QR History</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View your QR code history</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              onClick={() => setViewMode('analytics')}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View QR code analytics</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-white dark:bg-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search QR codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="url">URL</option>
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="sms">SMS</option>
              <option value="wifi">WiFi</option>
              <option value="vcard">vCard</option>
              <option value="location">Location</option>
              <option value="event">Event</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </Card>

      {/* QR Codes Grid */}
      {filteredQrCodes.length === 0 ? (
        <Card className="p-8 text-center bg-white dark:bg-gray-800">
          <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {qrCodes.length === 0 ? 'No QR codes yet' : 'No QR codes match your filters'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {qrCodes.length === 0 
              ? 'Create your first QR code to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {qrCodes.length === 0 && (
            <Button
              onClick={() => setViewMode('create')}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create QR Code
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQrCodes.map((qrCode) => (
            <QrCodeCard
              key={qrCode._id}
              qrCode={qrCode}
              onUpdate={handleQrCodeUpdated}
              onDelete={handleQrCodeDeleted}
            />
          ))}
        </div>
      )}

      {/* QR Code Tips */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          QR Code Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">High Contrast</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Use high contrast colors for better scanning reliability.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Appropriate Size</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Make QR codes large enough to be easily scanned by mobile devices.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Test Before Use</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Always test your QR codes before printing or sharing them.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 dark:text-blue-200">Clear Purpose</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Ensure the QR code leads to relevant and useful content.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}