'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-4xl max-h-[90vh]',
  xl: 'max-w-6xl max-h-[90vh]',
  full: 'max-w-[95vw] max-h-[95vh]'
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }
  }, [isOpen]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop with blur effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />
          
          {/* Modal container */}
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ 
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className={cn(
                'relative w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden',
                sizeClasses[size],
                className
              )}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  {title && (
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Modal Header component for more complex layouts
export function ModalHeader({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700",
      className
    )}>
      {children}
    </div>
  );
}

// Modal Content component
export function ModalContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}

// Modal Footer component
export function ModalFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
      className
    )}>
      {children}
    </div>
  );
} 