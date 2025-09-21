'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Camera, 
  CameraOff, 
  QrCode, 
  Copy, 
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface QRCodeScannerProps {
  onScan?: (result: string) => void;
  onError?: (error: string) => void;
}

export default function QRCodeScanner({ onScan, onError }: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      setError(null);
      setScannedResult(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsScanning(true);
      setHasPermission(true);
      
      // Start scanning loop
      scanQRCode();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setHasPermission(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const scanQRCode = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple QR code detection (this is a placeholder - in a real app you'd use a library like jsQR)
    // For now, we'll simulate detection
    setTimeout(() => {
      if (isScanning) {
        // In a real implementation, you would use a QR code detection library here
        // For demo purposes, we'll just continue scanning
        requestAnimationFrame(scanQRCode);
      }
    }, 100);
  };

  const handleCopyResult = async () => {
    if (scannedResult) {
      try {
        await navigator.clipboard.writeText(scannedResult);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const handleOpenResult = () => {
    if (scannedResult) {
      // Check if it's a URL
      if (scannedResult.startsWith('http://') || scannedResult.startsWith('https://')) {
        window.open(scannedResult, '_blank');
      } else {
        // For other types, you might want to handle them differently
        console.log('Scanned content:', scannedResult);
      }
    }
  };

  const resetScanner = () => {
    setScannedResult(null);
    setError(null);
    if (!isScanning) {
      startScanning();
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Scanner */}
      <Card className="p-6 bg-white dark:bg-gray-800">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            QR Code Scanner
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Point your camera at a QR code to scan it
          </p>
        </div>

        <div className="relative">
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            {!isScanning ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Camera Ready</p>
                  <p className="text-sm opacity-75">Click start to begin scanning</p>
                </div>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg m-4 pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                </div>
              </>
            )}
          </div>
          
          <canvas
            ref={canvasRef}
            className="hidden"
          />
        </div>

        <div className="flex justify-center mt-4">
          {!isScanning ? (
            <Button
              onClick={startScanning}
              disabled={hasPermission === false}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="outline"
            >
              <CameraOff className="w-4 h-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>

        {hasPermission === false && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Camera permission denied. Please enable camera access in your browser settings.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {error}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Scan Result */}
      {scannedResult && (
        <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                QR Code Scanned Successfully!
              </h3>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 break-all">
                  {scannedResult}
                </p>
              </div>
              <div className="flex space-x-2 mt-3">
                <Button
                  onClick={handleCopyResult}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                {(scannedResult.startsWith('http://') || scannedResult.startsWith('https://')) && (
                  <Button
                    onClick={handleOpenResult}
                    size="sm"
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Link
                  </Button>
                )}
                <Button
                  onClick={resetScanner}
                  size="sm"
                  variant="outline"
                >
                  Scan Another
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Instructions */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
          How to Use
        </h3>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <p>1. Click "Start Scanning" to activate your camera</p>
          <p>2. Point your camera at a QR code</p>
          <p>3. Hold steady until the code is detected</p>
          <p>4. View the scanned content and take action</p>
        </div>
      </Card>
    </div>
  );
}
