'use client';

import React from 'react';
import ToolGridPage from './ToolGridPage';

export default function ToolGridPageClient() {
  // Use null for userId since we're not using authentication
  return <ToolGridPage userId={null} />;
} 