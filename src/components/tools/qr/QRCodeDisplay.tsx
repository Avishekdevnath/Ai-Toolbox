import React from 'react';

type QRCodeDisplayProps = {
  qrCodeUrl: string;
  size: number;
  onDownload: () => void;
};

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeUrl, size, onDownload }) => (
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
        <button
          onClick={onDownload}
          className="bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Download QR Code
        </button>
      </>
    ) : (
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <div className="text-gray-400 dark:text-gray-500">
          <div className="text-4xl mb-2">📱</div>
          <p>Your QR code will appear here</p>
        </div>
      </div>
    )}
  </div>
);

export default QRCodeDisplay; 