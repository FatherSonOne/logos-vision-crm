import React from 'react';

/**
 * CMF Aurora Design System - Button Component
 * ===========================================
 * A button component with aurora-inspired styling and smooth animations.
 *
 * Variants:
 * - primary: Uses aurora accent color with glow effect
 * - secondary: Subtle surface-based styling
 * - ghost: Transparent background, minimal hover
 * - danger: Uses error color for destructive actions
 * - success: Aurora green for positive actions
 * - outline: Bordered, transparent background with aurora hover
 * - aurora: Special gradient button with flowing colors
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'aurora';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
}

// CMF Aurora-based variant styles using CSS custom properties
const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--cmf-accent)',
    color: 'var(--cmf-accent-text)',
    borderColor: 'var(--cmf-accent)',
  },
  secondary: {
    backgroundColor: 'var(--cmf-surface)',
    color: 'var(--cmf-text)',
    borderColor: 'var(--cmf-border-strong)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--cmf-text-secondary)',
    borderColor: 'transparent',
  },
  danger: {
    backgroundColor: 'var(--cmf-error)',
    color: '#FFFFFF',
    borderColor: 'var(--cmf-error)',
  },
  success: {
    backgroundColor: 'var(--cmf-success)',
    color: '#0F172A',
    borderColor: 'var(--cmf-success)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--cmf-accent)',
    borderColor: 'var(--cmf-accent)',
  },
  aurora: {
    background: 'linear-gradient(135deg, var(--aurora-teal), var(--aurora-cyan), var(--aurora-teal))',
    backgroundSize: '200% 200%',
    color: '#0F172A',
    borderColor: 'transparent',
  },
};

// Hover styles for each variant
const variantHoverStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--cmf-accent-hover)',
    borderColor: 'var(--cmf-accent-hover)',
  },
  secondary: {
    backgroundColor: 'var(--cmf-surface-2)',
  },
  ghost: {
    backgroundColor: 'var(--cmf-hover-overlay)',
    color: 'var(--cmf-text)',
  },
  danger: {
    backgroundColor: 'var(--cmf-error-hover)',
    borderColor: 'var(--cmf-error-hover)',
  },
  success: {
    backgroundColor: 'var(--cmf-success-hover)',
    borderColor: 'var(--cmf-success-hover)',
  },
  outline: {
    backgroundColor: 'var(--cmf-accent-subtle)',
  },
  aurora: {
    backgroundPosition: '100% 50%',
  },
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2.5',
};

const iconSizeClasses: Record<ButtonSize, string> = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => (
  <svg
    className={`animate-spin ${iconSizeClasses[size]}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      glow = false,
      disabled,
      className = '',
      children,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true);
      onMouseEnter?.(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false);
      onMouseLeave?.(e);
    };

    // Determine glow effect based on variant and glow prop
    const shouldGlow = glow || variant === 'primary' || variant === 'aurora';
    const glowShadow = shouldGlow
      ? variant === 'aurora'
        ? 'var(--aurora-glow-md)'
        : 'var(--aurora-glow-sm)'
      : undefined;
    const hoverGlowShadow = shouldGlow ? 'var(--aurora-glow-md)' : undefined;

    // Merge base styles with hover styles when hovered
    const buttonStyle: React.CSSProperties = {
      ...variantStyles[variant],
      ...(isHovered && !isDisabled ? variantHoverStyles[variant] : {}),
      border: variant === 'aurora' ? 'none' : '1px solid',
      borderColor: variantStyles[variant].borderColor,
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isHovered && !isDisabled ? hoverGlowShadow : glowShadow,
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={buttonStyle}
        className={`
          inline-flex items-center justify-center font-medium
          rounded-[var(--cmf-radius-full)]
          focus:outline-none aurora-focus focus-pulse
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          active:scale-[0.98] btn-press btn-ripple-effect btn-glow-hover
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${variant === 'aurora' ? 'aurora-border-animated btn-aurora-enhanced' : ''}
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size} />
        ) : leftIcon ? (
          <span className={`${iconSizeClasses[size]} transition-transform duration-200 group-hover:scale-110`}>{leftIcon}</span>
        ) : null}

        {children && <span>{children}</span>}

        {rightIcon && !isLoading && (
          <span className={`${iconSizeClasses[size]} transition-transform duration-200 group-hover:scale-110`}>{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const IconButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> & {
    icon: React.ReactNode;
    'aria-label': string;
  }
>(({ variant = 'ghost', size = 'md', icon, className = '', style, onMouseEnter, onMouseLeave, disabled, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const iconOnlySizes: Record<ButtonSize, string> = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  const buttonStyle: React.CSSProperties = {
    ...variantStyles[variant],
    ...(isHovered && !disabled ? variantHoverStyles[variant] : {}),
    border: '1px solid',
    transition: 'all 150ms ease-out',
    ...style,
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={buttonStyle}
      className={`
        inline-flex items-center justify-center
        rounded-[var(--cmf-radius-full)]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-[color:var(--cmf-accent)] focus-pulse
        disabled:opacity-50 disabled:cursor-not-allowed
        active:translate-y-px btn-ripple-effect icon-hover-bounce
        ${iconOnlySizes[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      <span className={`${iconSizeClasses[size]} flex items-center justify-center`}>{icon}</span>
    </button>
  );
});

IconButton.displayName = 'IconButton';
