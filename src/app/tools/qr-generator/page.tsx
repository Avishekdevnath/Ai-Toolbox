'use client';

import QRGeneratorTool from '@/components/tools/QRGeneratorTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function QRGeneratorPage() {
  return (
    <ToolPageLayout toolId="qr-generator" toolName="QR Generator">
      <QRGeneratorTool />
    </ToolPageLayout>
  );
}
