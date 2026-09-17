'use client';

import type { AutoSaveStatus } from '@/hooks/use-auto-save';
import { formatDateTime } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

export function AutoSaveIndicator({ status, lastSavedAt, className = '' }: AutoSaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {status === 'saving' && (
        <>
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-500" />
          <span className="text-blue-600 font-medium">保存中...</span>
        </>
      )}

      {status === 'saved' && (
        <>
          <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-slate-600 font-medium">
            已保存
            {lastSavedAt && (
              <span className="ml-1 text-slate-500 font-normal">
                {formatDateTime(lastSavedAt)}
              </span>
            )}
          </span>
        </>
      )}

      {status === 'error' && (
        <>
          <svg className="h-3.5 w-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-red-600 font-medium">保存失败</span>
        </>
      )}
    </div>
  );
}
