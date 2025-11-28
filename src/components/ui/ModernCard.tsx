import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ModernCardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'solid' | 'gradient' | 'elevated';
  glowColor?: string;
  children: React.ReactNode;
  hoverable?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  variant = 'glass',
  glowColor,
  children,
  hoverable = true,
  className = '',
  ...motionProps
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-300';

  const variantClasses = {
    glass: 'bg-white/10 dark:bg-gray-800/30 backdrop-blur-xl border border-white/20 dark:border-gray-700/50',
    solid: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 backdrop-blur-xl border border-white/20 dark:border-gray-700/50',
    elevated: 'bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700',
  };

  const hoverClasses = hoverable
    ? 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer'
    : '';

  const glowStyle = glowColor
    ? {
        boxShadow: `0 0 40px ${glowColor}30`,
      }
    : {};

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}
      style={glowStyle}
      whileHover={hoverable ? { y: -4 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

interface GlowingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glowing?: boolean;
  children: React.ReactNode;
}

export const GlowingButton: React.FC<GlowingButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glowing = true,
  children,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
    secondary:
      'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white',
    success:
      'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white',
    danger:
      'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white',
    ghost:
      'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600',
  };

  const glowClasses = {
    primary: glowing ? 'shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70' : '',
    secondary: glowing ? 'shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70' : '',
    success: glowing ? 'shadow-lg shadow-green-500/50 hover:shadow-green-500/70' : '',
    danger: glowing ? 'shadow-lg shadow-red-500/50 hover:shadow-red-500/70' : '',
    ghost: '',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${sizeClasses[size]} ${variantClasses[variant]} ${glowClasses[variant]} rounded-lg font-medium transition-all ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

interface FloatingPanelProps {
  children: React.ReactNode;
  className?: string;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  children,
  className = '',
  position = 'bottom-right',
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed ${positionClasses[position]} z-40 ${className}`}
    >
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
        {children}
      </div>
    </motion.div>
  );
};

interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  to?: string;
  className?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  from = 'from-blue-500',
  to = 'to-purple-600',
  className = '',
}) => {
  return (
    <span
      className={`bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent font-bold ${className}`}
    >
      {children}
    </span>
  );
};

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
}) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(progress * value);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

interface PulsingDotProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PulsingDot: React.FC<PulsingDotProps> = ({ color = 'bg-green-500', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative flex">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}
      />
      <span className={`relative inline-flex rounded-full ${sizeClasses[size]} ${color}`} />
    </span>
  );
};

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  showLabel = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="currentColor"
          className="text-gray-200 dark:text-gray-700"
          fill="none"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};
