"use client";
import { Button } from '@/components/ui/button';
import { Copy, Pencil, Flag, Download, Image } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { downloadCodeAsImage, downloadCodeAsSVG } from '@/utils/codeImageUtils';

export interface SnippetActionsProps {
  slug: string;
  code: string;
}

export default function SnippetActions({ slug, code }: SnippetActionsProps) {
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

  const handleDownloadSVG = () => {
    try {
      const success = downloadCodeAsSVG('code-display', `snippet-${slug}`);
      if (!success) {
        alert('Failed to download SVG. Please try again.');
      }
    } catch (error) {
      console.error('SVG download error:', error);
      alert('Failed to download SVG. Please try again.');
    }
  };

  return (
    <div className="flex gap-2">
      <div title={copied ? 'Copied!' : 'Copy code'}>
        <Button 
          onClick={handleCopy} 
          className="bg-gray-700 hover:bg-gray-600 text-white border-0 px-3 py-1.5 rounded-md font-normal text-xs transition-colors duration-200 flex items-center gap-1.5"
        >
          <Copy className="w-3 h-3" />
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      
      <div title="Download as PNG Image">
        <Button 
          onClick={handleDownloadImage} 
          disabled={downloading}
          className="bg-gray-700 hover:bg-gray-600 text-white border-0 px-3 py-1.5 rounded-md font-normal text-xs transition-colors duration-200 flex items-center gap-1.5 disabled:opacity-50"
        >
          <Image className="w-3 h-3" />
          {downloading ? '...' : 'PNG'}
        </Button>
      </div>
      
      <div title="Download as SVG">
        <Button 
          onClick={handleDownloadSVG} 
          className="bg-gray-700 hover:bg-gray-600 text-white border-0 px-3 py-1.5 rounded-md font-normal text-xs transition-colors duration-200 flex items-center gap-1.5"
        >
          <Download className="w-3 h-3" />
          SVG
        </Button>
      </div>
      
      <div title="Open in Editor">
        <Button 
          onClick={() => router.push(`/s/${slug}/edit`)} 
          className="bg-gray-700 hover:bg-gray-600 text-white border-0 px-3 py-1.5 rounded-md font-normal text-xs transition-colors duration-200 flex items-center gap-1.5"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </Button>
      </div>
      
      <div title="Report Abuse">
        <Button 
          onClick={() => alert('Report flow TBD')} 
          className="bg-gray-700 hover:bg-gray-600 text-white border-0 px-2.5 py-1.5 rounded-md font-normal text-xs transition-colors duration-200 flex items-center gap-1.5"
        >
          <Flag className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
