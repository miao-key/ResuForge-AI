'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { ResumeContent } from '@/types';
import { ResumeRenderer } from '@/components/resume/ResumeRenderer';

// A4 宽度（96dpi ≈ 210mm = 816px）
const RESUME_WIDTH = 816;

export interface ZoomablePreviewHandle {
  /** 导出前强制原始尺寸，返回恢复函数 */
  prepareForExport: () => Promise<() => void>;
}

interface ZoomablePreviewProps {
  content: ResumeContent;
  templateId: string;
}

export const ZoomablePreview = forwardRef<ZoomablePreviewHandle, ZoomablePreviewProps>(
  function ZoomablePreview({ content, templateId }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [zoomed, setZoomed] = useState(false);

    // 监听容器宽度变化（拖动左右分割条时实时响应）
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const update = () => {
        const styles = window.getComputedStyle(el);
        const padX =
          parseFloat(styles.paddingLeft || '0') +
          parseFloat(styles.paddingRight || '0');
        setContainerWidth(Math.max(0, el.clientWidth - padX));
      };

      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, []);

    const handleToggleZoom = useCallback(() => {
      setZoomed((prev) => !prev);
    }, []);

    // 切换时归零滚动
    useEffect(() => {
      const el = containerRef.current;
      if (el) {
        el.scrollLeft = 0;
        el.scrollTop = 0;
      }
    }, [zoomed]);

    // 导出时强制进入原始尺寸（保证截图清晰）
    useImperativeHandle(
      ref,
      () => ({
        prepareForExport: async () => {
          const wasZoomed = zoomed;
          setZoomed(true);
          await new Promise((r) => requestAnimationFrame(() => r(undefined)));
          await new Promise((r) => requestAnimationFrame(() => r(undefined)));
          return () => {
            setZoomed(wasZoomed);
          };
        },
      }),
      [zoomed],
    );

    // 缩小态：fitScale 让简历视觉宽度 = 容器宽度（恰好适应左右宽度，无横向滚动）
    const fitScale = containerWidth > 0 ? containerWidth / RESUME_WIDTH : 1;

    // 默认进入缩小态时，比 fitScale 更小一圈，整体更紧凑，能看到更多内容
    // 放大态：scale = fitScale（100% 适应容器宽度）
    // 缩小态：scale = fitScale × SHRINK_RATIO（更紧凑）
    const SHRINK_RATIO = 0.7;
    const targetScale = fitScale * (zoomed ? 1 : SHRINK_RATIO);

    return (
      <div
        ref={containerRef}
        onClick={handleToggleZoom}
        className="relative bg-gradient-to-br from-blue-50/60 via-white to-cyan-50/60 rounded-xl p-4 border border-blue-100/60"
        style={{
          cursor: zoomed ? 'zoom-out' : 'zoom-in',
          // 缩小态：横向裁切（保证无滚动条）；放大态：横向滚动（超宽时）
          overflowX: zoomed ? 'auto' : 'hidden',
          overflowY: 'auto',
          maxHeight: zoomed ? 'none' : 'calc(100vh - 280px)',
        }}
        role="button"
        aria-label={zoomed ? '点击缩小预览' : '点击放大预览'}
        title={zoomed ? '点击缩小（紧凑显示）' : '点击放大（适应宽度）'}
      >
        {zoomed ? (
          // 放大态：scale = fitScale（100% 适应容器宽度，水平居中），超宽则横向滚动
          <div className="flex justify-center w-full">
            <div
              style={{
                width: `${RESUME_WIDTH}px`,
                transform: `scale(${fitScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.25s ease',
                marginBottom: `-${Math.round((1 - fitScale) * 1000)}px`,
              }}
            >
              <div id="resume-preview" className="bg-white rounded-lg shadow-2xl">
                <ResumeRenderer content={content} templateId={templateId} />
              </div>
            </div>
          </div>
        ) : (
          // 缩小态（默认，更紧凑）：scale = fitScale × 0.7，能看到更多简历内容
          <div className="flex justify-center w-full">
            <div
              style={{
                width: `${RESUME_WIDTH}px`,
                transform: `scale(${targetScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.25s ease',
                marginBottom: `-${Math.round((1 - targetScale) * 1000)}px`,
              }}
            >
              <div id="resume-preview" className="bg-white rounded-lg shadow-2xl">
                <ResumeRenderer content={content} templateId={templateId} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
