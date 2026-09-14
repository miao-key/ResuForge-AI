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
  { value: '#0ea5e9', label: '天蓝', color: '#0ea5e9' },
  { value: '#3b82f6', label: '亮蓝', color: '#3b82f6' },
  { value: '#1d4ed8', label: '深蓝', color: '#1d4ed8' },
  { value: '#7c3aed', label: '紫色', color: '#7c3aed' },
  { value: '#059669', label: '翠绿', color: '#059669' },
  { value: '#dc2626', label: '红色', color: '#dc2626' },
  { value: '#ea580c', label: '橙色', color: '#ea580c' },
  { value: '#475569', label: '深灰', color: '#475569' },
];

export function PreviewControls({
  scale,
  onScaleChange,
  themeColor,
  onThemeColorChange,
  onPrint,
}: PreviewControlsProps) {
  return (
    <div className="relative overflow-hidden flex items-center justify-between gap-4 p-3 bg-gradient-to-r from-blue-50/80 via-white to-cyan-50/80 border border-blue-100 rounded-xl mb-4 flex-wrap backdrop-blur-sm">
      {/* Gradient highlight overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      {/* Scale Controls */}
      <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
            缩放:
          </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onScaleChange(Math.max(0.3, scale - 0.1))}
          className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          title="缩小"
        >
          −
        </Button>
        <span className="text-xs text-slate-700 min-w-[40px] text-center font-medium">
          {Math.round(scale * 100)}%
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onScaleChange(Math.min(2, scale + 0.1))}
          className="h-7 w-7 p-0 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
          title="放大"
        >
          +
        </Button>
        <div className="flex gap-1 ml-2 border-l border-blue-100 pl-2">
          {SCALE_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onScaleChange(preset.value)}
              className={`px-2 py-0.5 text-xs rounded transition ${
                Math.abs(scale - preset.value) < 0.01
                  ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-500 hover:text-blue-700 hover:bg-blue-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Color Picker */}
      <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap font-medium">
            主题色:
          </span>
        <div className="flex gap-1.5">
          {THEME_COLORS.map((colorOption) => (
            <button
              key={colorOption.value}
              onClick={() => onThemeColorChange(colorOption.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                themeColor === colorOption.value
                  ? 'border-blue-500 scale-110 ring-2 ring-blue-200'
                  : 'border-white hover:scale-110 hover:border-blue-300'
              }`}
              style={{ backgroundColor: colorOption.color }}
              title={colorOption.label}
            />
          ))}
        </div>
      </div>

      {/* Print Button */}
      {onPrint && (
        <Button
          size="sm"
          variant="outline"
          onClick={onPrint}
          className="border-blue-200 hover:bg-blue-50 text-blue-700 hover:border-blue-300 transition-all"
          title="打印预览"
        >
          🖨️ 打印
        </Button>
      )}
    </div>
  );
}
