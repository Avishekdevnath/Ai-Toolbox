'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  ArrowLeft, 
  Download, 
  Share2, 
  Copy,
  Globe,
  Mail,
  Phone,
  Smartphone,
  Wifi,
  MapPin,
  User,
  Calendar as CalendarIcon,
  Settings,
  Palette
} from 'lucide-react';
import { CreateQRCodeRequest, QRCodeType } from '@/schemas/qrCodeSchema';
import QRCodeLib from 'qrcode';

interface QrCodeGeneratorProps {
  onQrCodeCreated: () => void;
  onCancel: () => void;
}

const QR_TYPES = [
  { value: 'url', label: 'URL', icon: Globe, description: 'Website or web page' },
  { value: 'text', label: 'Text', icon: QrCode, description: 'Plain text message' },
  { value: 'email', label: 'Email', icon: Mail, description: 'Email address' },
  { value: 'phone', label: 'Phone', icon: Phone, description: 'Phone number' },
  { value: 'sms', label: 'SMS', icon: Smartphone, description: 'SMS message' },
  { value: 'wifi', label: 'WiFi', icon: Wifi, description: 'WiFi network credentials' },
  { value: 'vcard', label: 'vCard', icon: User, description: 'Contact information' },
  { value: 'location', label: 'Location', icon: MapPin, description: 'GPS coordinates' },
  { value: 'event', label: 'Event', icon: CalendarIcon, description: 'Calendar event' }
];

export default function QrCodeGenerator({ onQrCodeCreated, onCancel }: QrCodeGeneratorProps) {
  const [step, setStep] = useState(1);
  const [qrType, setQrType] = useState<QRCodeType>('url');
  const [formData, setFormData] = useState<Partial<CreateQRCodeRequest>>({
    type: 'url',
    size: 200,
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    errorCorrectionLevel: 'M',
    margin: 2,
    isPublic: false,
    tags: []
  });
  const [generatedQrCode, setGeneratedQrCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleTypeSelect = (type: QRCodeType) => {
    setQrType(type);
    setFormData(prev => ({ ...prev, type }));
    setStep(2);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Generate QR code content based on type
      let content = '';
      switch (qrType) {
        case 'url':
          content = formData.content?.startsWith('http') ? formData.content! : `https://${formData.content}`;
          break;
        case 'email':
          content = `mailto:${formData.content}`;
          break;
        case 'phone':
          content = `tel:${formData.content}`;
          break;
        case 'sms':
          content = `sms:${formData.content}`;
          break;
        case 'wifi':
          if (!formData.ssid) throw new Error('SSID is required for WiFi QR codes');
          const security = formData.security || 'nopass';
          const hidden = formData.hidden ? 'H:true' : 'H:false';
          content = `WIFI:T:${security};S:${formData.ssid};P:${formData.password || ''};${hidden};;`;
          break;
        case 'vcard':
          const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            formData.firstName && `FN:${formData.firstName} ${formData.lastName || ''}`,
            formData.firstName && `N:${formData.lastName || ''};${formData.firstName};;;`,
            formData.organization && `ORG:${formData.organization}`,
            formData.title && `TITLE:${formData.title}`,
            formData.phone && `TEL:${formData.phone}`,
            formData.email && `EMAIL:${formData.email}`,
            formData.website && `URL:${formData.website}`,
            formData.address && `ADR:;;${formData.address};;;;`,
            'END:VCARD'
          ].filter(Boolean).join('\n');
          content = vcard;
          break;
        case 'location':
          if (!formData.latitude || !formData.longitude) {
            throw new Error('Latitude and longitude are required for location QR codes');
          }
          content = `geo:${formData.latitude},${formData.longitude}`;
          break;
        case 'event':
          if (!formData.eventTitle || !formData.startDate) {
            throw new Error('Event title and start date are required for event QR codes');
          }
          const startDate = new Date(formData.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const endDate = formData.endDate ? new Date(formData.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z' : startDate;
          content = `BEGIN:VEVENT\nSUMMARY:${formData.eventTitle}\nDTSTART:${startDate}\nDTEND:${endDate}\n${formData.location ? `LOCATION:${formData.location}` : ''}\n${formData.description ? `DESCRIPTION:${formData.description}` : ''}\nEND:VEVENT`;
          break;
        default:
          content = formData.content || '';
      }

      // Generate QR code data URL
      const qrCodeDataUrl = await QRCodeLib.toDataURL(content, {
        width: formData.size || 200,
        margin: formData.margin || 2,
        color: {
          dark: formData.foregroundColor || '#000000',
          light: formData.backgroundColor || '#FFFFFF'
        },
        errorCorrectionLevel: formData.errorCorrectionLevel || 'M'
      });

      setGeneratedQrCode(qrCodeDataUrl);
      setFormData(prev => ({ ...prev, content }));
      setStep(3);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please check your input.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onQrCodeCreated();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save QR code');
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Error saving QR code. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!generatedQrCode) return;
    
    const link = document.createElement('a');
    link.href = generatedQrCode;
    link.download = `${formData.title || 'qrcode'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: formData.title || 'QR Code',
          text: formData.description || 'Check out this QR code',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(formData.content || '');
        alert('Content copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const renderTypeForm = () => {
    switch (qrType) {
      case 'url':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text Content
              </label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter your text here..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="example@email.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.content || ''}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="+1234567890"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Pre-filled message..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Network Name (SSID) *
              </label>
              <input
                type="text"
                value={formData.ssid || ''}
                onChange={(e) => handleInputChange('ssid', e.target.value)}
                placeholder="MyWiFiNetwork"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="WiFi password"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Security Type
                </label>
                <select
                  value={formData.security || 'WPA2'}
                  onChange={(e) => handleInputChange('security', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="nopass">No Password</option>
                  <option value="WEP">WEP</option>
                  <option value="WPA">WPA</option>
                  <option value="WPA2">WPA2</option>
                  <option value="WPA3">WPA3</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hidden"
                  checked={formData.hidden || false}
                  onChange={(e) => handleInputChange('hidden', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="hidden" className="text-sm text-gray-700 dark:text-gray-300">
                  Hidden Network
                </label>
              </div>
            </div>
          </div>
        );

      case 'vcard':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName || ''}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="John"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName || ''}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organization
              </label>
              <input
                type="text"
                value={formData.organization || ''}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder="Company Name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude || ''}
                  onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value))}
                  placeholder="40.7128"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude || ''}
                  onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value))}
                  placeholder="-74.0060"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'event':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.eventTitle || ''}
                onChange={(e) => handleInputChange('eventTitle', e.target.value)}
                placeholder="My Event"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Event location"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create QR Code
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Step {step} of 3: {step === 1 ? 'Choose Type' : step === 2 ? 'Enter Details' : 'Customize & Generate'}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Choose Type */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              What type of QR code would you like to create?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {QR_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.value}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                    onClick={() => handleTypeSelect(type.value as QRCodeType)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Enter Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              {React.createElement(QR_TYPES.find(t => t.value === qrType)?.icon || QrCode, { 
                className: "w-6 h-6 text-blue-600 dark:text-blue-400" 
              })}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {QR_TYPES.find(t => t.value === qrType)?.label} Details
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {QR_TYPES.find(t => t.value === qrType)?.description}
              </p>
            </div>
          </div>

          <Card className="p-6 bg-white dark:bg-gray-800">
            {renderTypeForm()}
          </Card>

          <div className="flex justify-between">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
            >
              Back
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!formData.content && !formData.ssid && !formData.eventTitle}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Customize & Generate */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Preview */}
            <Card className="p-6 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                QR Code Preview
              </h3>
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600">
                  <img
                    src={generatedQrCode}
                    alt="Generated QR Code"
                    className="w-48 h-48"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share QR Code
                </Button>
              </div>
            </Card>

            {/* Customization Options */}
            <Card className="p-6 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Customize & Save
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="My QR Code"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Optional description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Size (px)
                    </label>
                    <input
                      type="number"
                      min="100"
                      max="1000"
                      step="50"
                      value={formData.size || 200}
                      onChange={(e) => handleInputChange('size', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Error Correction
                    </label>
                    <select
                      value={formData.errorCorrectionLevel || 'M'}
                      onChange={(e) => handleInputChange('errorCorrectionLevel', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="L">Low (7%)</option>
                      <option value="M">Medium (15%)</option>
                      <option value="Q">Quartile (25%)</option>
                      <option value="H">High (30%)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foreground Color
                    </label>
                    <input
                      type="color"
                      value={formData.foregroundColor || '#000000'}
                      onChange={(e) => handleInputChange('foregroundColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor || '#FFFFFF'}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic || false}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
                    Make this QR code public
                  </label>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  {isSaving ? 'Saving...' : 'Save QR Code'}
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Edit
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
