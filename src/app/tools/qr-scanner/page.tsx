'use client';

import QRCodeScanner from '@/components/tools/qr/QRCodeScanner';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function QRScannerPage() {
  return (
    <ToolPageLayout toolId="qr-scanner" toolName="QR Scanner">
      <QRCodeScanner />
    </ToolPageLayout>
  );
}
