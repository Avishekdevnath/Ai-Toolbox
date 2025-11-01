"use client";
import { Button } from '@/components/ui/button';
import { Copy, Pencil, Flag, Image, WrapText, AlignLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { downloadCodeAsImage } from '@/utils/codeImageUtils';

export interface SnippetActionsProps {
  slug: string;
  code: string;
  wordWrap?: boolean;
  onWordWrapToggle?: () => void;
}

export default function SnippetActions({ slug, code, wordWrap = false, onWordWrapToggle }: SnippetActionsProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownloadImage = async () => {
    setDownloading(true);
    try {
      const success = await downloadCodeAsImage('code-display', `snippet-${slug}`);
      if (!success) {
        alert('Failed to download image. Please try again.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex gap-1 sm:gap-1.5">
      {/* Word Wrap Toggle - Icon Only */}
      {onWordWrapToggle && (
        <button
          onClick={onWordWrapToggle}
          title={wordWrap ? 'Disable word wrap' : 'Enable word wrap'}
          className={`p-1.5 sm:p-2 rounded-md transition-all duration-200 flex items-center justify-center ${
            wordWrap 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
          }`}
        >
          {wordWrap ? (
            <WrapText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
        </button>
      )}
      
      {/* Copy Button - Icon Only */}
      <button
        onClick={handleCopy}
        title={copied ? 'Copied!' : 'Copy code'}
        className="p-1.5 sm:p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center"
      >
        {copied ? (
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
      </button>
      
      {/* Download as Image - Icon Only */}
      <button
        onClick={handleDownloadImage}
        disabled={downloading}
        title="Download as PNG"
        className="p-1.5 sm:p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Image className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${downloading ? 'animate-pulse' : ''}`} />
      </button>
      
      {/* Edit Button - Icon Only */}
      <button
        onClick={() => router.push(`/s/${slug}/edit`)}
        title="Edit snippet"
        className="p-1.5 sm:p-2 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-all duration-200 flex items-center justify-center"
      >
        <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
      
      {/* Report Button - Icon Only (Hidden on mobile) */}
      <button
        onClick={() => alert('Report flow TBD')}
        title="Report abuse"
        className="hidden sm:flex p-1.5 sm:p-2 rounded-md bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-all duration-200 items-center justify-center"
      >
        <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>
    </div>
  );
}
