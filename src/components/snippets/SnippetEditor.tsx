'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LanguageSelect from './LanguageSelect';
import CodeBlock from './CodeBlock';
import SnippetEditorHeader from './SnippetEditorHeader';
import { useRouter } from 'next/navigation';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import dynamic from 'next/dynamic';

export interface SnippetEditorProps {
  initialData?: {
    slug: string;
    title?: string;
    language: string;
    content: string;
    isPublic: boolean;
  };
  isNew?: boolean;
}

function SnippetEditorComponent({ initialData, isNew = false }: SnippetEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || '');
  const [language, setLanguage] = useState(initialData?.language || 'javascript');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCursorPosition = useRef<number>(0);

  // Set share URL on mount
  useEffect(() => {
    if (initialData?.slug) {
      setShareUrl(`${window.location.origin}/s/${initialData.slug}`);
    }
  }, [initialData?.slug]);

  // Real-time collaboration callbacks
  const handleRemoteContentChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  const handleRemoteTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleRemoteLanguageChange = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
  }, []);

  const handleRemoteVisibilityChange = useCallback((newIsPublic: boolean) => {
    setIsPublic(newIsPublic);
  }, []);

  const handleRemoteCursorChange = useCallback((position: number) => {
    // Visual indicator for other users' cursors could be added here
    console.log('Remote cursor position:', position);
  }, []);

  // Initialize real-time collaboration
  const {
    isConnected,
    activeUsers: collaborationUsers,
    emitContentChange,
    emitTitleChange,
    emitLanguageChange,
    emitVisibilityChange,
    emitCursorPosition,
  } = useRealtimeCollaboration({
    snippetId: initialData?.slug || '',
    onContentChange: handleRemoteContentChange,
    onTitleChange: handleRemoteTitleChange,
    onLanguageChange: handleRemoteLanguageChange,
    onVisibilityChange: handleRemoteVisibilityChange,
    onCursorChange: handleRemoteCursorChange,
  });

  // Track if we're in the middle of a local change to prevent auto-save conflicts
  const [isLocalChange, setIsLocalChange] = useState(false);

  // Update active users
  useEffect(() => {
    setActiveUsers(collaborationUsers);
  }, [collaborationUsers]);

  // Auto-save functionality
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Only auto-save if we have a slug and there are actual changes
    if (initialData?.slug && (title || content)) {
      saveTimeoutRef.current = setTimeout(() => {
        handleSave(true);
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, language, isPublic, initialData?.slug]);

  const handleSave = async (isAutoSave = false) => {
    if (isSaving || !initialData?.slug) return;
    
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim() || undefined,
        language,
        content,
        isPublic
      };

      console.log('Saving snippet:', payload); // Debug log

      const response = await fetch(`/api/snippets/${initialData.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Save failed:', errorText);
        throw new Error(`Failed to save snippet: ${errorText}`);
      }

      const result = await response.json();
      console.log('Save successful:', result); // Debug log
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving snippet:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSaving(false);
    }
  };


  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNew = () => {
    window.open('/s/new', '_blank');
  };

  const handleShare = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle content changes with real-time collaboration
  const handleContentChange = (newContent: string) => {
    setIsLocalChange(true);
    setContent(newContent);
    if (initialData?.slug) {
      const cursorPos = textareaRef.current?.selectionStart || 0;
      emitContentChange(newContent, cursorPos);
      lastCursorPosition.current = cursorPos;
    }
    // Reset local change flag after a short delay
    setTimeout(() => setIsLocalChange(false), 500);
  };

  // Handle title changes with real-time collaboration
  const handleTitleChange = (newTitle: string) => {
    setIsLocalChange(true);
    setTitle(newTitle);
    if (initialData?.slug) {
      emitTitleChange(newTitle);
    }
    setTimeout(() => setIsLocalChange(false), 500);
  };

  // Handle language changes with real-time collaboration
  const handleLanguageChange = (newLanguage: string) => {
    setIsLocalChange(true);
    setLanguage(newLanguage);
    if (initialData?.slug) {
      emitLanguageChange(newLanguage);
    }
    setTimeout(() => setIsLocalChange(false), 500);
  };

  // Handle visibility changes with real-time collaboration
  const handleVisibilityChange = (newIsPublic: boolean) => {
    setIsLocalChange(true);
    setIsPublic(newIsPublic);
    if (initialData?.slug) {
      emitVisibilityChange(newIsPublic);
    }
    setTimeout(() => setIsLocalChange(false), 500);
  };

  // Handle cursor position changes
  const handleCursorChange = () => {
    if (textareaRef.current && initialData?.slug) {
      const cursorPos = textareaRef.current.selectionStart || 0;
      if (cursorPos !== lastCursorPosition.current) {
        emitCursorPosition(cursorPos);
        lastCursorPosition.current = cursorPos;
      }
    }
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <SnippetEditorHeader
          isNew={isNew}
          shareUrl={shareUrl}
          isConnected={isConnected}
          activeUsers={activeUsers}
          lastSaved={lastSaved}
          isSaving={isSaving}
          showPreview={showPreview}
          copied={copied}
          onTogglePreview={() => setShowPreview(!showPreview)}
          onCopy={handleCopy}
          onShare={handleShare}
          onSave={() => handleSave()}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* Editor Controls */}
      <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900 px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <Input
            placeholder="Untitled snippet"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="bg-white border-gray-300 text-black placeholder-gray-500 text-sm flex-1 max-w-md"
          />
          
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => handleVisibilityChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                  isPublic ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                    isPublic ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`}></div>
                </div>
              </div>
              <span className="text-xs font-medium">
                {isPublic ? 'Public' : 'Private'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Code Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex bg-black min-h-0">
            {/* Line Numbers */}
            <div className="bg-gray-900 text-gray-500 text-xs font-mono py-4 px-2 select-none border-r border-gray-700 flex-shrink-0 overflow-hidden">
              {content.split('\n').map((_, index) => (
                <div key={index} className="leading-4 text-right">
                  {index + 1}
                </div>
              ))}
            </div>
            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyUp={handleCursorChange}
              onMouseUp={handleCursorChange}
              onFocus={handleCursorChange}
              placeholder="Start typing your code here..."
              className="flex-1 bg-black text-white p-4 font-mono text-xs resize-none outline-none leading-4 overflow-auto min-h-0"
              style={{ tabSize: 2 }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-full lg:w-1/2 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col min-h-0">
            <div className="bg-gray-800 px-4 py-2 text-sm text-gray-400 border-b border-gray-700 flex-shrink-0">
              PREVIEW
            </div>
            <div className="flex-1 p-4 overflow-auto min-h-0">
              <CodeBlock
                code={content || '// Your code will appear here...'}
                language={language}
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Client-side only wrapper to prevent hydration issues
const SnippetEditor = dynamic(() => Promise.resolve(SnippetEditorComponent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-white">Loading editor...</div>
    </div>
  )
});

export default SnippetEditor;
