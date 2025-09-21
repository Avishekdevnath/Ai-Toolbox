'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  QrCode, 
  Download, 
  Share2, 
  Settings,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { generateQRCodeDataUrl } from '@/utils/qrUtils';
import Link from 'next/link';

export default function QRGeneratorTool() {
  const [inputText, setInputText] = useState('');
  const [size, setSize] = useState(200);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    const url = await generateQRCodeDataUrl(inputText, size);
    setQrCodeUrl(url);
    // Track usage
    fetch('/api/tools/qr-generator/track-usage', { method: 'POST' });
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: 'Check out this QR code',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(inputText);
        alert('Content copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          QR Code Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create QR codes for URLs, text, contact info, and more
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Create QR Code
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Text or URL to convert
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text, URL, or any data you want to encode..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                QR Code Size: {size}x{size}px
              </label>
              <input
                type="range"
                min="100"
                max="500"
                step="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>100px</span>
                <span>500px</span>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!inputText.trim()}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
          </div>

          {/* Advanced Features Link */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Advanced QR Generator
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create WiFi, vCard, location, and event QR codes
                </p>
              </div>
              <Link href="/dashboard/qr-generator">
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Advanced
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* QR Code Display */}
        <Card className="p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Generated QR Code
          </h2>
          
          <div className="flex flex-col items-center justify-center space-y-4">
            {qrCodeUrl ? (
              <>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                  <img
                    src={qrCodeUrl}
                    alt="Generated QR Code"
                    className="max-w-full h-auto"
                    style={{ width: size, height: size }}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleDownload}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </>
            ) : (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <div className="text-gray-400 dark:text-gray-500">
                  <QrCode className="w-16 h-16 mx-auto mb-4" />
                  <p>Your QR code will appear here</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

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