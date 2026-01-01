import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/**
 * CMF Nothing Design System - Toast Component
 * ============================================
 * Notification toasts using CMF design tokens.
 * No glassmorphism, clean matte aesthetic.
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  // Create showToast helper that matches expected signature: showToast(message, type)
  const showToast = (message: string, type: ToastType = 'info') => {
    context.addToast({ message, type });
  };

  return { ...context, showToast };
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; removeToast: (id: string) => void }> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const getToastStyles = (type: ToastType): { bg: string; border: string; icon: string } => {
  switch (type) {
    case 'success':
      return {
        bg: 'var(--cmf-success-muted)',
        border: 'var(--cmf-success)',
        icon: 'var(--cmf-success)',
      };
    case 'error':
      return {
        bg: 'var(--cmf-error-muted)',
        border: 'var(--cmf-error)',
        icon: 'var(--cmf-error)',
      };
    case 'warning':
      return {
        bg: 'var(--cmf-warning-muted)',
        border: 'var(--cmf-warning)',
        icon: 'var(--cmf-warning)',
      };
    case 'info':
    default:
      return {
        bg: 'var(--cmf-info-muted)',
        border: 'var(--cmf-info)',
        icon: 'var(--cmf-info)',
      };
  }
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  const styles = getToastStyles(toast.type);

  // Inline SVG icons (no external dependencies)
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 p-4 rounded-lg border toast-slide-in"
      style={{
        minWidth: '320px',
        maxWidth: '420px',
        backgroundColor: styles.bg,
        borderColor: styles.border,
        boxShadow: 'var(--cmf-shadow-lg)',
      }}
    >
      <div
        className="flex-shrink-0 mt-0.5"
        style={{ color: styles.icon }}
      >
        {icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold"
          style={{ color: 'var(--cmf-text)' }}
        >
          {toast.message}
        </p>
        {toast.description && (
          <p
            className="text-xs mt-1"
            style={{ color: 'var(--cmf-text-muted)' }}
          >
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 transition-colors"
        style={{ color: 'var(--cmf-text-faint)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--cmf-text)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--cmf-text-faint)';
        }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
