'use client';
import React from 'react';
import ToolGridPageClient from '@/components/ToolGridPageClient';
import { aiTools } from '@/data/tools';

export default function AIToolsPage() {
  return (
    <ToolGridPageClient
      title="AI Tools"
      description="Discover powerful AI-powered tools for productivity, creativity, and problem-solving. From business analysis to health planning, our AI tools help you work smarter."
      tools={aiTools}
      showSearch={true}
      showRecommendations={true}
      showAnalytics={false}
    />
  );
} 