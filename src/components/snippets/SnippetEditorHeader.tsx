'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Copy, Share2, Eye, EyeOff, Users, Plus } from 'lucide-react';

interface SnippetEditorHeaderProps {
  isNew: boolean;
  shareUrl?: string;
  isConnected: boolean;
  activeUsers: string[];
  lastSaved?: Date;
  isSaving: boolean;
  showPreview: boolean;
  copied: boolean;
  onTogglePreview: () => void;
  onCopy: () => void;
  onShare: () => void;
  onSave: () => void;
  onCreateNew: () => void;
  ownerName?: string;
}

export default function SnippetEditorHeader({
  isNew,
  shareUrl,
  isConnected,
  activeUsers,
  lastSaved,
  isSaving,
  showPreview,
  copied,
  onTogglePreview,
  onCopy,
  onShare,
  onSave,
  onCreateNew,
  ownerName
}: SnippetEditorHeaderProps) {
  return (
    <div className="border-b border-gray-800 bg-gray-900 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h1 className="text-base font-medium truncate">
            {isNew ? 'New Code Snippet' : 'Edit Code Snippet'}
          </h1>
          {shareUrl && isConnected && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <Users className="w-3 h-3" />
              <span>{activeUsers.length + 1} online</span>
            </div>
          )}
          {lastSaved && (
            <span className="text-xs text-gray-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-yellow-400">Saving...</span>
          )}
          {isConnected && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          )}
          {ownerName && (
            <span className="text-xs text-blue-400 ml-2">Owner: {ownerName}</span>
          )}
          {shareUrl && (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-gray-400">URL:</span>
              <code className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400 truncate max-w-xs">
                {shareUrl}
              </code>
              <span className="text-xs text-gray-500 hidden lg:inline">(Anyone with this link can edit)</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
        </div>
        
        <div className="flex items-center gap-1 relative z-50 flex-wrap">
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateNew}
              className="border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black p-2 rounded-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Create new snippet
            </div>
          </div>
          
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePreview}
              className="border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black p-2 rounded-md cursor-pointer"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </div>
          </div>
          
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              onClick={onCopy}
              className="border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black p-2 rounded-md cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {copied ? 'Copied!' : 'Copy code'}
            </div>
          </div>
          
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              onClick={onShare}
              className="border-gray-300 bg-white text-black hover:bg-gray-100 hover:text-black disabled:opacity-50 p-2 rounded-md cursor-pointer disabled:cursor-not-allowed"
              disabled={!shareUrl}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {copied ? 'Link copied!' : 'Share snippet'}
            </div>
          </div>
          
          <div className="relative group">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
            </Button>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              {isSaving ? 'Saving...' : 'Save snippet'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
