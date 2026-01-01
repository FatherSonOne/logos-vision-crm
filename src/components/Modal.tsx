import React, { useEffect, useState } from 'react';
import { IconButton } from './ui/Button';
import { CloseIcon } from './icons';

/**
 * CMF Nothing Design System - Modal Component
 * ============================================
 * Modal dialog using CMF design tokens.
 * Clean, matte aesthetic without glassmorphism.
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsMounted(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={onClose}
      />

      {/* Modal content */}
      <div
        className={`relative w-full mx-4 p-6 rounded-lg transition-all duration-300 ease-out ${sizeClasses[size]} ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          backgroundColor: 'var(--cmf-surface)',
          border: '1px solid var(--cmf-border)',
          boxShadow: 'var(--cmf-shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
        onTransitionEnd={handleAnimationEnd}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center pb-4 mb-4"
          style={{ borderBottom: '1px solid var(--cmf-divider)' }}
        >
          <h3
            className="text-xl font-semibold"
            style={{ color: 'var(--cmf-text)' }}
          >
            {title}
          </h3>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<CloseIcon />}
            aria-label="Close modal"
          />
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};
