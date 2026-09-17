'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';

/**
 * 检查后端登录态：调用 /api/auth/me
 * - 成功：authStatus 设为 'valid'，更新 user
 * - 失败：authStatus 设为 'invalid'，清空 user/token
 *
 * 整个应用只调用一次（防止每次路由切换都发请求）
 */
let validationPromise: Promise<boolean> | null = null;

export function validateAuth(): Promise<boolean> {
  if (validationPromise) return validationPromise;

  const { setAuthStatus, setUser, logout, authStatus } = useAuthStore.getState();

  // 如果已经验证过，直接返回缓存结果
  if (authStatus === 'valid') {
    return Promise.resolve(true);
  }

  validationPromise = (async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        try {
          const json = await res.json();
          const user = json?.data;
          if (user) {
            setUser(user);
            setAuthStatus('valid');
            return true;
          }
        } catch (parseError) {
          console.error('Auth response parse error:', parseError);
        }
      }

      // 401 / 404 / 其他失败：清掉状态
      // 404 表示路由未就绪（例如服务刚启动），不要触发 logout 调用
      if (res.status !== 404) {
        try {
          await logout();
        } catch (e) {
          console.error('Logout cleanup failed:', e);
        }
      } else {
        // 路由未就绪时，只清状态不调 logout
        setUser(null);
        setAuthStatus('invalid');
      }
      validationPromise = null;
      return false;
    } catch (error) {
      console.error('Auth validation failed:', error);
      validationPromise = null;
      return false;
    }
  })();

  return validationPromise;
}

/**
 * 重置验证缓存（登录成功后调用）
 */
export function resetAuthValidation() {
  validationPromise = null;
}

/**
 * Hook：在组件挂载时执行登录态校验
 */
export function useAuthCheck() {
  const authStatus = useAuthStore((s) => s.authStatus);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (authStatus === 'unknown') {
      validateAuth().finally(() => {
        if (mounted) setChecking(false);
      });
    } else {
      setChecking(false);
    }

    return () => {
      mounted = false;
    };
  }, [authStatus]);

  return { authStatus, checking };
}
