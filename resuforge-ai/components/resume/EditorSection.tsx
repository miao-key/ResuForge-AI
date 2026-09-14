'use client';

import { Button } from '@/components/ui/button';

interface EditorSectionProps {
  title: string;
  children: React.ReactNode;
  onOptimize?: () => void;
  isOptimizing?: boolean;
  optimizeDisabled?: boolean;
}

export function EditorSection({
  title,
  children,
  onOptimize,
  isOptimizing,
  optimizeDisabled = false,
}: EditorSectionProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-blue-100/80 bg-white/80 p-6 shadow-sm shadow-blue-500/5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-200">
      {/* 顶部蓝色装饰条 */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 opacity-70" />

      {/* 极淡的渐变背景 */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50/40 via-transparent to-cyan-50/30" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
          {title}
        </h3>
        {onOptimize && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOptimize}
            disabled={isOptimizing || optimizeDisabled}
            className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-50 transition-all"
          >
            {isOptimizing ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent" />
                优化中...
              </span>
            ) : (
              '✨ AI 优化'
            )}
          </Button>
        )}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
