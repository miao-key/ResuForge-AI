'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { validateAuth } from '@/lib/auth/use-auth-check';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { user, _hasHydrated, authStatus } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted || !_hasHydrated) return;

      // 如果状态未知，发起后端校验
      if (authStatus === 'unknown') {
        validateAuth().finally(() => setChecked(true));
      } else {
        setChecked(true);
      }
    }, [mounted, _hasHydrated, authStatus]);

    useEffect(() => {
      if (!checked) return;
      // 验证失败 -> 跳登录页
      if (authStatus === 'invalid' || !user) {
        router.push('/login');
      }
    }, [checked, authStatus, user, router]);

    // 等待水合 / 验证
    if (!mounted || !_hasHydrated || !checked) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent"></div>
            <p className="text-blue-500 mt-4">加载中...</p>
          </div>
        </div>
      );
    }

    if (authStatus !== 'valid' || !user) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
}

export function withGuest<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function GuestComponent(props: P) {
    const router = useRouter();
    const { user, _hasHydrated, authStatus } = useAuthStore();
    const [mounted, setMounted] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!mounted || !_hasHydrated) return;

      if (authStatus === 'unknown') {
        validateAuth().finally(() => setChecked(true));
      } else {
        setChecked(true);
      }
    }, [mounted, _hasHydrated, authStatus]);

    useEffect(() => {
      if (!checked) return;
      // 后端确认有效 -> 跳 dashboard
      if (authStatus === 'valid' && user) {
        router.push('/dashboard');
      }
    }, [checked, authStatus, user, router]);

    if (!mounted || !_hasHydrated || !checked) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-400 border-r-transparent"></div>
            <p className="text-blue-500 mt-4">加载中...</p>
          </div>
        </div>
      );
    }

    if (authStatus === 'valid' && user) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
}
