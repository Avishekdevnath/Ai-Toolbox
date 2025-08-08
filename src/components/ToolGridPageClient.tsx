'use client';

import React from 'react';
import ToolGridPage from './ToolGridPage';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  href: string;
  features: string[];
  colorClass?: string;
}

interface ToolGridPageClientProps {
  title: string;
  description: string;
  tools: Tool[];
  showSearch?: boolean;
  // extra props accepted by pages but unused here
  showRecommendations?: boolean;
  showAnalytics?: boolean;
}

export default function ToolGridPageClient({
  title,
  description,
  tools,
  showSearch = true,
}: ToolGridPageClientProps) {
  // Use null for userId since we're not using authentication
  return (
    <ToolGridPage
      title={title}
      description={description}
      tools={tools}
      userId={null}
      showSearch={showSearch}
    />
  );
} 