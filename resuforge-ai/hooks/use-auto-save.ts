'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDebounce } from './use-debounce';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions<T> {
  /** 要保存的数据 */
  data: T;
  /** 保存函数 (接收最新数据) */
  onSave: (data: T) => Promise<boolean>;
  /** 防抖延迟 (毫秒),默认 3000 */
  delay?: number;
  /** 是否启用自动保存,默认 true */
  enabled?: boolean;
  /** 数据变更时才保存的判断函数,返回 true 表示有变化 */
  isEqual?: (a: T, b: T) => boolean;
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  /** 立即保存 (绕过防抖) */
  saveNow: () => Promise<void>;
  /** 重置错误状态 */
  reset: () => void;
}

/**
 * 自动保存 Hook
 *
 * 用法:
 * const { status, lastSavedAt, saveNow } = useAutoSave({
 *   data: content,
 *   onSave: async (data) => {
 *     const res = await resumeApi.update(id, data);
 *     return res.success;
 *   },
 *   delay: 3000,
 * });
 *
 * - data 每次变化,经过 delay 毫秒后触发保存
 * - 只在数据真正变化时才触发 (通过 isEqual 判断)
 * - 状态机: idle -> saving -> saved | error
 * - error 状态会自动在 5 秒后重置
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 3000,
  enabled = true,
  isEqual,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // 用于对比的引用
  const initialDataRef = useRef<T>(data);
  const lastSavedDataRef = useRef<T>(data);
  const isFirstRunRef = useRef(true);

  /**
   * 默认浅比较
   */
  const defaultEqual = useCallback((a: T, b: T) => {
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
      return a === b;
    }
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }, []);

  const equal = isEqual || defaultEqual;

  /**
   * 实际保存函数
   */
  const performSave = useCallback(async (dataToSave: T) => {
    setStatus('saving');
    try {
      const ok = await onSave(dataToSave);
      if (ok) {
        setStatus('saved');
        setLastSavedAt(new Date());
        lastSavedDataRef.current = dataToSave;
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Auto-save error:', err);
      setStatus('error');
    }
  }, [onSave]);

  // 防抖的保存函数
  const debouncedSave = useDebounce(performSave, delay);

  /**
   * 监听数据变化
   */
  useEffect(() => {
    if (!enabled) return;

    // 首次运行只设置初始数据,不触发保存
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      initialDataRef.current = data;
      lastSavedDataRef.current = data;
      return;
    }

    // 如果数据没有变化,跳过
    if (equal(data, lastSavedDataRef.current)) {
      return;
    }

    debouncedSave(data);
  }, [data, enabled, equal, debouncedSave]);

  /**
   * 错误状态 5 秒后自动重置回 idle
   */
  useEffect(() => {
    if (status !== 'error') return;
    const timer = setTimeout(() => setStatus('idle'), 5000);
    return () => clearTimeout(timer);
  }, [status]);

  /**
   * 手动立即保存 (绕过防抖)
   */
  const saveNow = useCallback(async () => {
    await performSave(data);
  }, [performSave, data]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setStatus('idle');
  }, []);

  return {
    status,
    lastSavedAt,
    saveNow,
    reset,
  };
}
