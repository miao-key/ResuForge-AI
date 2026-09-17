'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DateRangeBoxProps {
  startValue: string;   // 'YYYY.MM' | ''
  endValue: string;     // 'YYYY.MM' | '至今' | ''
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  minYear?: number;
  maxYear?: number;
}

const MONTH_LABELS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

// 解析 'YYYY.MM' 为 {year, month}，否则 null
function parseYM(v: string): { year: number; month: number } | null {
  if (!v || v === '至今') return null;
  const m = v.match(/^(\d{4})\.(\d{1,2})$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  if (year < 1900 || year > 2100 || month < 1 || month > 12) return null;
  return { year, month };
}

// 格式化为 'YYYY.MM'
function formatYM(year: number, month: number): string {
  return `${year}.${String(month).padStart(2, '0')}`;
}

// 比较 'YYYY.MM' 大小
function ymCmp(a: string, b: string): number {
  const pa = parseYM(a);
  const pb = parseYM(b);
  if (!pa || !pb) return 0;
  if (pa.year !== pb.year) return pa.year - pb.year;
  return pa.month - pb.month;
}

export function DateRangeBox({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  minYear = 1990,
  maxYear = 2100,
}: DateRangeBoxProps) {
  const [openPanel, setOpenPanel] = useState<'start' | 'end' | null>(null);
  // 面板坐标（视口坐标，fixed 定位 + Portal，避开祖先 overflow 裁剪）
  const [panelPos, setPanelPos] = useState<{ left: number; top: number } | null>(null);
  // 月历视图状态
  const [view, setView] = useState<{ year: number; source: 'start' | 'end' }>({
    year: new Date().getFullYear(),
    source: 'start',
  });

  const startRef = useRef<HTMLButtonElement>(null);
  const endRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 计算视口坐标（fixed 定位专用）
  const computePanelPos = () => {
    const trigger = openPanel === 'start' ? startRef.current : endRef.current;
    if (!trigger) return null;
    const r = trigger.getBoundingClientRect();
    return {
      left: r.left,
      top: r.bottom + 4, // 4px 间距
    };
  };

  // 打开面板时：初始化年份 + 计算面板位置
  useEffect(() => {
    if (!openPanel) {
      setPanelPos(null);
      return;
    }
    const val = openPanel === 'start' ? startValue : endValue;
    const parsed = parseYM(val);
    setView({
      year: parsed?.year ?? new Date().getFullYear(),
      source: openPanel,
    });
    setPanelPos(computePanelPos());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPanel, startValue, endValue]);

  // 监听滚动/resize 时刷新位置
  useEffect(() => {
    if (!openPanel) return;
    const handler = () => {
      setPanelPos(computePanelPos());
    };
    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPanel]);

  // 点击外部关闭
  useEffect(() => {
    if (!openPanel) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        startRef.current?.contains(target) ||
        endRef.current?.contains(target)
      ) {
        return;
      }
      setOpenPanel(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPanel]);

  const endIsPresent = endValue === '至今';

  // 起始月份（用于禁用结束面板中早于它的月）
  const startYM = useMemo(() => parseYM(startValue), [startValue]);

  const chooseMonth = (year: number, month: number) => {
    const value = formatYM(year, month);
    if (openPanel === 'start') {
      onStartChange(value);
      // 若新开始 > 现有结束（非"至今"），自动清空结束
      if (endValue && endValue !== '至今' && ymCmp(value, endValue) > 0) {
        onEndChange('');
      }
    } else if (openPanel === 'end') {
      onEndChange(value);
    }
    setOpenPanel(null);
  };

  const choosePresent = () => {
    onEndChange('至今');
    setOpenPanel(null);
  };

  const startDisplay = startValue || '';
  const endDisplay = endValue || '';
  const displayedYear = openPanel ? view.year : new Date().getFullYear();

  return (
    <div className="relative">
      {/* 方框行 */}
      <div className="flex items-center gap-3">
        {/* 开始方框 */}
        <button
          ref={startRef}
          type="button"
          onClick={() => setOpenPanel(openPanel === 'start' ? null : 'start')}
          className={cn(
            'flex-1 h-10 px-3 rounded-md border bg-slate-50',
            'flex items-center justify-between text-sm transition-colors',
            'border-blue-100 hover:border-blue-300',
            openPanel === 'start' && 'border-blue-400 ring-1 ring-blue-300'
          )}
        >
          {startDisplay ? (
            <span className="text-slate-800 font-medium">{startDisplay}</span>
          ) : (
            <span className="text-slate-400">开始时间</span>
          )}
          <svg
            className="w-4 h-4 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* 箭头 */}
        <span className="text-slate-400 text-lg select-none">→</span>

        {/* 结束方框 */}
        <button
          ref={endRef}
          type="button"
          onClick={() => setOpenPanel(openPanel === 'end' ? null : 'end')}
          className={cn(
            'flex-1 h-10 px-3 rounded-md border bg-slate-50',
            'flex items-center justify-between text-sm transition-colors',
            'border-blue-100 hover:border-blue-300',
            openPanel === 'end' && 'border-blue-400 ring-1 ring-blue-300'
          )}
        >
          {endDisplay ? (
            <span className="text-slate-800 font-medium">{endDisplay}</span>
          ) : (
            <span className="text-slate-400">结束时间</span>
          )}
          <svg
            className="w-4 h-4 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* 弹出面板 - Portal 到 body + fixed 视口坐标，不被任何 overflow 裁剪 */}
      {openPanel && panelPos && typeof document !== 'undefined' && createPortal(
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            left: panelPos.left,
            top: panelPos.top,
            zIndex: 9999,
          }}
          className={cn(
            'w-[228px] rounded-lg border border-blue-200 bg-white shadow-xl shadow-blue-500/10',
            'p-3 animate-in fade-in zoom-in-95'
          )}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* 年份选择头 */}
          <div className="flex items-center justify-between mb-2 px-1">
            <button
              type="button"
              onClick={() =>
                setView((v) => ({
                  year: Math.max(minYear, v.year - 1),
                  source: v.source,
                }))
              }
              disabled={displayedYear <= minYear}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center text-slate-600',
                'hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed'
              )}
              title="上一年"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div
              className={cn(
                'px-3 py-1 text-sm font-semibold text-slate-700 select-none',
                'min-w-[64px] text-center tabular-nums'
              )}
              aria-live="polite"
            >
              {displayedYear} 年
            </div>

            <button
              type="button"
              onClick={() =>
                setView((v) => ({
                  year: Math.min(maxYear, v.year + 1),
                  source: v.source,
                }))
              }
              disabled={displayedYear >= maxYear}
              className={cn(
                'w-7 h-7 rounded-md flex items-center justify-center text-slate-600',
                'hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed'
              )}
              title="下一年"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* 月份 3×4 网格 */}
          <div className="grid grid-cols-3 gap-1.5">
            {MONTH_LABELS.map((label, idx) => {
              const month = idx + 1;
              const cellValue = formatYM(displayedYear, month);
              const selectedValue =
                openPanel === 'start' ? startValue : endValue;
              const isSelected = selectedValue === cellValue;

              let isDisabled = false;
              if (openPanel === 'end' && startYM) {
                if (
                  displayedYear < startYM.year ||
                  (displayedYear === startYM.year && month < startYM.month)
                ) {
                  isDisabled = true;
                }
              }

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => !isDisabled && chooseMonth(displayedYear, month)}
                  disabled={isDisabled}
                  className={cn(
                    'h-9 rounded-md text-sm font-medium transition-colors',
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-blue-50',
                    isDisabled &&
                      'opacity-30 cursor-not-allowed hover:bg-transparent'
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* 至今按钮（仅结束面板显示，浅蓝色） */}
          {openPanel === 'end' && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={choosePresent}
                className={cn(
                  'w-full h-9 rounded-md text-sm font-medium transition-colors border',
                  endIsPresent
                    ? 'bg-sky-100 text-sky-700 border-sky-200 shadow-sm'
                    : 'bg-sky-50 text-sky-600 hover:bg-sky-100 border-sky-200'
                )}
              >
                至今
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
