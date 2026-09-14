'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-4',
  lg: 'h-12 w-12 border-4',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  label = '加载中...',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-screen',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-cyan-500 border-r-transparent',
          sizeClasses[size]
        )}
      />
      {label && (
        <p className={cn('text-slate-400', textSizes[size])}>{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// 带文字的加载按钮状态
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        loading && 'cursor-not-allowed opacity-70',
        className
      )}
      {...props}
    >
      {loading && (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

// Skeleton 加载骨架屏
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="加载中">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-800 rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
}

// 内容占位符（用于卡片加载）
export function CardSkeleton() {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
        <div className="flex gap-2 pt-4 border-t border-slate-700">
          <div className="h-8 bg-slate-700 rounded flex-1" />
          <div className="h-8 bg-slate-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

// 渐进式加载
interface ProgressiveLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeleton?: React.ReactNode;
}

export function ProgressiveLoader({ 
  isLoading, 
  children, 
  fallback,
  skeleton 
}: ProgressiveLoaderProps) {
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (!isLoading) {
      // 短暂延迟后显示内容，避免闪烁
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isLoading]);

  if (isLoading && !showContent) {
    return skeleton ? <>{skeleton}</> : fallback || <LoadingSpinner size="sm" />;
  }

  return <>{children}</>;
}
