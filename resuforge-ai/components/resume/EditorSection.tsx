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
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
        {onOptimize && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOptimize}
            disabled={isOptimizing || optimizeDisabled}
            className="border-cyan-900/50 text-cyan-400 hover:bg-cyan-950/50 disabled:opacity-50"
          >
            {isOptimizing ? '✨ 优化中...' : '✨ AI 优化'}
          </Button>
        )}
      </div>
      {children}
    </div>
  );
}
