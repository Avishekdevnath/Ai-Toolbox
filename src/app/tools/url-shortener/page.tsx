'use client';

import URLShortenerTool from '@/components/tools/URLShortenerTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function URLShortenerPage() {
  return (
    <ToolPageLayout toolId="url-shortener" toolName="URL Shortener">
      <URLShortenerTool />
    </ToolPageLayout>
  );
}
