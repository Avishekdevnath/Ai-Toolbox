'use client';
import React from 'react';
import ToolGridPageClient from '@/components/ToolGridPageClient';
import { utilityTools } from '@/data/tools';

export default function UtilitiesPage() {
  return (
    <ToolGridPageClient
      title="Utilities"
      description="Essential utility tools for everyday tasks. From URL shortening to password generation, these tools make your digital life easier and more efficient."
      tools={utilityTools}
      showSearch={true}
      showRecommendations={true}
      showAnalytics={false}
    />
  );
} 