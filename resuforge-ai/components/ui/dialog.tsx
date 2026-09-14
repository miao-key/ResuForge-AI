'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: 'default' | 'destructive';
  loading?: boolean;
  className?: string;
}

/**
 * 自定义确认弹窗
 *
 * 用法 1: 确认弹窗(删除前提示)
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="确定要删除这份简历吗？"
 *   description="此操作无法撤销"
 *   onConfirm={handleDelete}
 *   confirmText="删除"
 * />
 *
 * 用法 2: 通用弹窗(配合 children)
 * <Dialog open={open} onClose={...} title="详情">
 *   <div>任意内容</div>
 * </Dialog>
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  confirmVariant = 'default',
  loading = false,
  className,
}: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // ESC 键关闭
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onClose]);

  // 打开时锁定 body 滚动
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current && !loading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (loading) return;
    onConfirm?.();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        className={cn(
          'w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50',
          'p-6 animate-in zoom-in-95 slide-in-from-bottom-4',
          'duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <h2
          id="dialog-title"
          className="text-lg font-semibold text-slate-50"
        >
          {title}
        </h2>

        {/* 描述 */}
        {description && (
          <p className="mt-2 text-sm text-slate-400">
            {description}
          </p>
        )}

        {/* 自定义内容 */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}

        {/* 按钮组 */}
        {(onConfirm !== undefined || cancelText) && (
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-50 border border-slate-700 hover:border-slate-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            {onConfirm !== undefined && (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
                  confirmVariant === 'destructive'
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 text-white shadow-lg shadow-cyan-500/20'
                )}
              >
                {loading && (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-white/40 border-r-transparent" />
                )}
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
