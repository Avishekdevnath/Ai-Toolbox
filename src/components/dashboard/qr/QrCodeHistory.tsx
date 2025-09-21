'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Share2, 
  Eye,
  Edit,
  Trash2,
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
  Calendar as CalendarIcon,
  Copy,
  ExternalLink
} from 'lucide-react';
import { QRCode as QRCodeType } from '@/schemas/qrCodeSchema';
import { formatDistanceToNow } from 'date-fns';

interface QrCodeHistoryProps {
  userId: string;
  onBack: () => void;
}

export default function QrCodeHistory({ userId, onBack }: QrCodeHistoryProps) {
  const [qrCodes, setQrCodes] = useState<QRCodeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const ITEMS_PER_PAGE = 12;

  const fetchQrCodes = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: ITEMS_PER_PAGE.toString(),
        offset: ((page - 1) * ITEMS_PER_PAGE).toString(),
        sortBy,
        sortOrder,
        ...(searchQuery && { query: searchQuery }),
        ...(filterType !== 'all' && { type: filterType }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await fetch(`/api/qr-codes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setQrCodes(data.data || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(Math.ceil((data.pagination?.total || 0) / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrCodes(currentPage);
  }, [currentPage, sortBy, sortOrder, searchQuery, filterType, filterStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchQrCodes(1);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        const response = await fetch(`/api/qr-codes/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setQrCodes(prev => prev.filter(qr => qr._id !== id));
          setTotalCount(prev => prev - 1);
        } else {
          console.error('Failed to delete QR code');
        }
      } catch (error) {
        console.error('Error deleting QR code:', error);
      }
    }
  };

  const handleDownload = async (qrCode: QRCodeType) => {
    try {
      // Track download
      await fetch(`/api/qr-codes/${qrCode._id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download', format: 'png' })
      });

      // Download the QR code
      const link = document.createElement('a');
      link.href = qrCode.qrCodeDataUrl;
      link.download = `${qrCode.title || 'qrcode'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleShare = async (qrCode: QRCodeType) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: qrCode.title || 'QR Code',
          text: qrCode.description || 'Check out this QR code',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(qrCode.content);
        alert('Content copied to clipboard!');
      }

      // Track share
      await fetch(`/api/qr-codes/${qrCode._id}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share', platform: 'web' })
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'inactive': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'expired': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading QR code history..." />
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
              QR Code History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {totalCount} QR codes found
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 bg-white dark:bg-gray-800">
        <form onSubmit={handleSearch} className="space-y-4">
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="createdAt">Created Date</option>
                <option value="updatedAt">Updated Date</option>
                <option value="title">Title</option>
                <option value="scans">Scans</option>
                <option value="downloads">Downloads</option>
                <option value="shares">Shares</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </form>
      </Card>

      {/* QR Codes Grid */}
      {qrCodes.length === 0 ? (
        <Card className="p-8 text-center bg-white dark:bg-gray-800">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No QR codes found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first QR code to get started'
            }
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {qrCodes.map((qrCode) => {
              const isExpired = qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date();
              
              return (
                <Card key={qrCode._id} className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${getTypeColor(qrCode.type)}`}>
                        {getTypeIcon(qrCode.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {qrCode.title || 'Untitled QR Code'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {qrCode.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(qrCode.status)}`}>
                        {qrCode.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(qrCode._id!)}
                        className="p-1 h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* QR Code Preview */}
                  <div className="flex justify-center mb-3">
                    <div className="p-2 bg-white rounded border border-gray-200 dark:border-gray-600">
                      <img
                        src={qrCode.qrCodeDataUrl}
                        alt="QR Code"
                        className="w-16 h-16"
                      />
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                      {qrCode.content.length > 30 
                        ? `${qrCode.content.substring(0, 30)}...` 
                        : qrCode.content
                      }
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        {qrCode.analytics.totalScans}
                      </span>
                      <span className="flex items-center">
                        <Download className="w-3 h-3 mr-1" />
                        {qrCode.analytics.totalDownloads}
                      </span>
                      <span className="flex items-center">
                        <Share2 className="w-3 h-3 mr-1" />
                        {qrCode.analytics.totalShares}
                      </span>
                    </div>
                    {isExpired && (
                      <span className="text-red-500 font-medium">Expired</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-1">
                    <Button
                      onClick={() => handleDownload(qrCode)}
                      size="sm"
                      className="flex-1 bg-black text-white hover:bg-gray-800 text-xs"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleShare(qrCode)}
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                    >
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
