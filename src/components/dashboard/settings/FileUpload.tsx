'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  value?: string;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export default function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  maxSize = 5, // 5MB default
  label = 'Upload File',
  description,
  className = '',
  disabled = false
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (disabled) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onChange(file);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </label>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3">
        {/* Preview */}
        {preview && (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="w-20 h-20 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Upload Area */}
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            isDragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="space-y-2">
            {preview ? (
              <User className="w-8 h-8 mx-auto text-gray-400" />
            ) : (
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
            )}
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {preview ? (
                'Click to change image'
              ) : (
                <>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    Click to upload
                  </span>
                  {' '}or drag and drop
                </>
              )}
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {accept === 'image/*' ? 'PNG, JPG, GIF' : 'Any file'} up to {maxSize}MB
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            {preview ? 'Change Image' : 'Choose File'}
          </Button>
        </div>
      </div>
    </div>
  );
} 