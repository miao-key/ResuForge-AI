'use client';

import { Button } from '@/components/ui/button';

interface PreviewControlsProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  themeColor: string;
  onThemeColorChange: (color: string) => void;
  onPrint?: () => void;
}

const SCALE_PRESETS = [
  { value: 0.5, label: '50%' },
  { value: 0.75, label: '75%' },
  { value: 1, label: '100%' },
  { value: 1.25, label: '125%' },
  { value: 1.5, label: '150%' },
];

const THEME_COLORS = [
  { value: '#0891b2', label: '青蓝', color: '#0891b2' },
  { value: '#1e40af', label: '深蓝', color: '#1e40af' },
  { value: '#7c3aed', label: '紫色', color: '#7c3aed' },
  { value: '#059669', label: '翠绿', color: '#059669' },
  { value: '#dc2626', label: '红色', color: '#dc2626' },
  { value: '#ea580c', label: '橙色', color: '#ea580c' },
  { value: '#475569', label: '深灰', color: '#475569' },
  { value: '#0f172a', label: '黑色', color: '#0f172a' },
];

export function PreviewControls({
  scale,
  onScaleChange,
  themeColor,
  onThemeColorChange,
  onPrint,
}: PreviewControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-slate-900/50 border border-slate-800 rounded-lg mb-4 flex-wrap">
      {/* 缩放控制 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 whitespace-nowrap">缩放:</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onScaleChange(Math.max(0.3, scale - 0.1))}
          className="h-7 w-7 p-0 text-slate-300 hover:text-slate-50"
          title="缩小"
        >
          −
        </Button>
        <span className="text-xs text-slate-300 min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onScaleChange(Math.min(2, scale + 0.1))}
          className="h-7 w-7 p-0 text-slate-300 hover:text-slate-50"
          title="放大"
        >
          +
        </Button>
        <div className="flex gap-1 ml-2 border-l border-slate-700 pl-2">
          {SCALE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onScaleChange(preset.value)}
              className={`px-2 py-0.5 text-xs rounded transition ${
                Math.abs(scale - preset.value) < 0.01
                  ? 'bg-cyan-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-50 hover:bg-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 主题色 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 whitespace-nowrap">主题色:</span>
        <div className="flex gap-1.5">
          {THEME_COLORS.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => onThemeColorChange(colorOption.value)}
              className={`w-6 h-6 rounded-full border-2 transition ${
                themeColor === colorOption.value
                  ? 'border-white scale-110'
                  : 'border-slate-600 hover:border-slate-400'
              }`}
              style={{ backgroundColor: colorOption.color }}
              title={colorOption.label}
            />
          ))}
        </div>
      </div>

      {/* 打印按钮 */}
      {onPrint && (
        <Button
          size="sm"
          variant="outline"
          onClick={onPrint}
          className="border-slate-700 hover:bg-slate-800 text-slate-300"
          title="打印预览"
        >
          🖨️ 打印
        </Button>
      )}
    </div>
  );
}
