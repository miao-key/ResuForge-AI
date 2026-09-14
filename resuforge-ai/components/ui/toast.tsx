'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastConfig: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/50',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/50',
    icon: '✕',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/50',
    icon: 'ℹ',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/50',
    icon: '⚠',
  },
};

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const config = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg shadow-black/20',
        'animate-in slide-in-from-right fade-in duration-300',
        config.bg,
        config.border
      )}
      role="alert"
      aria-live="polite"
    >
      <span className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
        toast.type === 'success' && 'bg-green-500/20 text-green-400',
        toast.type === 'error' && 'bg-red-500/20 text-red-400',
        toast.type === 'info' && 'bg-blue-500/20 text-blue-400',
        toast.type === 'warning' && 'bg-amber-500/20 text-amber-400',
      )}>
        {config.icon}
      </span>
      <p className="text-sm text-slate-200 flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="关闭通知"
      >
        ✕
      </button>
    </div>
  );
}

// Toast 上下文
let toastListeners: ((toasts: Toast[]) => void)[] = [];
let toasts: Toast[] = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener([...toasts]));
}

export function toast(message: string, type: ToastType = 'info', duration?: number) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  toasts = [...toasts, { id, type, message, duration }];
  notifyListeners();
  return id;
}

toast.success = (message: string, duration?: number) => toast(message, 'success', duration);
toast.error = (message: string, duration?: number) => toast(message, 'error', duration);
toast.info = (message: string, duration?: number) => toast(message, 'info', duration);
toast.warning = (message: string, duration?: number) => toast(message, 'warning', duration);

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts);
    toastListeners.push(listener);
    setCurrentToasts([...toasts]);

    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, []);

  return { toasts: currentToasts, removeToast };
}

// Toast 容器组件
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-label="通知列表"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

// 重试工具函数
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, onRetry } = options;
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        onRetry?.(attempt + 1, lastError);
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError!;
}
