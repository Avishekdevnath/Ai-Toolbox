'use client';

import { useState } from 'react';
import QRInputForm from './qr/QRInputForm';
import QRCodeDisplay from './qr/QRCodeDisplay';
import { generateQRCodeDataUrl } from '@/utils/qrUtils';

export default function QRGeneratorTool() {
  const [inputText, setInputText] = useState('');
  const [size, setSize] = useState(200);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    const url = await generateQRCodeDataUrl(inputText, size);
    setQrCodeUrl(url);
    // After QR code is generated and displayed
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QRInputForm
          inputText={inputText}
          setInputText={setInputText}
          size={size}
          setSize={setSize}
          onGenerate={handleGenerate}
        />
        <QRCodeDisplay
          qrCodeUrl={qrCodeUrl}
          size={size}
          onDownload={handleDownload}
        />
      </div>
      {/* Information Section */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 Tips:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• QR codes can contain URLs, text, phone numbers, email addresses, and more</li>
          <li>• Larger sizes are better for printing or distant scanning</li>
          <li>• Keep text short for better readability</li>
          <li>• Test your QR code with different devices before using</li>
        </ul>
      </div>
    </div>
  );
} 