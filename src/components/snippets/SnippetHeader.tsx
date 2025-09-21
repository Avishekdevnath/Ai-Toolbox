'use client';

import Link from 'next/link';
import React from 'react';

const SnippetHeader: React.FC = () => {
  return (
    <div className="border-b border-gray-800 bg-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="text-lg font-semibold">AI Toolbox x ShareCode</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/s/new" 
              className="text-gray-300 hover:text-white transition-colors font-normal text-sm"
            >
              Create
            </Link>
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white transition-colors font-normal text-sm"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnippetHeader;
