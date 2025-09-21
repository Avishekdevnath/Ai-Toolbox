'use client';
import React from 'react';
import ToolGridPage from './ToolGridPage';

const ToolGridPageClient: React.FC<{ title: string; description: string; tools: any[] }> = ({
  title,
  description,
  tools,
}) => {
  const userId = undefined;

  return (
    <ToolGridPage
      title={title}
      description={description}
      tools={tools}
      userId={userId}
      showSearch={true}
    />
  );
};

export default ToolGridPageClient; 