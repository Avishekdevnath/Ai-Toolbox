'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  FileText, 
  Image, 
  X, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import Certificate from './Certificate';
import { 
  downloadCertificateAsPDF, 
  downloadCertificateAsImage,
  CertificateData 
} from '@/lib/certificateUtils';
import Modal, { ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';

interface CertificateDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData: CertificateData;
}

export default function CertificateDownloadModal({
  isOpen,
  onClose,
  certificateData
}: CertificateDownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<'pdf' | 'image' | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async (type: 'pdf' | 'image') => {
    setIsDownloading(true);
    setDownloadType(type);
    setDownloadSuccess(false);

    try {
      if (type === 'pdf') {
        await downloadCertificateAsPDF(certificateData);
      } else {
        await downloadCertificateAsImage(certificateData);
      }
      setDownloadSuccess(true);
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download certificate. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader className="text-xl font-bold">Download Certificate</ModalHeader>
      <ModalContent>
        {/* Certificate Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Certificate Preview</h3>
          <div className="border rounded-lg overflow-hidden">
            <Certificate {...certificateData} />
          </div>
        </div>

        {/* Download Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Download Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PDF Download */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FileText className="h-6 w-6 text-blue-600 mr-2" />
                  <h4 className="font-semibold">PDF Format</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Download as a high-quality PDF document suitable for printing and sharing.
                </p>
                <Button
                  onClick={() => handleDownload('pdf')}
                  disabled={isDownloading}
                  className="w-full"
                  variant="outline"
                >
                  {isDownloading && downloadType === 'pdf' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : downloadSuccess && downloadType === 'pdf' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Downloaded Successfully
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>

              {/* Image Download */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Image className="h-6 w-6 text-green-600 mr-2" />
                  <h4 className="font-semibold">Image Format</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Download as a high-resolution PNG image for digital sharing and social media.
                </p>
                <Button
                  onClick={() => handleDownload('image')}
                  disabled={isDownloading}
                  className="w-full"
                  variant="outline"
                >
                  {isDownloading && downloadType === 'image' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Image...
                    </>
                  ) : downloadSuccess && downloadType === 'image' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Downloaded Successfully
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Certificate Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Certificate Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{certificateData.candidateName}</span>
                </div>
                <div>
                  <span className="text-gray-600">Position:</span>
                  <span className="ml-2 font-medium">{certificateData.position}</span>
                </div>
                <div>
                  <span className="text-gray-600">Score:</span>
                  <span className="ml-2 font-medium">
                    {certificateData.score}/{certificateData.maxScore} ({certificateData.percentage}%)
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Grade:</span>
                  <span className="ml-2 font-medium">{certificateData.grade}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">
                    {certificateData.date.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">ID:</span>
                  <span className="ml-2 font-medium">{certificateData.sessionId}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </ModalContent>
      <ModalFooter>
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
} 