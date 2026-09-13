'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { user, token, _hasHydrated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (mounted && _hasHydrated) {
        if (!user || !token) {
          router.push('/login');
        }
      }
    }, [user, token, _hasHydrated, mounted, router]);

    // Avoid hydration mismatch by rendering loading on server and initial client render
    if (!mounted || !_hasHydrated) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
            <p className="text-slate-400 mt-4">加载中...</p>
          </div>
        </div>
      );
    }

    if (!user || !token) {
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
    const { user, token, _hasHydrated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (mounted && _hasHydrated) {
        if (user && token) {
          router.push('/dashboard');
        }
      }
    }, [user, token, _hasHydrated, mounted, router]);

    // Avoid hydration mismatch by rendering loading on server and initial client render
    if (!mounted || !_hasHydrated) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
            <p className="text-slate-400 mt-4">加载中...</p>
          </div>
        </div>
      );
    }

    if (user && token) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
}
