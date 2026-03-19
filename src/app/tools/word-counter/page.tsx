'use client';

import WordCounterTool from '@/components/tools/WordCounterTool';
import ToolPageLayout from '@/components/tools/ToolPageLayout';

export default function WordCounterPage() {
  return (
    <ToolPageLayout toolId="word-counter" toolName="Word Counter">
      <WordCounterTool />
    </ToolPageLayout>
  );
}
