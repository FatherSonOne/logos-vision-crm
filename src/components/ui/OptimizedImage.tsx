import React, { useState, useRef, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackSrc?: string;
  lazy?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

/**
 * OptimizedImage component with lazy loading, error handling, and placeholders
 *
 * Features:
 * - Lazy loading with Intersection Observer
 * - Error handling with fallback image
 * - Loading placeholders (blur, skeleton)
 * - Responsive image support
 *
 * Usage:
 * <OptimizedImage
 *   src="/path/to/image.jpg"
 *   alt="Description"
 *   lazy={true}
 *   placeholder="skeleton"
 * />
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  fallbackSrc,
  lazy = true,
  placeholder = 'skeleton',
  onLoad,
  onError,
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | null>(lazy ? null : src);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!lazy) {
      return;
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !currentSrc) {
          setCurrentSrc(src);
          if (observerRef.current && imgRef.current) {
            observerRef.current.unobserve(imgRef.current);
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      rootMargin: '50px',
      threshold: 0.01,
    });

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, src, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    const error = new Error(`Failed to load image: ${src}`);

    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.(error);
    }
  };

  const getPlaceholder = () => {
    if (hasError) {
      return (
        <div
          className={`flex items-center justify-center bg-slate-200 dark:bg-slate-700 ${className}`}
          style={{ width, height }}
        >
          <div className="text-center">
            <ImageOff className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500 mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Image not available</p>
          </div>
        </div>
      );
    }

    if (placeholder === 'skeleton' && !isLoaded && currentSrc) {
      return (
        <div
          className={`animate-pulse bg-slate-200 dark:bg-slate-700 ${className}`}
          style={{ width, height }}
        />
      );
    }

    if (placeholder === 'blur' && !isLoaded && currentSrc) {
      return (
        <div
          className={`${className} backdrop-blur-lg bg-slate-100 dark:bg-slate-800`}
          style={{ width, height }}
        />
      );
    }

    return null;
  };

  return (
    <div className="relative inline-block">
      {!isLoaded && getPlaceholder()}

      {currentSrc && !hasError && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          style={{ objectFit }}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
        />
      )}

      {!currentSrc && lazy && (
        <div
          ref={imgRef}
          className={`bg-slate-200 dark:bg-slate-700 ${className}`}
          style={{ width, height }}
        />
      )}
    </div>
  );
};

/**
 * Avatar component with optimized image loading
 */
export interface AvatarProps {
  src?: string;
  alt: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorFromName = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!src) {
    return (
      <div
        className={`${sizeClasses[size]} ${getColorFromName(name)} ${className} rounded-full flex items-center justify-center text-white font-semibold`}
      >
        {getInitials(name)}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} ${className} rounded-full`}
      lazy={true}
      placeholder="skeleton"
      objectFit="cover"
    />
  );
};
