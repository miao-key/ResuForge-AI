'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { user, token, checkAuth } = useAuthStore();

    useEffect(() => {
      checkAuth();
      
      if (!token) {
        router.push('/login');
      }
    }, [token, router, checkAuth]);

    if (!user || !token) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
