'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Share2, 
  Copy, 
  Check, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Mail, 
  MessageSquare,
  Link as LinkIcon,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface ToolSharingProps {
  toolSlug: string;
  toolName: string;
  toolDescription: string;
  toolUrl: string;
  className?: string;
}

export default function ToolSharing({ 
  toolSlug, 
  toolName, 
  toolDescription, 
  toolUrl,
  className = ''
}: ToolSharingProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/tools/${toolSlug}`;
  const shareText = `Check out this amazing ${toolName} tool! ${toolDescription}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link Copied!',
        description: 'Tool link has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    let url = '';
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);

    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(`Check out ${toolName}`)}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: toolName,
          text: toolDescription,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={shareViaNative}
        className={className}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Share {toolName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Social Media Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => shareOnSocial('twitter')}
                  className="flex items-center space-x-2"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareOnSocial('facebook')}
                  className="flex items-center space-x-2"
                >
                  <Facebook className="w-4 h-4" />
                  <span>Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareOnSocial('linkedin')}
                  className="flex items-center space-x-2"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareOnSocial('email')}
                  className="flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareOnSocial('whatsapp')}
                  className="flex items-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </Button>
              </div>

              {/* Direct Link */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Direct Link</label>
                <div className="flex space-x-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* QR Code (placeholder) */}
              <div className="text-center p-4 border rounded-lg">
                <LinkIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  QR Code feature coming soon!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
} 