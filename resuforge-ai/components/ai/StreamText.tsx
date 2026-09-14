'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface StreamTextProps {
  onComplete?: (text: string) => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function StreamText({
  onComplete,
  onCancel,
  placeholder = 'AI 正在生成内容...',
}: StreamTextProps) {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [text]);

  const handleAccept = () => {
    if (onComplete) {
      onComplete(text);
    }
  };

  const handleRegenerate = () => {
    setText('');
    setIsStreaming(true);
    setError(null);
    // 触发重新生成
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="border border-cyan-500/30 bg-cyan-950/20 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {isStreaming ? (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            )}
            <span className="sr-only">Status</span>
          </span>
          <span className="text-sm text-cyan-400">
            {isStreaming ? 'AI 正在生成...' : '生成完成'}
          </span>
        </div>
        {!isStreaming && (
          <span className="text-xs text-slate-500">
            {text.length} 字符
          </span>
        )}
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="min-h-[80px] max-h-[200px] overflow-y-auto text-sm text-slate-200 whitespace-pre-wrap leading-relaxed"
      >
        {text || (
          <span className="text-slate-500 italic">{placeholder}</span>
        )}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-400 bg-red-950/30 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* Actions */}
      {!isStreaming && !error && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
          <Button
            size="sm"
            onClick={handleAccept}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950"
          >
            ✓ 应用建议
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRegenerate}
            className="border-slate-700 hover:bg-slate-800"
          >
            🔄 重新生成
          </Button>
        </div>
      )}

      {isStreaming && onCancel && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700/50">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsStreaming(false);
              onCancel();
            }}
            className="border-slate-700 hover:bg-slate-800 text-slate-400"
          >
            取消
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * 流式输出 Hook
 */
export function useStreamAI() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const startStream = async (
    content: string,
    type: string,
    onChunk?: (chunk: string) => void,
    onComplete?: (fullText: string) => void,
    onError?: (error: string) => void
  ) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 重置状态
    setIsStreaming(true);
    setText('');
    setError(null);

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // 解析 SSE 数据
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'chunk') {
                fullContent = data.fullContent;
                setText(fullContent);
                onChunk?.(data.content);
              } else if (data.type === 'done') {
                setIsStreaming(false);
                onComplete?.(fullContent);
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // 请求被取消
        setIsStreaming(false);
      } else {
        setIsStreaming(false);
        setError(err.message || '生成失败');
        onError?.(err.message || '生成失败');
      }
    }
  };

  const cancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  const reset = () => {
    setText('');
    setError(null);
    setIsStreaming(false);
  };

  return {
    isStreaming,
    text,
    error,
    startStream,
    cancel,
    reset,
  };
}
