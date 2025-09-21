'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  Eye, 
  Download, 
  Share2, 
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

interface QrCodeCardProps {
  qrCode: QRCodeType;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function QrCodeCard({ qrCode, onUpdate, onDelete }: QrCodeCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
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
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: qrCode.title || 'QR Code',
          text: qrCode.description || 'Check out this QR code',
          url: window.location.href
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(qrCode.content);
        // You could add a toast notification here
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

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(qrCode.content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying content:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        const response = await fetch(`/api/qr-codes/${qrCode._id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          onDelete();
        } else {
          console.error('Failed to delete QR code');
        }
      } catch (error) {
        console.error('Error deleting QR code:', error);
      }
    }
  };

  const isExpired = qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date();

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${getTypeColor(qrCode.type)}`}>
            {getTypeIcon(qrCode.type)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {qrCode.title || 'Untitled QR Code'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
              {qrCode.type} • {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(qrCode.status)}`}>
            {qrCode.status}
          </span>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 h-8 w-8"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-600">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // Handle edit
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleCopyContent();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Content
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Preview */}
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
          <img
            src={qrCode.qrCodeDataUrl}
            alt="QR Code"
            className="w-24 h-24"
          />
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 break-all">
          {qrCode.content.length > 50 
            ? `${qrCode.content.substring(0, 50)}...` 
            : qrCode.content
          }
        </p>
        {qrCode.description && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {qrCode.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {qrCode.tags && qrCode.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {qrCode.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          ))}
          {qrCode.tags.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{qrCode.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Analytics */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
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
      <div className="flex space-x-2">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          size="sm"
          className="flex-1 bg-black text-white hover:bg-gray-800"
        >
          <Download className="w-4 h-4 mr-1" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
        <Button
          onClick={handleShare}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </div>
    </Card>
  );
}
