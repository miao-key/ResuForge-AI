'use client';

import type { CSSProperties } from 'react';

export interface RenderableStyledText {
  text: string;
  bold?: boolean;
  textAlign?: 'left' | 'center' | 'right';
}

interface RichTextViewProps {
  text: string;
  bold?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * 渲染 description 字段 - 根据 bold / textAlign 直接应用样式。
 * 老数据（无样式字段）会按纯文本渲染，保留换行。
 */
export function RichTextView({ text, bold, textAlign = 'left', className }: RichTextViewProps) {
  const hasAlign = textAlign && textAlign !== 'left';
  const hasStyle = !!bold || hasAlign;

  if (!hasStyle) {
    return <span className={`whitespace-pre-line ${className ?? ''}`}>{text}</span>;
  }

  const style: CSSProperties = {
    textAlign: textAlign,
    fontWeight: bold ? 'bold' : 'normal',
  };

  return (
    <div className={className}>
      <div style={style} className="whitespace-pre-line">
        {text}
      </div>
    </div>
  );
}
