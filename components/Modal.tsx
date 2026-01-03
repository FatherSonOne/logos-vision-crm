import React, { useEffect, useState } from 'react';

/**
 * Modal Component - CMF Nothing Design System
 * Uses CSS variables for proper dark/light mode theming
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  const handleAnimationEnd = () => {
    if (!isOpen) {
      setIsMounted(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay with blur */}
      <div
        className={`absolute inset-0 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        onClick={onClose}
      />

      {/* Modal content using CMF design tokens - with max-height and overflow handling */}
      <div
        className={`relative w-full p-6 rounded-lg transition-all duration-300 ease-out ${sizeClasses[size]} ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{
          backgroundColor: 'var(--cmf-surface)',
          border: '1px solid var(--cmf-border)',
          boxShadow: 'var(--cmf-shadow-xl)',
          maxHeight: 'calc(100vh - 4rem)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
        onTransitionEnd={handleAnimationEnd}
      >
        {/* Header - fixed at top */}
        <div
          className="flex justify-between items-center pb-4 mb-4"
          style={{ borderBottom: '1px solid var(--cmf-divider)', flexShrink: 0 }}
        >
          <h3
            className="text-xl font-semibold"
            style={{ color: 'var(--cmf-text)' }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors hover:opacity-70"
            style={{ color: 'var(--cmf-text-muted)' }}
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Content - scrollable when overflow */}
        <div style={{ overflowY: 'auto', flex: 1, marginRight: '-0.5rem', paddingRight: '0.5rem' }}>{children}</div>
      </div>
    </div>
  );
};