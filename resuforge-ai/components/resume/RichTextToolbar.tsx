'use client';

import { Bold, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

export interface RichFormat {
  bold?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * 描述模块顶部的富文本工具栏
 * 提供：加粗、左对齐、居中、右对齐
 */
export interface RichTextToolbarProps {
  bold: boolean;
  textAlign: 'left' | 'center' | 'right';
  onToggleBold: () => void;
  onSetAlign: (align: 'left' | 'center' | 'right') => void;
}

export function RichTextToolbar({
  bold,
  textAlign,
  onToggleBold,
  onSetAlign,
}: RichTextToolbarProps) {
  const baseBtn =
    'h-8 w-8 inline-flex items-center justify-center rounded-md border border-blue-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors';
  const activeBtn =
    'h-8 w-8 inline-flex items-center justify-center rounded-md border border-blue-400 bg-blue-50 text-blue-600';

  const alignBtn = (align: 'left' | 'center' | 'right', Icon: typeof AlignLeft) => (
    <button
      type="button"
      onClick={() => onSetAlign(align)}
      className={textAlign === align ? activeBtn : baseBtn}
      title={`${align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}`}
      aria-label={`${align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-white/60 border border-blue-100 rounded-md mb-1.5 backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggleBold}
        className={bold ? activeBtn : baseBtn}
        title="加粗"
        aria-label="加粗"
      >
        <Bold className="h-4 w-4" />
      </button>
      <div className="w-px h-5 bg-blue-100 mx-0.5" />
      {alignBtn('left', AlignLeft)}
      {alignBtn('center', AlignCenter)}
      {alignBtn('right', AlignRight)}
    </div>
  );
}
